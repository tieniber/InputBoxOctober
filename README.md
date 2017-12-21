---
typora-copy-images-to: ./assets
typora-root-url: .
---

![badge](https://img.shields.io/badge/mendix-5.19.0-green.svg)
![badge](https://img.shields.io/badge/mendix-6.10.9-green.svg)
![badge](https://img.shields.io/badge/mobile-friendly-green.svg)

# Custom Input Mask

##### (formerly known as InputBoxOctober)

![FA11D81D-B007-4D28-84F0-D0485DE4175D](/assets/FA11D81D-B007-4D28-84F0-D0485DE4175D.png)


### Installation

1. Install the widget in your project

2. Include the **Custom Input Mask** widget on a page where you'd like to display your masked string

3. Configure the widget properties:
    ![939DA8EA-75BA-4114-954F-40D168B85023](/assets/939DA8EA-75BA-4114-954F-40D168B85023.png)

    - `Show Label` : Whether to display the label
    - `Label` : the Label
    - `Label Width` : the width of the label (corresponds to a `col-md-{number}` class) **Leave as 0 to inherit from the previous sibling.
    - `Editable` : should the value be editable or read only?

    ![F3DEF1C8-FC96-4FA5-9A90-878A974301BA](/assets/F3DEF1C8-FC96-4FA5-9A90-878A974301BA.png)

    * `Attribute` : the Attribute to display/edit
    * `Use Dynamic Mask` : choose **yes** to have the mask be a result of a microflow
    * `Mask microflow` : microflow that returns the mask string
    * `Mask` : the mask string (if not using microflow)

    ![2F3FFB19-8CCE-4C43-91C7-C381F5D2B69C](/assets/2F3FFB19-8CCE-4C43-91C7-C381F5D2B69C.png)

    * `Placeholder Character` : use a character other than the default `_` as your placeholder
    * `Custom Mask Placeholder` : use your own requirements for the mask **Update coming soon
    * `Custom Mask Definition` : define your requirements **Update coming soon
    * `On Leave Microflow` : execute a microflow when the input loses focus

### Typical usage scenario

- To enforce formatting rules like phone numbers, social security numbers, zip/postal codes, etc.

### Known Limitations

- Only one custom mask placeholder may be defined for now **Update coming soon

###### Based on the Mendix Widget Boilerplate

See [AppStoreWidgetBoilerplate](https://github.com/mendix/AppStoreWidgetBoilerplate/) for an example
