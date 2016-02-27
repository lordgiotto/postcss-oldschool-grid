# Old School Grid

Trustworthy **postcss grid system** we learnt to love, with wrapping columns and padding gutters.


[Visit official website for live demo and documentation](https://lordgiotto.github.io/postcss-oldschool-grid/)

---

*   [Intro](#intro)
*   [Install](#install)
*   [Example](#example)
*   [Options](#options)
*   [Functions](#functions)

<div id="intro"></div>

# What's that?

**postcss-oldschool-grid** is a <a href="">postcss</a> plugin that provide an easy to use and intuitive grid system based on padding gutters and wrapping columns.


_No calc()_, _no right margins with :last-child and :nth-child()_, **simply nested containers with padding gutters**.


Under the hood it behave like Bootstrap grid system, so all you have to do is to put content inside a column, put the column inside a row and eventually put the row inside a wrapper. Easy! :)

<div id="example"></div>

# Example

![postcss-oldschool-grid](https://raw.githubusercontent.com/lordgiotto/postcss-oldschool-grid/master/example.png)

<div id="install"></div>

# Install

First of all you have to install and configure **postcss** in order to use this plugin: if you don't know what f***ing I'm talking about, take a look to the [guide on the postcss github page](https://github.com/postcss/postcss#usage).

Next step is to use npm to instll **postcss-oldschool-grid**:
```
$ npm install postcss-oldschool-grid`
```
And add it to your postcss processors:
```js
var osg = require('postcss-oldschool-grid');
...
postcss([ osg({config}) ])
...
```

<div id="options"></div>

# Options

There are two ways to configure postcss-oldschool-grid:

*   Pass an object as parameter when you call the processor
```js
var config = {     
    wrapperWidth: '40px';     
    gutterWidth: '20px',     
    totalColumns: 16
}
...
postcss([ osg(config) ]);
```
*   Set options in the CSS, inside the special at-rule **@grid** (you can use either camelCase or param-case)
```css
@grid {     
    wrapper-width: 40px;     
    gutter-width: 20px;     
    total-columns: 16
}
```

## totalColumns

<small>Accepted Values: _string_, _number_</small> <small>Default Value: _12_</small>

Set the total number of columns used to calculate the grid.

## wrapperWidth

<small>Accepted Values: _string_, _number_</small> <small>Default Value: _"1024px"_</small>

Set the width of @wrapper element

## wrapperPadding

<small>Accepted Values: _string_, _number_, _true|false_</small> <small>Default Value: _Inherit form GutterWidth_</small>

Set the padding of @wrapper element, so its external gutter. If setted to _true_ it will inherit gutterWidth; if false it will be removed.

## gutterWidth

<small>Accepted Values: _string_, _number_</small> <small>Default Value: _"30px"_</small>

The gutter width used in the grid.

## verticalSpace

<small>Accepted Values: _string_, _number_, _true|false_</small> <small>Default Value: _Not set_</small>

Set the vertical space between columns and rows.

## debugMode

<small>Accepted Values: _true|false_</small> <small>Default Value: _false_</small>

Activate debug mode for all rows: a background rappresenting the grid will be applied (like the exemple in this page).

<div id="functions"></div>

# Functions

## @wrapper [width]

<small>[width]: _Width of the wrapper_</small>

Create a wrapper, fluid and centered in the page.  
It also add border-box property to the element and all the children.
```css
.wrapper {     
    @wrapper 960px;
}
```
compiles:
```css
.wrapper{     
    width: 100%;     
    margin-left: auto;     
    margin-right: auto;     
    max-width: 960px;     
    padding-left: 30px;     
    padding-right: 30px;     
    box-sizing: border-box;
}
.wrapper *, .wrapper *:after, .wrapper *:before {     
    box-sizing: border-box;
}
```

## @row

Create a row: better to use inside the wrapper, because it applies a negative margin to compensate wrapper and columns padding.  
It also adds a clearfix.
```css
.row {     
@row;
}
```
compiles:
```css
.row{     
    width: 100%;     
    padding-left: 15px;     
    padding-right: 15px;     
    margin-left: -30px;     
    margin-right: -30px;     
    zoom: 1;
}
.row:after {     
    content: "";     
    display: table;     
    clear: both;
}
.row:before {     
    content: "";     
    display: table;
}
```

## @col [number]

<small>[number]: _The number of cols to span this element._</small>

Span the element for [number] cols.
```css
.col {     
    @col 960px;
}
```
compiles
```css
.col{     
    position: relative;     
    float: left;     
    width: 33.33333333333333%;     
    padding-left: 15px;     
    padding-right: 15px;
}
```

## @pull [number] or @push [number]

<small>[number]: _The number of cols to pull or push this element_</small>

Pull or push the element for [number] cols. Uses relative position and right or left properties.
```css
.push {     
    @push 2;
}
```
compiles:
```css
.push {     
    left: 16.666666666666664%;
}
```

## @clearfix

Utility to add a clearfix to an element.

## @borderbox or @border-box

Utility to set an element and his children in _box-sizing: border-box;_.  
**If used outside any selector, il will apply border-box globally.**
```css
@borderbox;
```
compiles:
```css
*, *:after, *:before {     
    box-sizing: border-box;
}
```


## @debug-grid

Utility to debug the grid with background guides.  
**Apply it only to a row element to prevent unexpected behaviours.**

### Contacts

*   [twitter](https://twitter.com/LordGiotto)
*   [linkedin](https://it.linkedin.com/in/lorenzozottar)
*   [behance](https://www.behance.net/lordgiotto)
