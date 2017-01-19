/*global logger*/
/*
    InputBoxOctober
    ========================

    @file      : InputBoxOctober.js
    @version   : 1.0.0
    @author    : MC
    @date      : 10/10/2016
    @copyright : Mendix, bv
    @license   : Apache 2

    Documentation
    ========================
    An input box with the masking functionality found at http://digitalbush.com/projects/masked-input-plugin/, and has on-leave microflow functionality
*/

define([
    "dojo/_base/declare",
    "mxui/widget/_WidgetBase",
    "dijit/_TemplatedMixin",

    "mxui/dom",
    "dojo/dom",
    "dojo/dom-prop",
    "dojo/dom-geometry",
    "dojo/dom-class",
    "dojo/dom-style",
    "dojo/dom-construct",
    "dojo/_base/array",
    "dojo/_base/lang",
    "dojo/text",
    "dojo/html",
    "dojo/_base/event",

    "InputBoxOctober/lib/jquery",
    "InputBoxOctober/lib/jquery-maskedinput",
    "dojo/text!InputBoxOctober/widget/template/InputBoxOctober.html"
], function(declare, _WidgetBase, _TemplatedMixin, dom, dojoDom, dojoProp, dojoGeometry, dojoClass, dojoStyle, dojoConstruct, dojoArray, dojoLang, dojoText, dojoHtml, dojoEvent, _jQuery, _maskedInput, widgetTemplate) {

    "use strict";
    var $ = _jQuery.noConflict(true);

    // Declare widget's prototype.
    return declare("InputBoxOctober.widget.InputBoxOctober", [_WidgetBase, _TemplatedMixin], {
        templateString: widgetTemplate,

        //CACHES
        _hasStarted: false,
        subHandle: null,
        divNode: "",
        inputBox: "",
        handle: "",
        delay_timer: "",
        currValue: "",
        obj: null,
        maskString: "",
        customPH: "",
        customMaskChar: "",
        customMaskDef: "",
        useMicroflowForMask: false,
        microflowName: "",

        //dijit._WidgetBase.postCreate is called after constructing the widget. Implement to do extra setup work.
        postCreate: function() {
            this._hasStarted = true;
            this.connect(this.inputBox, "onblur", dojoLang.hitch(this, this._onLeave));
            if (this.onleavemf) {
                this.connect(this.inputBox, "onfocus", dojoLang.hitch(this, this._eventInputFocus));
            }
            if (this.maskString) {
                if (this.customMaskChar && this.customMaskDef) {
                    $.mask.definitions[this.customMaskChar] = this.customMaskDef;
                }
                this._setMaskText(null, this.maskString);
            } else if (this.useMicroflowForMask) {
                var self = this;
                mx.data.action({
                    params: {
                        actionname: this.microflowName,
                    },
                    callback: function(res) {
                        // console.log(res);
                        self._setMaskText(null, res);
                    },
                    error: function(err) {
                        console.log(err);
                    }
                });
            }
        },

        // mxui.widget._WidgetBase.update is called when context is changed or initialized. Implement to re-render and / or fetch data.
        update: function(obj, callback) {
            this.obj = obj;
            if (obj !== null) {
                dojoStyle.set(this.domNode, "display", "inline");
                if (this.maskString) {
                    if (this.customMaskChar && this.customMaskDef) {
                        $.mask.definitions[this.customMaskChar] = this.customMaskDef;
                    }
                    this._setMaskText(obj, this.maskString);
                } else if (this.useMicroflowForMask) {
                    var self = this;
                    mx.data.action({
                        params: {
                            actionname: this.microflowName,
                        },
                        callback: function(res) {
                            // console.log(res);
                            self._setMaskText(obj, res);
                        },
                        error: function(err) {
                            console.log(err);
                        }
                    });
                }
            } else {
                dojoStyle.set(this.domNode, "display", "none");
            }


            if (callback) {
                callback();
            }
        },

        _eventInputFocus: function() {
            dojoClass.add(this.inputBox, "MxClient_formFocus");
        },

        _onLeave: function() {
            if (this.maskString) {
                $(this.inputBox).mask(this.maskString);
            }
            if (this.inputBox.value !== this.maskString) {
                //if (this.obj.get(this.name) !== this.inputBox.value)
                this.obj.set(this.name, this.inputBox.value);
                mx.data.save({
                    mxobj: this.obj,
                    callback: dojoLang.hitch(this, function() {})
                });
            }
            this.delay_timer = null;
            this._executeMicroflow(this.onleavemf);
        },

        _executeMicroflow: function(mf) {
            if (mf && this.obj) {
                mx.data.action({
                    store: {
                        caller: this.mxform
                    },
                    params: {
                        actionname: mf,
                        applyto: "selection",
                        guids: [this.obj.getGuid()]
                    },
                    callback: function() {
                        // ok
                    },
                    error: function() {
                        logger.error("InputBoxOctober.widget.InputBoxOctober.executeMicroFlow: XAS error executing microflow");
                    }
                });
            }
        },

        _setMaskText: function(obj, maskString) {
            dojoProp.set(this.inputBox, "value", "");
            if (obj != null) {
                if (obj.get(this.name) == "") {
                    dojoProp.set(this.inputBox, "placeholder", maskString);
                } else {
                    dojoProp.set(this.inputBox, "value", this.obj.get(this.name));
                }
            }

            if (this.customPH) {
                $(this.inputBox).mask(maskString, {
                    placeholder: this.customPH
                });
            } else {
                $(this.inputBox).mask(maskString);
            }
        }
    });
});

require(["InputBoxOctober/widget/InputBoxOctober"]);
