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

        //modeler
        label: null,
        labelWidth: null,
        inputsNode: null,
        editable: null,

        //CACHES
        _hasStarted: false,
        subHandle: null,
        divNode: "",
        inputBox: "",
        handle: "",
        obj: null,
        maskString: "",
        customPH: "",
        customMaskChar: "",
        customMaskDef: "",
        useMicroflowForMask: false,
        microflowName: "",

        //dijit._WidgetBase.postCreate is called after constructing the widget. Implement to do extra setup work.
        postCreate: function() {
            this._clearValidations();
            this._hasStarted = true;
            this.connect(this.inputBox, "onblur", dojoLang.hitch(this, this._onLeave));
            if (this.onleavemf) {
                this.connect(this.inputBox, "onfocus", dojoLang.hitch(this, this._eventInputFocus));
            }
            if (this.showLabel && this.label) {
                dojoClass.add(this.domNode, "form-group");
                this._addLabel();
            } else {
                this.labelNode.style.display = "none";
            }
        },

        // mxui.widget._WidgetBase.update is called when context is changed or initialized. Implement to re-render and / or fetch data.
        update: function(obj, callback) {
            this.obj = obj;
            this._maskSettings = {
                placeholder: this.customPH ? this.customPH : undefined
            };
            if (this.customMaskChar && this.customMaskDef) {
                $.mask.definitions[this.customMaskChar] = this.customMaskDef;
            }
            this._getMask()
                .then(dojoLang.hitch(this, this._applyMask))
                .then(dojoLang.hitch(this, function() {
                    this._resetSubscriptions();
                    this._updateRendering();
                    if (callback) {
                        callback();
                    }
                }));
        },
        _applyMask: function(mask) {
            return new Promise(dojoLang.hitch(this, function(resolve) {
                $(this.inputBox).mask(mask, this._maskSettings);
                resolve();
            }));
        },

        _getMask: function() {
            return new Promise(dojoLang.hitch(this, function(resolve, reject) {
                if (this.maskString) {
                    resolve(this.maskString);
                } else if (this.useMicroflowForMask) {
                    mx.data.action({
                        params: {
                            actionname: this.microflowName,
                            applyto: this.obj ? "selection" : undefined,
                            guids: this.obj ? [this.obj.getGuid()] : undefined
                        },
                        callback: dojoLang.hitch(this, function(res) {
                            // console.log(res);
                            resolve(res);
                        }),
                        error: function(err) {
                            reject(err);
                        }
                    });
                }
            }));
        },

        _eventInputFocus: function() {
            dojoClass.add(this.inputBox, "MxClient_formFocus");
        },

        _onLeave: function() {
            this._applyMask().then(dojoLang.hitch(this, function() {
                this.obj.set(this.name, this.inputBox.value);
                this._executeMicroflow(this.onleavemf);
            }));
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

        _updateRendering: function() {
            // dojoProp.set(this.inputBox, "value", "");
            if (this.obj !== null) {
                if (this.obj.get(this.name) === "") {
                    // dojoProp.set(this.inputBox, "placeholder", maskString);
                } else {
                    dojoProp.set(this.inputBox, "value", this.obj.get(this.name));
                }
                this.inputBox.readOnly = this.inputBox.disabled = !this.editable;
            }

        },

        /**
         * ResetSubscriptions
         * ---
         * Sets a validation and attribute subscription
         * 
         * @author Conner Charlebois
         * @since Dec 11, 2017
         */
        _resetSubscriptions: function() {
            this.unsubscribeAll();
            this.subscribe({
                guid: this.obj.getGuid(),
                attr: this.name,
                callback: dojoLang.hitch(this, function(guid, attr, attrValue) {
                    // console.debug(arguments);
                    // the GUID of the object that changed
                    // the attribute name of the attribute whose value changed
                    // the new value of the attribute
                    this._clearValidations();
                    this._updateRendering();
                })
            });
            this.subscribe({
                guid: this.obj.getGuid(),
                val: true,
                callback: dojoLang.hitch(this, function(validations) {
                    // console.debug(arguments);
                    // an array of validation objects, per object
                    // validations[0] is the feedback
                    // validations[0].getGuid() --> the obect guid
                    // validations[0].getAttributes() --> the list of attributes with errors
                    // validations[0].getReasonByAttribute({attrName}) --> the message for field `attrName`
                    var val = validations[0],
                        validationText = val.getReasonByAttribute(this.name);
                    if (validationText) {
                        dojoClass.add(this.domNode, "has-error");
                        this.errorNode.innerText = validationText;
                        dojoStyle.set(this.errorNode, "display", "block");
                    } else {
                        this._clearValidations();
                    }
                })
            });
        },

        /**
         * Clear Validations
         * ---
         * Clears the validation node (this.errorNode)
         * 
         * @author Conner Charlebois
         * @since Dec 11, 2017
         */
        _clearValidations: function() {
            dojoStyle.set(this.errorNode, "display", "none");
        },
        /**
         * Add Label
         * ---
         * Intelligently add the label
         * 
         * @author Conner Charlebois
         * @since Dec 11, 2017
         */
        _addLabel: function() {
            this.labelNode.innerText = this.label;
            if (this.labelWidth === 0) {
                console.debug("trying to infer column width...");
                if (this.domNode.previousElementSibling) {
                    console.debug("checking previous element sibling...");
                    if (dojoClass.contains(this.domNode.previousElementSibling, "form-group")) {
                        console.debug("previous element sibling is a form group!");
                        if (dojoClass.contains(this.domNode.previousElementSibling.firstElementChild, "control-label")) {
                            console.debug("found a width!");
                            var widthClass = this.domNode.previousElementSibling.firstElementChild.className.match(/col-sm-\d+/);
                            var width = widthClass && widthClass[0] && widthClass[0].split("-")[2];
                            if (width && !isNaN(width * 1)) {
                                console.debug("valid width!");
                                dojoClass.add(this.labelNode, "col-sm-" + width);
                                dojoClass.add(this.inputsNode, "col-sm-" + (12 - width));
                            }
                        }
                    }
                }
            } else {
                dojoClass.add(this.labelNode, "col-sm-" + this.labelWidth);
                dojoClass.add(this.inputsNode, "col-sm-" + (12 - this.labelWidth));
            }

        },
    });
});

require(["InputBoxOctober/widget/InputBoxOctober"]);