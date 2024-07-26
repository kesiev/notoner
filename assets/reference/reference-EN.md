# Notoner JSON descriptor files quick reference

Notoner uses JSON descriptors to describe a table, whether it is a table template or a table save file.

```
{
	"meta": {
		(Table metadata)
	},
	"data": [
		(Table elements)
	]
}
```

In this guide some attribute names are described as `attribute.subAttribute`: these should be coded as `{ "attribute": { "subAttribute": ... } }`.

## Medata structure

The `meta` attribute of a Notoner JSON file is an object that collects some general attributes of the table, such as its name, the expected number of players, or some links to help the user find useful information.

Name | Type | Description |
--- | --- | --- | 
title | [Text](#text-structure) | Table name. |
author | [Text](#text-structure) | Table author. If it is a game, put the game author's name (or names) here. Otherwise, put your name here or leave it out. |
license | [Text](#text-structure) | Table license. If necessary, specify under which license this media is distributed. |
licenseUrl | [Translated URL](#translated-url-structure) | License URL. If you have specified a license, you can also specify a web address to find more details. |
players | [Text](#text-structure) | Players count. Enter a number (such as 1), a list (such as 2,4,6), or a range (such as 3-6). If it supports any number of players, write "Any". |
description | [Text](#text-structure) | Short table description. |
url | [Translated URL](#translated-url-structure) | A URL to find out more about what's on this table. You may leave it out. |
manualUrl | [Translated URL](#translated-url-structure) | A URL to find out how to play the game on this table. You may leave it out. |

### Procedural generators

Notoner allows templates to procedurally generate a table via JavaScript. To do this you need to add the `generator` attribute to the root of the JSON descriptor indicating the JavaScript file to use. It is also possible to specify a basic configuration, which will be passed to the generator upon invocation via the `settings` attribute.

```
{
	"meta": {
		(Table metadata)
	},
	"data": [
		(Table elements)
	]
	"generator": "generator.js",
	"settings": {
		"attribute1": "value1",
		"attribute2": "value2",
		(More attributes)
	}
}
```

The `generator.js` file is structured like this:

```
GENERATOR=(function(){
	return {
		run:(self, json, sub, cb)=>{
			// json: contains the selected table structure.
			// sub: contains the selected sub-template details.
			// sub.settings: contains JSON descriptor settings attribute value.

			// Once you've manipulated the json object:
			cb(json);
		}
	}
})();
```


### Sub-templates

Notoner allows templates to offer _variants_ called _sub-templates_, which the user can select by navigating the template selector. A sub-template is defined by two object hierarchies: one in the `meta` section which defines its description and one which starts from the root of the JSON descriptor which defines the elements to be added to the `data` and `settings` sections when selected.

```
{
	"meta": {
		(Table metadata)
		"subtemplates": [
			{
				"id": "subtemplate1",
				"meta": [ ... ]
			},
			{
				"id": "subtemplate2",
				"meta": [ ... ],
				"subtemplates": [ ... ]
			},
			(More sub-template descriptions)
		]
	},
	"data": [
		(Table elements)
	],
	"subtemplates": [
		{
			"id": "subtemplate1",
			"data": [ ... ],
			"settings": { ... }
		},
		{
			"id": "subtemplate2",
			"data": [ ... ],
			"settings": { ... },
			"subtemplates":{ ... }
		}
		(More sub-templates)
	}
}
```

The details of these sub-templates will need to be described by the `subtemplates` attribute to be added to the `meta` attribute at the root of the JSON descriptor:

Name | Type | Description |
--- | --- | --- | 
subtemplates |  | (For templates only) Sub-templates list. |
&nbsp;&nbsp;&nbsp;subtemplates[].id | `string` | Sub-template identifier. |
&nbsp;&nbsp;&nbsp;subtemplates[].isDefault | `boolean` | If `TRUE`, select this sub-templated if not specified by the user. |
&nbsp;&nbsp;&nbsp;subtemplates[].meta |  | Sub-template information. |
&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;subtemplates[].meta.title | `string` | Sub-template name. |
&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;subtemplates[].meta.description | `string` | Sub-template description. |
&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;subtemplates[].meta.subtemplates | Sub-template | Further sub-templates. Follows the `subtemplates` structure. |

## Elements

Each element is defined by the same JSON structure:

```
{
	"type": (Element type identifier),
	"data": {
		(Element attributes)
	}
}
```

The same element can offer multiple identifiers, each representing its variant.

_Unlike save files, templates can specify an extra `zIndex` attribute in addition to `type` and `data`: elements will be reordered based on their `zIndex` when the table is generated, allowing you to break the sequence specified in the JSON descriptor `data` attribute. This technique gives greater control over the elements positioning to the sub-templates, allowing them to be mixed with others in a fixed position._

### Standard calculator

An ancient device used to perform mathematical calculations.

#### Type identifiers

 * `"calculator-landscape"`
 * `"calculator-portrait"`

#### Tags assigned by default

 * `"type:calculator"`

#### Supported macro events

 * `reset`

#### Attributes

Name | Type | Description |
--- | --- | --- | 
state |  | Calculator state. (Automatically managed) |
x | `float` (in mm) | Horizontal coordinate. |
y | `float` (in mm) | Vertical coordinate. |
tags | `[` `string` `,` `string` `,` ... `]` | List of tags by which it can be identified by other elements. |
zIndexGroup | `integer` | Depth group. The user will not be able to move elements with a lower value over elements with a higher value. (Default: `0`) |
fence | [Area](#area-structure) | Prevents the element from moving outside the specified area. |
snapTo |  | Establishes the positioning rules to follow when the element is moved. |
&nbsp;&nbsp;&nbsp;snapTo.tags | `[` `string` `,` `string` `,` ... `]` | Align the element to the elements with the specified tags. |
&nbsp;&nbsp;&nbsp;snapTo.grid | [Grid](#grid-structure) | Align the element to a grid. |
doNotFrame | `boolean` | If `TRUE`, excludes the element when the table is completely framed. |
onResetMacro | [Macro](#macro-structure) | Macro to run when the table is created or reset. |
onDropMacro | [Macro](#macro-structure) | Macro to run when the element is moved. |
onSelectMacro | [Macro](#macro-structure) | Macro to run when the element is selected. |
onShakeMacro | [Macro](#macro-structure) | Executes a macro when it is shaken. |
onClickMacro | [Macro](#macro-structure) | Macro to run when the element is clicked. |
onMenuMacros | `[` [Macro option](#macro-option-structure) `,` [Macro option](#macro-option-structure) `,` ... `]` | If the element supports the context menu, it shows additional options that allow you to run a macro. |
isVariableZIndex | `boolean` | If `TRUE`, it is brought to the front when selected. |
isDragTopSurfaces | `boolean` | If `TRUE`, the elements above will be transported when the element is moved. |
isDraggable | `boolean` | If `TRUE`, it can be moved by dragging. |
icon | `FALSE` to hide it, `TRUE` to use default values, or [Image](#image-structure) | Element icon. |
backgroundColor | [Color](#color-structure) | Base color of the element. |
messages |  | Calculator messages. |
&nbsp;&nbsp;&nbsp;messages.clearMemory | `FALSE` to hide it or [Option](#menu-option-structure) | Menu option to show to clear memory. |
&nbsp;&nbsp;&nbsp;messages.reset | `FALSE` to hide it or [Option](#menu-option-structure) | Menu option to show to reset the calculator. |
&nbsp;&nbsp;&nbsp;messages.memoryCleared | `FALSE` to hide it or [Message](#popup-message-structure) | Memory cleared message. |
&nbsp;&nbsp;&nbsp;messages.resetDone | `FALSE` to hide it or [Message](#popup-message-structure) | Reset done message. |

### Custom calculator

An ancient device used to perform mathematical calculations. (Customizable version)

#### Type identifiers

 * `"calculator-custom"`

#### Tags assigned by default

 * `"type:calculator"`

#### Supported macro events

 * `reset`

#### Attributes

Name | Type | Description |
--- | --- | --- | 
state |  | Calculator state. (Automatically managed) |
x | `float` (in mm) | Horizontal coordinate. |
y | `float` (in mm) | Vertical coordinate. |
tags | `[` `string` `,` `string` `,` ... `]` | List of tags by which it can be identified by other elements. |
zIndexGroup | `integer` | Depth group. The user will not be able to move elements with a lower value over elements with a higher value. (Default: `0`) |
fence | [Area](#area-structure) | Prevents the element from moving outside the specified area. |
snapTo |  | Establishes the positioning rules to follow when the element is moved. |
&nbsp;&nbsp;&nbsp;snapTo.tags | `[` `string` `,` `string` `,` ... `]` | Align the element to the elements with the specified tags. |
&nbsp;&nbsp;&nbsp;snapTo.grid | [Grid](#grid-structure) | Align the element to a grid. |
doNotFrame | `boolean` | If `TRUE`, excludes the element when the table is completely framed. |
onResetMacro | [Macro](#macro-structure) | Macro to run when the table is created or reset. |
onDropMacro | [Macro](#macro-structure) | Macro to run when the element is moved. |
onSelectMacro | [Macro](#macro-structure) | Macro to run when the element is selected. |
onShakeMacro | [Macro](#macro-structure) | Executes a macro when it is shaken. |
onClickMacro | [Macro](#macro-structure) | Macro to run when the element is clicked. |
onMenuMacros | `[` [Macro option](#macro-option-structure) `,` [Macro option](#macro-option-structure) `,` ... `]` | If the element supports the context menu, it shows additional options that allow you to run a macro. |
isVariableZIndex | `boolean` | If `TRUE`, it is brought to the front when selected. |
isDragTopSurfaces | `boolean` | If `TRUE`, the elements above will be transported when the element is moved. |
isDraggable | `boolean` | If `TRUE`, it can be moved by dragging. |
icon | `FALSE` to hide it, `TRUE` to use default values, or [Image](#image-structure) | Element icon. |
width | `float` (in mm) | Width. |
height | `float` (in mm) | Height. |
frame | `FALSE` to hide it, `TRUE` to use default values, or [Frame](#frame-structure) | Background block. |
display | `FALSE` to hide it, `TRUE` to use default values, or ([Frame](#frame-structure) + [Label](#text-label-structure)) | Display appearance. |
backgroundColor | [Color](#color-structure) | Base color of the element. |
keys | `[` `[` ([Frame](#frame-structure) + [Label](#text-label-structure)), ([Frame](#frame-structure) + [Label](#text-label-structure)), ... `],` `[` ... `]`, ... `]` | Appearance of each key, arranged into rows and columns. |
messages |  | Calculator messages. |
&nbsp;&nbsp;&nbsp;messages.clearMemory | `FALSE` to hide it or [Option](#menu-option-structure) | Menu option to show to clear memory. |
&nbsp;&nbsp;&nbsp;messages.reset | `FALSE` to hide it or [Option](#menu-option-structure) | Menu option to show to reset the calculator. |
&nbsp;&nbsp;&nbsp;messages.memoryCleared | `FALSE` to hide it or [Message](#popup-message-structure) | Memory cleared message. |
&nbsp;&nbsp;&nbsp;messages.resetDone | `FALSE` to hide it or [Message](#popup-message-structure) | Reset done message. |

### Default catapult

An element that launches one or more elements on top of another in a random position.

#### Type identifiers

 * `"catapult"`

#### Tags assigned by default

 * `"type:catapult"`

#### Supported macro events

 * `launch`
 * `setLastPoint`

#### Attributes

Name | Type | Description |
--- | --- | --- | 
lastPoint | [Point](#point-position-structure) | Coordinates on the target point on the table. |
x | `float` (in mm) | Horizontal coordinate. |
y | `float` (in mm) | Vertical coordinate. |
tags | `[` `string` `,` `string` `,` ... `]` | List of tags by which it can be identified by other elements. |
zIndexGroup | `integer` | Depth group. The user will not be able to move elements with a lower value over elements with a higher value. (Default: `0`) |
fence | [Area](#area-structure) | Prevents the element from moving outside the specified area. |
snapTo |  | Establishes the positioning rules to follow when the element is moved. |
&nbsp;&nbsp;&nbsp;snapTo.tags | `[` `string` `,` `string` `,` ... `]` | Align the element to the elements with the specified tags. |
&nbsp;&nbsp;&nbsp;snapTo.grid | [Grid](#grid-structure) | Align the element to a grid. |
doNotFrame | `boolean` | If `TRUE`, excludes the element when the table is completely framed. |
onResetMacro | [Macro](#macro-structure) | Macro to run when the table is created or reset. |
onDropMacro | [Macro](#macro-structure) | Macro to run when the element is moved. |
onSelectMacro | [Macro](#macro-structure) | Macro to run when the element is selected. |
onShakeMacro | [Macro](#macro-structure) | Executes a macro when it is shaken. |
onClickMacro | [Macro](#macro-structure) | Macro to run when the element is clicked. |
onMenuMacros | `[` [Macro option](#macro-option-structure) `,` [Macro option](#macro-option-structure) `,` ... `]` | If the element supports the context menu, it shows additional options that allow you to run a macro. |
isVariableZIndex | `boolean` | If `TRUE`, it is brought to the front when selected. |
isDragTopSurfaces | `boolean` | If `TRUE`, the elements above will be transported when the element is moved. |
isDraggable | `boolean` | If `TRUE`, it can be moved by dragging. |
icon | `FALSE` to hide it, `TRUE` to use default values, or [Image](#image-structure) | Element icon. |
backgroundColor | [Color](#color-structure) | Base color of the element. |
launchTags | `[` `string` `,` `string` `,` ... `]` | List of element tags that can be launched. |
launchOnTags | `[` `string` `,` `string` `,` ... `]` | Tag list of elements that can be used as a target. |
messages |  | Catapult messages. |
&nbsp;&nbsp;&nbsp;messages.setTarget | `FALSE` to hide it or [Option](#menu-option-structure) | Set target option. |
&nbsp;&nbsp;&nbsp;messages.launch | `FALSE` to hide it or [Option](#menu-option-structure) | Launch option. |

### Custom catapult

An element that launches one or more elements on top of another in a random position. (Customizable version)

#### Type identifiers

 * `"catapult-custom"`

#### Tags assigned by default

 * `"type:catapult"`

#### Supported macro events

 * `launch`
 * `setLastPoint`

#### Attributes

Name | Type | Description |
--- | --- | --- | 
lastPoint | [Point](#point-position-structure) | Coordinates on the target point on the table. |
x | `float` (in mm) | Horizontal coordinate. |
y | `float` (in mm) | Vertical coordinate. |
tags | `[` `string` `,` `string` `,` ... `]` | List of tags by which it can be identified by other elements. |
zIndexGroup | `integer` | Depth group. The user will not be able to move elements with a lower value over elements with a higher value. (Default: `0`) |
fence | [Area](#area-structure) | Prevents the element from moving outside the specified area. |
snapTo |  | Establishes the positioning rules to follow when the element is moved. |
&nbsp;&nbsp;&nbsp;snapTo.tags | `[` `string` `,` `string` `,` ... `]` | Align the element to the elements with the specified tags. |
&nbsp;&nbsp;&nbsp;snapTo.grid | [Grid](#grid-structure) | Align the element to a grid. |
doNotFrame | `boolean` | If `TRUE`, excludes the element when the table is completely framed. |
onResetMacro | [Macro](#macro-structure) | Macro to run when the table is created or reset. |
onDropMacro | [Macro](#macro-structure) | Macro to run when the element is moved. |
onSelectMacro | [Macro](#macro-structure) | Macro to run when the element is selected. |
onShakeMacro | [Macro](#macro-structure) | Executes a macro when it is shaken. |
onClickMacro | [Macro](#macro-structure) | Macro to run when the element is clicked. |
onMenuMacros | `[` [Macro option](#macro-option-structure) `,` [Macro option](#macro-option-structure) `,` ... `]` | If the element supports the context menu, it shows additional options that allow you to run a macro. |
isVariableZIndex | `boolean` | If `TRUE`, it is brought to the front when selected. |
isDragTopSurfaces | `boolean` | If `TRUE`, the elements above will be transported when the element is moved. |
isDraggable | `boolean` | If `TRUE`, it can be moved by dragging. |
icon | `FALSE` to hide it, `TRUE` to use default values, or [Image](#image-structure) | Element icon. |
width | `float` (in mm) | Width. |
height | `float` (in mm) | Height. |
guideLine | `FALSE` to hide it, `TRUE` to use default values, or [Frame](#frame-structure) | Shows a dashed line from the center point to the target point. |
frame | `FALSE` to hide it, `TRUE` to use default values, or [Frame](#frame-structure) | Background block. |
center | [Point](#point-position-structure) | Center position on the element. |
launchTags | `[` `string` `,` `string` `,` ... `]` | List of element tags that can be launched. |
launchOnTags | `[` `string` `,` `string` `,` ... `]` | Tag list of elements that can be used as a target. |
backgroundColor | [Color](#color-structure) | Base color of the element. |
isTargetLocked | `boolean` | If `TRUE`, the target point is locked and cannot be changed by the user. |
onShakeLaunch | `boolean` | If `TRUE`, the elements will be thrown when the element is shaken. |
onLaunchShake | `boolean` | If `TRUE`, elements should be shaken when thrown. |
messages |  | Catapult messages. |
&nbsp;&nbsp;&nbsp;messages.setTarget | `FALSE` to hide it or [Option](#menu-option-structure) | Set target option. |
&nbsp;&nbsp;&nbsp;messages.launch | `FALSE` to hide it or [Option](#menu-option-structure) | Launch option. |

### Default counter

An element that tracks a certain value.

#### Type identifiers

 * `"counter-normal"`
 * `"counter-small"`
 * `"counter-verysmall"`

#### Tags assigned by default

 * `"type:counter"`

#### Supported macro events

 * `reset`
 * `setValue`
 * `subtractValue`
 * `sumValue`

#### Attributes

Name | Type | Description |
--- | --- | --- | 
value | `integer` | Element value. |
x | `float` (in mm) | Horizontal coordinate. |
y | `float` (in mm) | Vertical coordinate. |
tags | `[` `string` `,` `string` `,` ... `]` | List of tags by which it can be identified by other elements. |
zIndexGroup | `integer` | Depth group. The user will not be able to move elements with a lower value over elements with a higher value. (Default: `0`) |
fence | [Area](#area-structure) | Prevents the element from moving outside the specified area. |
snapTo |  | Establishes the positioning rules to follow when the element is moved. |
&nbsp;&nbsp;&nbsp;snapTo.tags | `[` `string` `,` `string` `,` ... `]` | Align the element to the elements with the specified tags. |
&nbsp;&nbsp;&nbsp;snapTo.grid | [Grid](#grid-structure) | Align the element to a grid. |
icon | `FALSE` to hide it, `TRUE` to use default values, or [Image](#image-structure) | Element icon. |
doNotFrame | `boolean` | If `TRUE`, excludes the element when the table is completely framed. |
onResetMacro | [Macro](#macro-structure) | Macro to run when the table is created or reset. |
onDropMacro | [Macro](#macro-structure) | Macro to run when the element is moved. |
onSelectMacro | [Macro](#macro-structure) | Macro to run when the element is selected. |
onShakeMacro | [Macro](#macro-structure) | Executes a macro when it is shaken. |
onClickMacro | [Macro](#macro-structure) | Macro to run when the element is clicked. |
onMenuMacros | `[` [Macro option](#macro-option-structure) `,` [Macro option](#macro-option-structure) `,` ... `]` | If the element supports the context menu, it shows additional options that allow you to run a macro. |
resetValue | `float` | Value to set when the element is reset. |
isVariableZIndex | `boolean` | If `TRUE`, it is brought to the front when selected. |
isDragTopSurfaces | `boolean` | If `TRUE`, the elements above will be transported when the element is moved. |
isDraggable | `boolean` | If `TRUE`, it can be moved by dragging. |
backgroundColor | [Color](#color-structure) | Base color of the element. |
descriptionText | [Text](#text-structure) | Text to show in the description label. |
maxValue | `float` | Maximum value that the counter can take. |
minValue | `float` | Minimum value that the counter can take. |
isTransparent | `boolean` | If `TRUE`, it is possible to see what is underneath the element. |
gauge | `FALSE` to hide it, `TRUE` to use default values, or [Frame](#frame-structure) | Progress bar appearance. |

### Custom counter

An element that tracks a certain value. (Customizable version)

#### Type identifiers

 * `"counter-custom"`

#### Tags assigned by default

 * `"type:counter"`

#### Supported macro events

 * `reset`
 * `setValue`
 * `subtractValue`
 * `sumValue`

#### Attributes

Name | Type | Description |
--- | --- | --- | 
x | `float` (in mm) | Horizontal coordinate. |
y | `float` (in mm) | Vertical coordinate. |
tags | `[` `string` `,` `string` `,` ... `]` | List of tags by which it can be identified by other elements. |
zIndexGroup | `integer` | Depth group. The user will not be able to move elements with a lower value over elements with a higher value. (Default: `0`) |
fence | [Area](#area-structure) | Prevents the element from moving outside the specified area. |
snapTo |  | Establishes the positioning rules to follow when the element is moved. |
&nbsp;&nbsp;&nbsp;snapTo.tags | `[` `string` `,` `string` `,` ... `]` | Align the element to the elements with the specified tags. |
&nbsp;&nbsp;&nbsp;snapTo.grid | [Grid](#grid-structure) | Align the element to a grid. |
icon | `FALSE` to hide it, `TRUE` to use default values, or [Image](#image-structure) | Element icon. |
doNotFrame | `boolean` | If `TRUE`, excludes the element when the table is completely framed. |
onResetMacro | [Macro](#macro-structure) | Macro to run when the table is created or reset. |
onDropMacro | [Macro](#macro-structure) | Macro to run when the element is moved. |
onSelectMacro | [Macro](#macro-structure) | Macro to run when the element is selected. |
onShakeMacro | [Macro](#macro-structure) | Executes a macro when it is shaken. |
onClickMacro | [Macro](#macro-structure) | Macro to run when the element is clicked. |
onMenuMacros | `[` [Macro option](#macro-option-structure) `,` [Macro option](#macro-option-structure) `,` ... `]` | If the element supports the context menu, it shows additional options that allow you to run a macro. |
value | `integer` | Element value. |
resetValue | `float` | Value to set when the element is reset. |
isVariableZIndex | `boolean` | If `TRUE`, it is brought to the front when selected. |
isDragTopSurfaces | `boolean` | If `TRUE`, the elements above will be transported when the element is moved. |
isDraggable | `boolean` | If `TRUE`, it can be moved by dragging. |
width | `float` (in mm) | Width. |
height | `float` (in mm) | Height. |
frame | `FALSE` to hide it, `TRUE` to use default values, or [Frame](#frame-structure) | Background block. |
label | ([Frame](#frame-structure) + [Label](#text-label-structure)) | Text label showing the counter value. |
leftButtons | `[` [Counter button](#counter-button-structure) `,` [Counter button](#counter-button-structure) `,` ... `]` | Buttons to add to the counter left. |
rightButtons | `[` [Counter button](#counter-button-structure) `,` [Counter button](#counter-button-structure) `,` ... `]` | Buttons to add to the counter right. |
menuButtons | `[` [Menu button](#counter-menu-button-structure) `,` [Menu button](#counter-menu-button-structure) `,` ... `]` | Buttons to add to the counter context menu. |
backgroundColor | [Color](#color-structure) | Base color of the element. |
description | `FALSE` to hide it, `TRUE` to use default values, or ([Frame](#frame-structure) + [Label](#text-label-structure)) | Counter description label. |
descriptionText | [Text](#text-structure) | Text to show in the description label. |
maxValue | `float` | Maximum value that the counter can take. |
minValue | `float` | Minimum value that the counter can take. |
isTransparent | `boolean` | If `TRUE`, it is possible to see what is underneath the element. |
isRotating | `boolean` | If `TRUE`, the token can be rotated to change its value. |
gauge | `FALSE` to hide it, `TRUE` to use default values, or [Frame](#frame-structure) | Progress bar appearance. |
gaugeMaxValue | `float` | Maximum value to use to draw the progress bar. |
gaugeMinValue | `float` | Minimum value to use to draw the progress bar. |
isGaugeMaxValueVisible | `boolean` | If `TRUE`, show the progress bar maximum value next to the counter value. |
image | `FALSE` to hide it, `TRUE` to use default values, or [Image](#image-structure) | Background image. |

### Standard dice

It randomly shows one of his faces.

#### Type identifiers

 * `"dice-d10"`
 * `"dice-d10-ten"`
 * `"dice-d100"`
 * `"dice-d12"`
 * `"dice-d2"`
 * `"dice-d20"`
 * `"dice-d4"`
 * `"dice-d6"`
 * `"dice-d6-pips"`
 * `"dice-d8"`

#### Tags assigned by default

 * `"type:dice"`

#### Supported macro events

 * `flip`
 * `roll`
 * `setSide`

#### Attributes

Name | Type | Description |
--- | --- | --- | 
x | `float` (in mm) | Horizontal coordinate. |
y | `float` (in mm) | Vertical coordinate. |
tags | `[` `string` `,` `string` `,` ... `]` | List of tags by which it can be identified by other elements. |
zIndexGroup | `integer` | Depth group. The user will not be able to move elements with a lower value over elements with a higher value. (Default: `0`) |
fence | [Area](#area-structure) | Prevents the element from moving outside the specified area. |
snapTo |  | Establishes the positioning rules to follow when the element is moved. |
&nbsp;&nbsp;&nbsp;snapTo.tags | `[` `string` `,` `string` `,` ... `]` | Align the element to the elements with the specified tags. |
&nbsp;&nbsp;&nbsp;snapTo.grid | [Grid](#grid-structure) | Align the element to a grid. |
doNotFrame | `boolean` | If `TRUE`, excludes the element when the table is completely framed. |
onResetMacro | [Macro](#macro-structure) | Macro to run when the table is created or reset. |
onDropMacro | [Macro](#macro-structure) | Macro to run when the element is moved. |
onSelectMacro | [Macro](#macro-structure) | Macro to run when the element is selected. |
onShakeMacro | [Macro](#macro-structure) | Executes a macro when it is shaken. |
onClickMacro | [Macro](#macro-structure) | Macro to run when the element is clicked. |
onMenuMacros | `[` [Macro option](#macro-option-structure) `,` [Macro option](#macro-option-structure) `,` ... `]` | If the element supports the context menu, it shows additional options that allow you to run a macro. |
isVariableZIndex | `boolean` | If `TRUE`, it is brought to the front when selected. |
isDragTopSurfaces | `boolean` | If `TRUE`, the elements above will be transported when the element is moved. |
isDraggable | `boolean` | If `TRUE`, it can be moved by dragging. |
icon | `FALSE` to hide it, `TRUE` to use default values, or [Image](#image-structure) | Element icon. |
backgroundColor | [Color](#color-structure) | Base color of the element. |
value | `integer` | Index of the dice face to show. (`0` for the first face) |
messages |  | Dice messages. |
&nbsp;&nbsp;&nbsp;messages.flip | `FALSE` to hide it or [Option](#menu-option-structure) | Menu option to show to turn the element upside-down. |
&nbsp;&nbsp;&nbsp;messages.roll | `FALSE` to hide it or [Option](#menu-option-structure) | Menu option to show to roll the element. |

### Custom dice

It randomly shows one of his faces. (Customizable version)

#### Type identifiers

 * `"dice-custom"`

#### Tags assigned by default

 * `"type:dice"`

#### Supported macro events

 * `flip`
 * `roll`
 * `setSide`

#### Attributes

Name | Type | Description |
--- | --- | --- | 
x | `float` (in mm) | Horizontal coordinate. |
y | `float` (in mm) | Vertical coordinate. |
tags | `[` `string` `,` `string` `,` ... `]` | List of tags by which it can be identified by other elements. |
zIndexGroup | `integer` | Depth group. The user will not be able to move elements with a lower value over elements with a higher value. (Default: `0`) |
fence | [Area](#area-structure) | Prevents the element from moving outside the specified area. |
snapTo |  | Establishes the positioning rules to follow when the element is moved. |
&nbsp;&nbsp;&nbsp;snapTo.tags | `[` `string` `,` `string` `,` ... `]` | Align the element to the elements with the specified tags. |
&nbsp;&nbsp;&nbsp;snapTo.grid | [Grid](#grid-structure) | Align the element to a grid. |
doNotFrame | `boolean` | If `TRUE`, excludes the element when the table is completely framed. |
onResetMacro | [Macro](#macro-structure) | Macro to run when the table is created or reset. |
onDropMacro | [Macro](#macro-structure) | Macro to run when the element is moved. |
onSelectMacro | [Macro](#macro-structure) | Macro to run when the element is selected. |
onShakeMacro | [Macro](#macro-structure) | Executes a macro when it is shaken. |
onClickMacro | [Macro](#macro-structure) | Macro to run when the element is clicked. |
onMenuMacros | `[` [Macro option](#macro-option-structure) `,` [Macro option](#macro-option-structure) `,` ... `]` | If the element supports the context menu, it shows additional options that allow you to run a macro. |
isVariableZIndex | `boolean` | If `TRUE`, it is brought to the front when selected. |
isDragTopSurfaces | `boolean` | If `TRUE`, the elements above will be transported when the element is moved. |
isDraggable | `boolean` | If `TRUE`, it can be moved by dragging. |
icon | `FALSE` to hide it, `TRUE` to use default values, or [Image](#image-structure) | Element icon. |
width | `float` (in mm) | Width. |
height | `float` (in mm) | Height. |
value | `integer` | Index of the dice face to show. (`0` for the first face) |
faces | `[` Face `,` Face `,` ... `]` | List of dice faces. |
&nbsp;&nbsp;&nbsp;faces[].frame | `integer` | Sprite frame index to show. |
&nbsp;&nbsp;&nbsp;faces[].label | [Text](#text-structure) | Face label text. |
&nbsp;&nbsp;&nbsp;faces[].icon | [URL Resource](#resource-url-structure) or [Canvas Resource](#canvas-structure) or [SVG Resource](#svg-structure) | Icon to show in the face selection menu. |
&nbsp;&nbsp;&nbsp;faces[].value | `integer` | Value of the die when showing this side. |
isFlippable | `boolean` | If `TRUE`, the element can be turned on the other side. |
backgroundColor | [Color](#color-structure) | Base color of the element. |
frame | `FALSE` to hide it, `TRUE` to use default values, or [Frame](#frame-structure) | Background block. |
image | `FALSE` to hide it, `TRUE` to use default values, or [Image](#image-structure) | Background image. |
isRotating | `boolean` | If `TRUE`, the faces can be changed by rotating the dice. |
facesImage | [Image](#image-structure) | Image used for dice faces. Its `image` resource must have a `sprite` metadata section. |
facesLabel | `FALSE` to hide it, `TRUE` to use default values, or [Label](#text-label-structure) | Text label used for dice faces. |
messages |  | Dice messages. |
&nbsp;&nbsp;&nbsp;messages.flip | `FALSE` to hide it or [Option](#menu-option-structure) | Menu option to show to turn the element upside-down. |
&nbsp;&nbsp;&nbsp;messages.roll | `FALSE` to hide it or [Option](#menu-option-structure) | Menu option to show to roll the element. |

### Standard line element

It uses the currently selected drawing tool (pencil or eraser) to draw a line on the sheets below.

#### Type identifiers

 * `"line-compass"`
 * `"line-ruler"`

#### Tags assigned by default

 * `"type:line"`

#### Supported macro events

 * `paint`
 * `reset`
 * `setLastStep`
 * `setLastVector`
 * `shuffle`

#### Attributes

Name | Type | Description |
--- | --- | --- | 
lastVector | [Vector](#vector-structure) | Vector to the target point. |
x | `float` (in mm) | Horizontal coordinate. |
y | `float` (in mm) | Vertical coordinate. |
lastStep | `integer` | Step set for next track. |
tags | `[` `string` `,` `string` `,` ... `]` | List of tags by which it can be identified by other elements. |
zIndexGroup | `integer` | Depth group. The user will not be able to move elements with a lower value over elements with a higher value. (Default: `0`) |
fence | [Area](#area-structure) | Prevents the element from moving outside the specified area. |
snapTo |  | Establishes the positioning rules to follow when the element is moved. |
&nbsp;&nbsp;&nbsp;snapTo.tags | `[` `string` `,` `string` `,` ... `]` | Align the element to the elements with the specified tags. |
&nbsp;&nbsp;&nbsp;snapTo.grid | [Grid](#grid-structure) | Align the element to a grid. |
doNotFrame | `boolean` | If `TRUE`, excludes the element when the table is completely framed. |
onResetMacro | [Macro](#macro-structure) | Macro to run when the table is created or reset. |
onDropMacro | [Macro](#macro-structure) | Macro to run when the element is moved. |
onSelectMacro | [Macro](#macro-structure) | Macro to run when the element is selected. |
onShakeMacro | [Macro](#macro-structure) | Executes a macro when it is shaken. |
onClickMacro | [Macro](#macro-structure) | Macro to run when the element is clicked. |
onMenuMacros | `[` [Macro option](#macro-option-structure) `,` [Macro option](#macro-option-structure) `,` ... `]` | If the element supports the context menu, it shows additional options that allow you to run a macro. |
isVariableZIndex | `boolean` | If `TRUE`, it is brought to the front when selected. |
isDragTopSurfaces | `boolean` | If `TRUE`, the elements above will be transported when the element is moved. |
isDraggable | `boolean` | If `TRUE`, it can be moved by dragging. |
icon | `FALSE` to hide it, `TRUE` to use default values, or [Image](#image-structure) | Element icon. |
previewTool |  | Show a selected tool preview to the element. |
&nbsp;&nbsp;&nbsp;previewTool.border | `boolean` | If `TRUE`, show the preview on the element border. |
&nbsp;&nbsp;&nbsp;previewTool.background | `boolean` | If `TRUE`, show the preview on the element background. |
&nbsp;&nbsp;&nbsp;previewTool.guides | `boolean` | If `TRUE`, show the preview on the element guides. |
backgroundColor | [Color](#color-structure) | Base color of the element. |
drawOnTags | `[` `string` `,` `string` `,` ... `]` | Allows the element to draw only on elements with the specified tags. |

### Custom line element

It uses the currently selected drawing tool (pencil or eraser) to draw a line on the sheets below. (Customizable version)

#### Type identifiers

 * `"line-custom"`

#### Tags assigned by default

 * `"type:line"`

#### Supported macro events

 * `paint`
 * `reset`
 * `setLastStep`
 * `setLastVector`
 * `shuffle`

#### Attributes

Name | Type | Description |
--- | --- | --- | 
lastVector | [Vector](#vector-structure) | Vector to the target point. |
x | `float` (in mm) | Horizontal coordinate. |
y | `float` (in mm) | Vertical coordinate. |
lastStep | `integer` | Step set for next track. |
tags | `[` `string` `,` `string` `,` ... `]` | List of tags by which it can be identified by other elements. |
zIndexGroup | `integer` | Depth group. The user will not be able to move elements with a lower value over elements with a higher value. (Default: `0`) |
fence | [Area](#area-structure) | Prevents the element from moving outside the specified area. |
snapTo |  | Establishes the positioning rules to follow when the element is moved. |
&nbsp;&nbsp;&nbsp;snapTo.tags | `[` `string` `,` `string` `,` ... `]` | Align the element to the elements with the specified tags. |
&nbsp;&nbsp;&nbsp;snapTo.grid | [Grid](#grid-structure) | Align the element to a grid. |
doNotFrame | `boolean` | If `TRUE`, excludes the element when the table is completely framed. |
onResetMacro | [Macro](#macro-structure) | Macro to run when the table is created or reset. |
onDropMacro | [Macro](#macro-structure) | Macro to run when the element is moved. |
onSelectMacro | [Macro](#macro-structure) | Macro to run when the element is selected. |
onShakeMacro | [Macro](#macro-structure) | Executes a macro when it is shaken. |
onClickMacro | [Macro](#macro-structure) | Macro to run when the element is clicked. |
onMenuMacros | `[` [Macro option](#macro-option-structure) `,` [Macro option](#macro-option-structure) `,` ... `]` | If the element supports the context menu, it shows additional options that allow you to run a macro. |
isVariableZIndex | `boolean` | If `TRUE`, it is brought to the front when selected. |
isDragTopSurfaces | `boolean` | If `TRUE`, the elements above will be transported when the element is moved. |
isDraggable | `boolean` | If `TRUE`, it can be moved by dragging. |
icon | `FALSE` to hide it, `TRUE` to use default values, or [Image](#image-structure) | Element icon. |
width | `float` (in mm) | Width. |
height | `float` (in mm) | Height. |
guideLabel | `FALSE` to hide it, `TRUE` to use default values, or [Frame](#frame-structure) | Shows a label with the distance between the center point and the target point. |
guideCircle | `FALSE` to hide it, `TRUE` to use default values, or [Frame](#frame-structure) | Shows a dashed circle from the center point to the target point. |
guideLine | `FALSE` to hide it, `TRUE` to use default values, or [Frame](#frame-structure) | Shows a dashed line from the center point to the target point. |
draw |  | Lines drawn by the element. |
&nbsp;&nbsp;&nbsp;draw.line | `boolean` | If `TRUE`, draw a line from the center point to the target point. |
&nbsp;&nbsp;&nbsp;draw.circle | `boolean` | If `TRUE`, draw a circle from the center point to the target point. |
frame | `FALSE` to hide it, `TRUE` to use default values, or [Frame](#frame-structure) | Background block. |
center | [Point](#point-position-structure) | Center position on the element. |
onShakeShuffle | `boolean` | If `TRUE`, select a random angle or distance when shaken. |
rotationAngle | `float` (in radians) | When the element is rotated, rotate the selected angle by the specified value. |
drawOnTags | `[` `string` `,` `string` `,` ... `]` | Allows the element to draw only on elements with the specified tags. |
distance |  | Rules for the distance between the center and the target point. |
&nbsp;&nbsp;&nbsp;distance.max | `float` (in mm) | Maximum distance from the center point to the target point. |
&nbsp;&nbsp;&nbsp;distance.step | `float` (in mm) | Step to use for the distance from the center to the target point. |
previewTool |  | Show a selected tool preview to the element. |
&nbsp;&nbsp;&nbsp;previewTool.border | `boolean` | If `TRUE`, show the preview on the element border. |
&nbsp;&nbsp;&nbsp;previewTool.background | `boolean` | If `TRUE`, show the preview on the element background. |
&nbsp;&nbsp;&nbsp;previewTool.guides | `boolean` | If `TRUE`, show the preview on the element guides. |
drawOnDrag | `boolean` | If `TRUE`, draw the line immediately after establishing the target point. |
drawOnClick | `boolean` | If `TRUE`, draws the line immediately when the element is clicked/tapped. |
onDrawExpand | `boolean` | If `TRUE`, increase the distance by the original `lastRadius` value each time a line is drawn. |
backgroundColor | [Color](#color-structure) | Base color of the element. |
isTargetLocked | `boolean` | If `TRUE`, the target point is locked and cannot be changed by the user. |

### Default scissors

An element that cuts sheet elements to create token elements.

#### Type identifiers

 * `"scissors"`

#### Tags assigned by default

 * `"type:scissors"`

#### Supported macro events

 * `setLastArea`

#### Attributes

Name | Type | Description |
--- | --- | --- | 
lastArea | [Area](#area-structure) | Area to cut. |
x | `float` (in mm) | Horizontal coordinate. |
y | `float` (in mm) | Vertical coordinate. |
tags | `[` `string` `,` `string` `,` ... `]` | List of tags by which it can be identified by other elements. |
zIndexGroup | `integer` | Depth group. The user will not be able to move elements with a lower value over elements with a higher value. (Default: `0`) |
fence | [Area](#area-structure) | Prevents the element from moving outside the specified area. |
snapTo |  | Establishes the positioning rules to follow when the element is moved. |
&nbsp;&nbsp;&nbsp;snapTo.tags | `[` `string` `,` `string` `,` ... `]` | Align the element to the elements with the specified tags. |
&nbsp;&nbsp;&nbsp;snapTo.grid | [Grid](#grid-structure) | Align the element to a grid. |
doNotFrame | `boolean` | If `TRUE`, excludes the element when the table is completely framed. |
onResetMacro | [Macro](#macro-structure) | Macro to run when the table is created or reset. |
onDropMacro | [Macro](#macro-structure) | Macro to run when the element is moved. |
onSelectMacro | [Macro](#macro-structure) | Macro to run when the element is selected. |
onShakeMacro | [Macro](#macro-structure) | Executes a macro when it is shaken. |
onClickMacro | [Macro](#macro-structure) | Macro to run when the element is clicked. |
onMenuMacros | `[` [Macro option](#macro-option-structure) `,` [Macro option](#macro-option-structure) `,` ... `]` | If the element supports the context menu, it shows additional options that allow you to run a macro. |
isVariableZIndex | `boolean` | If `TRUE`, it is brought to the front when selected. |
isDragTopSurfaces | `boolean` | If `TRUE`, the elements above will be transported when the element is moved. |
isDraggable | `boolean` | If `TRUE`, it can be moved by dragging. |
icon | `FALSE` to hide it, `TRUE` to use default values, or [Image](#image-structure) | Element icon. |
backgroundColor | [Color](#color-structure) | Base color of the element. |
isAreaLocked | `boolean` | If `TRUE`, prevent the user from changing the cut area. |
messages |  | Scissors messages. |
&nbsp;&nbsp;&nbsp;messages.setArea | `FALSE` to hide it or [Option](#menu-option-structure) | Set area to cut option. |
&nbsp;&nbsp;&nbsp;messages.cut | `FALSE` to hide it or [Option](#menu-option-structure) | Cut option. |
&nbsp;&nbsp;&nbsp;messages.removeSheet | `FALSE` to hide it or [Option](#menu-option-structure) | Remove a sheet from the table option. |
&nbsp;&nbsp;&nbsp;messages.selectSheet | `FALSE` to hide it or [Message](#popup-message-structure) | Select the sheet to remove message. |
cutOnTags | `[` `string` `,` `string` `,` ... `]` | Allows the element to cut only elements with the specified tags. |
cutTags | `[` `string` `,` `string` `,` ... `]` | Assigns the specified tags to the cutouts. |
cutModels | `[` [Area option](#area-option-structure) `,` [Area option](#area-option-structure) `,` ... `]` | Specifies a list of preset cut areas that the user can select. |

### Custom scissors

An element that cuts sheet elements to create token elements. (Customizable version)

#### Type identifiers

 * `"scissors-custom"`

#### Tags assigned by default

 * `"type:scissors"`

#### Supported macro events

 * `setLastArea`

#### Attributes

Name | Type | Description |
--- | --- | --- | 
lastArea | [Area](#area-structure) | Area to cut. |
x | `float` (in mm) | Horizontal coordinate. |
y | `float` (in mm) | Vertical coordinate. |
tags | `[` `string` `,` `string` `,` ... `]` | List of tags by which it can be identified by other elements. |
zIndexGroup | `integer` | Depth group. The user will not be able to move elements with a lower value over elements with a higher value. (Default: `0`) |
fence | [Area](#area-structure) | Prevents the element from moving outside the specified area. |
snapTo |  | Establishes the positioning rules to follow when the element is moved. |
&nbsp;&nbsp;&nbsp;snapTo.tags | `[` `string` `,` `string` `,` ... `]` | Align the element to the elements with the specified tags. |
&nbsp;&nbsp;&nbsp;snapTo.grid | [Grid](#grid-structure) | Align the element to a grid. |
doNotFrame | `boolean` | If `TRUE`, excludes the element when the table is completely framed. |
onResetMacro | [Macro](#macro-structure) | Macro to run when the table is created or reset. |
onDropMacro | [Macro](#macro-structure) | Macro to run when the element is moved. |
onSelectMacro | [Macro](#macro-structure) | Macro to run when the element is selected. |
onShakeMacro | [Macro](#macro-structure) | Executes a macro when it is shaken. |
onClickMacro | [Macro](#macro-structure) | Macro to run when the element is clicked. |
onMenuMacros | `[` [Macro option](#macro-option-structure) `,` [Macro option](#macro-option-structure) `,` ... `]` | If the element supports the context menu, it shows additional options that allow you to run a macro. |
isVariableZIndex | `boolean` | If `TRUE`, it is brought to the front when selected. |
isDragTopSurfaces | `boolean` | If `TRUE`, the elements above will be transported when the element is moved. |
isDraggable | `boolean` | If `TRUE`, it can be moved by dragging. |
icon | `FALSE` to hide it, `TRUE` to use default values, or [Image](#image-structure) | Element icon. |
frame | `FALSE` to hide it, `TRUE` to use default values, or [Frame](#frame-structure) | Background block. |
width | `float` (in mm) | Width. |
height | `float` (in mm) | Height. |
guideArea | `FALSE` to hide it, `TRUE` to use default values, or [Frame](#frame-structure) | Shows a dashed area to show the area to cut. |
guideLabel | `FALSE` to hide it, `TRUE` to use default values, or [Frame](#frame-structure) | Shows a label with the area to cut size. |
backgroundColor | [Color](#color-structure) | Base color of the element. |
isAreaLocked | `boolean` | If `TRUE`, prevent the user from changing the cut area. |
messages |  | Scissors messages. |
&nbsp;&nbsp;&nbsp;messages.setArea | `FALSE` to hide it or [Option](#menu-option-structure) | Set area to cut option. |
&nbsp;&nbsp;&nbsp;messages.cut | `FALSE` to hide it or [Option](#menu-option-structure) | Cut option. |
&nbsp;&nbsp;&nbsp;messages.removeSheet | `FALSE` to hide it or [Option](#menu-option-structure) | Remove a sheet from the table option. |
&nbsp;&nbsp;&nbsp;messages.selectSheet | `FALSE` to hide it or [Message](#popup-message-structure) | Select the sheet to remove message. |
cutOnTags | `[` `string` `,` `string` `,` ... `]` | Allows the element to cut only elements with the specified tags. |
cutTags | `[` `string` `,` `string` `,` ... `]` | Assigns the specified tags to the cutouts. |
cutModels | `[` [Area option](#area-option-structure) `,` [Area option](#area-option-structure) `,` ... `]` | Specifies a list of preset cut areas that the user can select. |

### Blank sheet

A blank sheet of paper. It may have a pre-printed pattern.

#### Type identifiers

 * `"sheet-blank-landscape"`
 * `"sheet-blank-portrait"`

#### Tags assigned by default

 * `"type:sheet"`

#### Supported macro events

 * `reset`

#### Attributes

Name | Type | Description |
--- | --- | --- | 
x | `float` (in mm) | Horizontal coordinate. |
y | `float` (in mm) | Vertical coordinate. |
tags | `[` `string` `,` `string` `,` ... `]` | List of tags by which it can be identified by other elements. |
zIndexGroup | `integer` | Depth group. The user will not be able to move elements with a lower value over elements with a higher value. (Default: `0`) |
fence | [Area](#area-structure) | Prevents the element from moving outside the specified area. |
snapTo |  | Establishes the positioning rules to follow when the element is moved. |
&nbsp;&nbsp;&nbsp;snapTo.tags | `[` `string` `,` `string` `,` ... `]` | Align the element to the elements with the specified tags. |
&nbsp;&nbsp;&nbsp;snapTo.grid | [Grid](#grid-structure) | Align the element to a grid. |
doNotFrame | `boolean` | If `TRUE`, excludes the element when the table is completely framed. |
onResetMacro | [Macro](#macro-structure) | Macro to run when the table is created or reset. |
onDropMacro | [Macro](#macro-structure) | Macro to run when the element is moved. |
onSelectMacro | [Macro](#macro-structure) | Macro to run when the element is selected. |
onShakeMacro | [Macro](#macro-structure) | Executes a macro when it is shaken. |
onClickMacro | [Macro](#macro-structure) | Macro to run when the element is clicked. |
onMenuMacros | `[` [Macro option](#macro-option-structure) `,` [Macro option](#macro-option-structure) `,` ... `]` | If the element supports the context menu, it shows additional options that allow you to run a macro. |
isVariableZIndex | `boolean` | If `TRUE`, it is brought to the front when selected. |
isDragTopSurfaces | `boolean` | If `TRUE`, the elements above will be transported when the element is moved. |
isDraggable | `boolean` | If `TRUE`, it can be moved by dragging. |
icon | `FALSE` to hide it, `TRUE` to use default values, or [Image](#image-structure) | Element icon. |
pattern |  | Pattern to print on the sheet. |
&nbsp;&nbsp;&nbsp;pattern.width | `float` (in mm) | Width. |
&nbsp;&nbsp;&nbsp;pattern.height | `float` (in mm) | Height. |
&nbsp;&nbsp;&nbsp;pattern.type | `integer` | Pattern design type. (`1` for lines, `2` for squares, `3` for hexagons) |
&nbsp;&nbsp;&nbsp;pattern.topMargin | `float` (in mm) | Upper margin from which to start drawing the pattern. |
&nbsp;&nbsp;&nbsp;pattern.bottomMargin | `float` (in mm) | Lower margin from which to start drawing the pattern. |
&nbsp;&nbsp;&nbsp;pattern.rightMargin | `float` (in mm) | Right margin from which to start drawing the pattern. |
&nbsp;&nbsp;&nbsp;pattern.leftMargin | `float` (in mm) | Left margin from which to start drawing the pattern. |
&nbsp;&nbsp;&nbsp;pattern.color | [Color](#color-structure) | Pattern color. |
image | `FALSE` to hide it, `TRUE` to use default values, or [Image](#image-structure) | Background image. |

### Sheet

A pre-printed sheet. (Customizable version)

#### Type identifiers

 * `"sheet"`

#### Tags assigned by default

 * `"type:sheet"`

#### Supported macro events

 * `reset`

#### Attributes

Name | Type | Description |
--- | --- | --- | 
x | `float` (in mm) | Horizontal coordinate. |
y | `float` (in mm) | Vertical coordinate. |
tags | `[` `string` `,` `string` `,` ... `]` | List of tags by which it can be identified by other elements. |
zIndexGroup | `integer` | Depth group. The user will not be able to move elements with a lower value over elements with a higher value. (Default: `0`) |
fence | [Area](#area-structure) | Prevents the element from moving outside the specified area. |
snapTo |  | Establishes the positioning rules to follow when the element is moved. |
&nbsp;&nbsp;&nbsp;snapTo.tags | `[` `string` `,` `string` `,` ... `]` | Align the element to the elements with the specified tags. |
&nbsp;&nbsp;&nbsp;snapTo.grid | [Grid](#grid-structure) | Align the element to a grid. |
doNotFrame | `boolean` | If `TRUE`, excludes the element when the table is completely framed. |
onResetMacro | [Macro](#macro-structure) | Macro to run when the table is created or reset. |
onDropMacro | [Macro](#macro-structure) | Macro to run when the element is moved. |
onSelectMacro | [Macro](#macro-structure) | Macro to run when the element is selected. |
onShakeMacro | [Macro](#macro-structure) | Executes a macro when it is shaken. |
onClickMacro | [Macro](#macro-structure) | Macro to run when the element is clicked. |
onMenuMacros | `[` [Macro option](#macro-option-structure) `,` [Macro option](#macro-option-structure) `,` ... `]` | If the element supports the context menu, it shows additional options that allow you to run a macro. |
isVariableZIndex | `boolean` | If `TRUE`, it is brought to the front when selected. |
isDragTopSurfaces | `boolean` | If `TRUE`, the elements above will be transported when the element is moved. |
isDraggable | `boolean` | If `TRUE`, it can be moved by dragging. |
icon | `FALSE` to hide it, `TRUE` to use default values, or [Image](#image-structure) | Element icon. |
backgroundColor | [Color](#color-structure) | Base color of the element. |
width | `float` (in mm) | Width. |
height | `float` (in mm) | Height. |
model | [Translated resource](#translated-resource-structure) | Image to print on the sheet. |
modelOpacity | `float` (0-1) | Printed image opacity. (`1` for fully visible, `0` for invisible) |
image | `FALSE` to hide it, `TRUE` to use default values, or [Image](#image-structure) | Background image. |
isReadOnly | `boolean` | If `TRUE`, the element can be modified by the user. |
pattern |  | Pattern to print on the sheet. |
&nbsp;&nbsp;&nbsp;pattern.width | `float` (in mm) | Width. |
&nbsp;&nbsp;&nbsp;pattern.height | `float` (in mm) | Height. |
&nbsp;&nbsp;&nbsp;pattern.type | `integer` | Pattern design type. (`1` for lines, `2` for squares, `3` for hexagons) |
&nbsp;&nbsp;&nbsp;pattern.topMargin | `float` (in mm) | Upper margin from which to start drawing the pattern. |
&nbsp;&nbsp;&nbsp;pattern.bottomMargin | `float` (in mm) | Lower margin from which to start drawing the pattern. |
&nbsp;&nbsp;&nbsp;pattern.rightMargin | `float` (in mm) | Right margin from which to start drawing the pattern. |
&nbsp;&nbsp;&nbsp;pattern.leftMargin | `float` (in mm) | Left margin from which to start drawing the pattern. |
&nbsp;&nbsp;&nbsp;pattern.color | [Color](#color-structure) | Pattern color. |
frame | `FALSE` to hide it, `TRUE` to use default values, or [Frame](#frame-structure) | Background block. |

### Default stamp

An element that allows you to draw some predefined images on sheets.

#### Type identifiers

 * `"stamp-normal"`
 * `"stamp-small"`

#### Tags assigned by default

 * `"type:stamp"`

#### Supported macro events

 * `paint`
 * `setRotation`
 * `setSide`
 * `shuffle`

#### Attributes

Name | Type | Description |
--- | --- | --- | 
selectedStamp | `integer` | Currently selected stamp index. |
rotation | `integer` | Element rotation side. (`0` for straight, `1` for right, `2` for upside-down, `3` for left) |
x | `float` (in mm) | Horizontal coordinate. |
y | `float` (in mm) | Vertical coordinate. |
tags | `[` `string` `,` `string` `,` ... `]` | List of tags by which it can be identified by other elements. |
zIndexGroup | `integer` | Depth group. The user will not be able to move elements with a lower value over elements with a higher value. (Default: `0`) |
fence | [Area](#area-structure) | Prevents the element from moving outside the specified area. |
snapTo |  | Establishes the positioning rules to follow when the element is moved. |
&nbsp;&nbsp;&nbsp;snapTo.tags | `[` `string` `,` `string` `,` ... `]` | Align the element to the elements with the specified tags. |
&nbsp;&nbsp;&nbsp;snapTo.grid | [Grid](#grid-structure) | Align the element to a grid. |
doNotFrame | `boolean` | If `TRUE`, excludes the element when the table is completely framed. |
onResetMacro | [Macro](#macro-structure) | Macro to run when the table is created or reset. |
onDropMacro | [Macro](#macro-structure) | Macro to run when the element is moved. |
onSelectMacro | [Macro](#macro-structure) | Macro to run when the element is selected. |
onShakeMacro | [Macro](#macro-structure) | Executes a macro when it is shaken. |
onClickMacro | [Macro](#macro-structure) | Macro to run when the element is clicked. |
onMenuMacros | `[` [Macro option](#macro-option-structure) `,` [Macro option](#macro-option-structure) `,` ... `]` | If the element supports the context menu, it shows additional options that allow you to run a macro. |
isVariableZIndex | `boolean` | If `TRUE`, it is brought to the front when selected. |
isDragTopSurfaces | `boolean` | If `TRUE`, the elements above will be transported when the element is moved. |
isDraggable | `boolean` | If `TRUE`, it can be moved by dragging. |
icon | `FALSE` to hide it, `TRUE` to use default values, or [Image](#image-structure) | Element icon. |
previewTool |  | Show a selected tool preview to the element. |
&nbsp;&nbsp;&nbsp;previewTool.border | `boolean` | If `TRUE`, show the preview on the element border. |
&nbsp;&nbsp;&nbsp;previewTool.background | `boolean` | If `TRUE`, show the preview on the element background. |
backgroundColor | [Color](#color-structure) | Base color of the element. |
colorize | `boolean` | If `TRUE`, use the selected tool to paint the stamp image. |
drawOnTags | `[` `string` `,` `string` `,` ... `]` | Allows the element to draw only on elements with the specified tags. |

### Custom stamp

An element that allows you to draw some predefined images on sheets. (Customizable version)

#### Type identifiers

 * `"stamp-custom"`

#### Tags assigned by default

 * `"type:stamp"`

#### Supported macro events

 * `paint`
 * `setRotation`
 * `setSide`
 * `shuffle`

#### Attributes

Name | Type | Description |
--- | --- | --- | 
rotation | `integer` | Element rotation side. (`0` for straight, `1` for right, `2` for upside-down, `3` for left) |
selectedStamp | `integer` | Currently selected stamp index. |
x | `float` (in mm) | Horizontal coordinate. |
y | `float` (in mm) | Vertical coordinate. |
tags | `[` `string` `,` `string` `,` ... `]` | List of tags by which it can be identified by other elements. |
zIndexGroup | `integer` | Depth group. The user will not be able to move elements with a lower value over elements with a higher value. (Default: `0`) |
fence | [Area](#area-structure) | Prevents the element from moving outside the specified area. |
snapTo |  | Establishes the positioning rules to follow when the element is moved. |
&nbsp;&nbsp;&nbsp;snapTo.tags | `[` `string` `,` `string` `,` ... `]` | Align the element to the elements with the specified tags. |
&nbsp;&nbsp;&nbsp;snapTo.grid | [Grid](#grid-structure) | Align the element to a grid. |
doNotFrame | `boolean` | If `TRUE`, excludes the element when the table is completely framed. |
onResetMacro | [Macro](#macro-structure) | Macro to run when the table is created or reset. |
onDropMacro | [Macro](#macro-structure) | Macro to run when the element is moved. |
onSelectMacro | [Macro](#macro-structure) | Macro to run when the element is selected. |
onShakeMacro | [Macro](#macro-structure) | Executes a macro when it is shaken. |
onClickMacro | [Macro](#macro-structure) | Macro to run when the element is clicked. |
onMenuMacros | `[` [Macro option](#macro-option-structure) `,` [Macro option](#macro-option-structure) `,` ... `]` | If the element supports the context menu, it shows additional options that allow you to run a macro. |
isVariableZIndex | `boolean` | If `TRUE`, it is brought to the front when selected. |
isDragTopSurfaces | `boolean` | If `TRUE`, the elements above will be transported when the element is moved. |
isDraggable | `boolean` | If `TRUE`, it can be moved by dragging. |
icon | `FALSE` to hide it, `TRUE` to use default values, or [Image](#image-structure) | Element icon. |
width | `float` (in mm) | Width. |
height | `float` (in mm) | Height. |
frame | `FALSE` to hide it, `TRUE` to use default values, or [Frame](#frame-structure) | Background block. |
image | `FALSE` to hide it, `TRUE` to use default values, or [Image](#image-structure) | Background image. |
backgroundColor | [Color](#color-structure) | Base color of the element. |
onShakeShuffle | `boolean` | If `TRUE`, select a random stamp when shaken. |
isRotating | `boolean` | If `TRUE`, the element can be rotated. |
stamps | `[` Stamp `,` Stamp `,` ... `]` | List of available stamps. |
&nbsp;&nbsp;&nbsp;stamps[].frame | `integer` | Sprite frame index to paint. |
&nbsp;&nbsp;&nbsp;stamps[].label | [Text](#text-structure) | Stamp label text. |
&nbsp;&nbsp;&nbsp;stamps[].icon | [URL Resource](#resource-url-structure) or [Canvas Resource](#canvas-structure) or [SVG Resource](#svg-structure) | Stamp icon. |
stampsImage | [Image](#image-structure) | Image and position of the stamp. |
previewTool |  | Show a selected tool preview to the element. |
&nbsp;&nbsp;&nbsp;previewTool.border | `boolean` | If `TRUE`, show the preview on the element border. |
&nbsp;&nbsp;&nbsp;previewTool.background | `boolean` | If `TRUE`, show the preview on the element background. |
drawOnTags | `[` `string` `,` `string` `,` ... `]` | Allows the element to draw only on elements with the specified tags. |
colorize | `boolean` | If `TRUE`, use the selected tool to paint the stamp image. |

### Default clock

It counts how long has passed since it was activated.

#### Type identifiers

 * `"timer-clock"`

#### Tags assigned by default

 * `"type:timer"`

#### Supported macro events

 * `reset`
 * `shuffle`
 * `start`
 * `stop`
 * `toggle`

#### Attributes

Name | Type | Description |
--- | --- | --- | 
x | `float` (in mm) | Horizontal coordinate. |
y | `float` (in mm) | Vertical coordinate. |
tags | `[` `string` `,` `string` `,` ... `]` | List of tags by which it can be identified by other elements. |
zIndexGroup | `integer` | Depth group. The user will not be able to move elements with a lower value over elements with a higher value. (Default: `0`) |
fence | [Area](#area-structure) | Prevents the element from moving outside the specified area. |
snapTo |  | Establishes the positioning rules to follow when the element is moved. |
&nbsp;&nbsp;&nbsp;snapTo.tags | `[` `string` `,` `string` `,` ... `]` | Align the element to the elements with the specified tags. |
&nbsp;&nbsp;&nbsp;snapTo.grid | [Grid](#grid-structure) | Align the element to a grid. |
doNotFrame | `boolean` | If `TRUE`, excludes the element when the table is completely framed. |
onResetMacro | [Macro](#macro-structure) | Macro to run when the table is created or reset. |
onDropMacro | [Macro](#macro-structure) | Macro to run when the element is moved. |
onSelectMacro | [Macro](#macro-structure) | Macro to run when the element is selected. |
onShakeMacro | [Macro](#macro-structure) | Executes a macro when it is shaken. |
onClickMacro | [Macro](#macro-structure) | Macro to run when the element is clicked. |
onMenuMacros | `[` [Macro option](#macro-option-structure) `,` [Macro option](#macro-option-structure) `,` ... `]` | If the element supports the context menu, it shows additional options that allow you to run a macro. |
isVariableZIndex | `boolean` | If `TRUE`, it is brought to the front when selected. |
isDragTopSurfaces | `boolean` | If `TRUE`, the elements above will be transported when the element is moved. |
isDraggable | `boolean` | If `TRUE`, it can be moved by dragging. |
icon | `FALSE` to hide it, `TRUE` to use default values, or [Image](#image-structure) | Element icon. |
backgroundColor | [Color](#color-structure) | Base color of the element. |
count | `integer` (seconds) | Timer current count. |
messages |  | Timer messages. |
&nbsp;&nbsp;&nbsp;messages.start | `FALSE` to hide it or [Option](#menu-option-structure) | Timer start option. |
&nbsp;&nbsp;&nbsp;messages.stop | `FALSE` to hide it or [Option](#menu-option-structure) | Timer stop option. |
&nbsp;&nbsp;&nbsp;messages.reset | `FALSE` to hide it or [Option](#menu-option-structure) | Timer reset option. |
&nbsp;&nbsp;&nbsp;messages.restart | `FALSE` to hide it or [Option](#menu-option-structure) | Timer restart option. |
&nbsp;&nbsp;&nbsp;messages.startStop | `FALSE` to hide it or [Option](#menu-option-structure) | Timer state toggle option. |
&nbsp;&nbsp;&nbsp;messages.timeUp | `FALSE` to hide it or [Message](#popup-message-structure) | Time up message. |

### Default countdown

It counts for a given number of seconds and then activates.

#### Type identifiers

 * `"timer-countdown"`

#### Tags assigned by default

 * `"type:timer"`

#### Supported macro events

 * `reset`
 * `shuffle`
 * `start`
 * `stop`
 * `toggle`

#### Attributes

Name | Type | Description |
--- | --- | --- | 
x | `float` (in mm) | Horizontal coordinate. |
y | `float` (in mm) | Vertical coordinate. |
tags | `[` `string` `,` `string` `,` ... `]` | List of tags by which it can be identified by other elements. |
zIndexGroup | `integer` | Depth group. The user will not be able to move elements with a lower value over elements with a higher value. (Default: `0`) |
fence | [Area](#area-structure) | Prevents the element from moving outside the specified area. |
snapTo |  | Establishes the positioning rules to follow when the element is moved. |
&nbsp;&nbsp;&nbsp;snapTo.tags | `[` `string` `,` `string` `,` ... `]` | Align the element to the elements with the specified tags. |
&nbsp;&nbsp;&nbsp;snapTo.grid | [Grid](#grid-structure) | Align the element to a grid. |
doNotFrame | `boolean` | If `TRUE`, excludes the element when the table is completely framed. |
onResetMacro | [Macro](#macro-structure) | Macro to run when the table is created or reset. |
onDropMacro | [Macro](#macro-structure) | Macro to run when the element is moved. |
onSelectMacro | [Macro](#macro-structure) | Macro to run when the element is selected. |
onShakeMacro | [Macro](#macro-structure) | Executes a macro when it is shaken. |
onClickMacro | [Macro](#macro-structure) | Macro to run when the element is clicked. |
onMenuMacros | `[` [Macro option](#macro-option-structure) `,` [Macro option](#macro-option-structure) `,` ... `]` | If the element supports the context menu, it shows additional options that allow you to run a macro. |
isVariableZIndex | `boolean` | If `TRUE`, it is brought to the front when selected. |
isDragTopSurfaces | `boolean` | If `TRUE`, the elements above will be transported when the element is moved. |
isDraggable | `boolean` | If `TRUE`, it can be moved by dragging. |
icon | `FALSE` to hide it, `TRUE` to use default values, or [Image](#image-structure) | Element icon. |
timeLeft | `integer` (seconds) | Timer time limit. |
backgroundColor | [Color](#color-structure) | Base color of the element. |
count | `integer` (seconds) | Timer current count. |
messages |  | Timer messages. |
&nbsp;&nbsp;&nbsp;messages.start | `FALSE` to hide it or [Option](#menu-option-structure) | Timer start option. |
&nbsp;&nbsp;&nbsp;messages.stop | `FALSE` to hide it or [Option](#menu-option-structure) | Timer stop option. |
&nbsp;&nbsp;&nbsp;messages.reset | `FALSE` to hide it or [Option](#menu-option-structure) | Timer reset option. |
&nbsp;&nbsp;&nbsp;messages.restart | `FALSE` to hide it or [Option](#menu-option-structure) | Timer restart option. |
&nbsp;&nbsp;&nbsp;messages.startStop | `FALSE` to hide it or [Option](#menu-option-structure) | Timer state toggle option. |
&nbsp;&nbsp;&nbsp;messages.timeUp | `FALSE` to hide it or [Message](#popup-message-structure) | Time up message. |

### Custom clock

A time measuring element. (Customizable version)

#### Type identifiers

 * `"timer-custom"`

#### Tags assigned by default

 * `"type:timer"`

#### Supported macro events

 * `reset`
 * `shuffle`
 * `start`
 * `stop`
 * `toggle`

#### Attributes

Name | Type | Description |
--- | --- | --- | 
x | `float` (in mm) | Horizontal coordinate. |
y | `float` (in mm) | Vertical coordinate. |
tags | `[` `string` `,` `string` `,` ... `]` | List of tags by which it can be identified by other elements. |
zIndexGroup | `integer` | Depth group. The user will not be able to move elements with a lower value over elements with a higher value. (Default: `0`) |
fence | [Area](#area-structure) | Prevents the element from moving outside the specified area. |
snapTo |  | Establishes the positioning rules to follow when the element is moved. |
&nbsp;&nbsp;&nbsp;snapTo.tags | `[` `string` `,` `string` `,` ... `]` | Align the element to the elements with the specified tags. |
&nbsp;&nbsp;&nbsp;snapTo.grid | [Grid](#grid-structure) | Align the element to a grid. |
doNotFrame | `boolean` | If `TRUE`, excludes the element when the table is completely framed. |
onResetMacro | [Macro](#macro-structure) | Macro to run when the table is created or reset. |
onDropMacro | [Macro](#macro-structure) | Macro to run when the element is moved. |
onSelectMacro | [Macro](#macro-structure) | Macro to run when the element is selected. |
onShakeMacro | [Macro](#macro-structure) | Executes a macro when it is shaken. |
onClickMacro | [Macro](#macro-structure) | Macro to run when the element is clicked. |
onMenuMacros | `[` [Macro option](#macro-option-structure) `,` [Macro option](#macro-option-structure) `,` ... `]` | If the element supports the context menu, it shows additional options that allow you to run a macro. |
isVariableZIndex | `boolean` | If `TRUE`, it is brought to the front when selected. |
isDragTopSurfaces | `boolean` | If `TRUE`, the elements above will be transported when the element is moved. |
isDraggable | `boolean` | If `TRUE`, it can be moved by dragging. |
icon | `FALSE` to hide it, `TRUE` to use default values, or [Image](#image-structure) | Element icon. |
width | `float` (in mm) | Width. |
height | `float` (in mm) | Height. |
frame | `FALSE` to hide it, `TRUE` to use default values, or [Frame](#frame-structure) | Background block. |
backgroundColor | [Color](#color-structure) | Base color of the element. |
label | ([Frame](#frame-structure) + [Label](#text-label-structure)) | Timer label text. |
count | `integer` (seconds) | Timer current count. |
timeLeft | `integer` (seconds) | Timer time limit. |
messages |  | Timer messages. |
&nbsp;&nbsp;&nbsp;messages.start | `FALSE` to hide it or [Option](#menu-option-structure) | Timer start option. |
&nbsp;&nbsp;&nbsp;messages.stop | `FALSE` to hide it or [Option](#menu-option-structure) | Timer stop option. |
&nbsp;&nbsp;&nbsp;messages.reset | `FALSE` to hide it or [Option](#menu-option-structure) | Timer reset option. |
&nbsp;&nbsp;&nbsp;messages.restart | `FALSE` to hide it or [Option](#menu-option-structure) | Timer restart option. |
&nbsp;&nbsp;&nbsp;messages.startStop | `FALSE` to hide it or [Option](#menu-option-structure) | Timer state toggle option. |
&nbsp;&nbsp;&nbsp;messages.timeUp | `FALSE` to hide it or [Message](#popup-message-structure) | Time up message. |

### Standard token

A marker that can be used to indicate a position on the table.

#### Type identifiers

 * `"token-0"`
 * `"token-1"`
 * `"token-2"`
 * `"token-3"`

#### Tags assigned by default

 * `"type:token"`

#### Supported macro events

 * `flip`
 * `setRotation`
 * `setSide`
 * `shuffle`
 * `spin`

#### Attributes

Name | Type | Description |
--- | --- | --- | 
rotation | `integer` | Element rotation side. (`0` for straight, `1` for right, `2` for upside-down, `3` for left) |
x | `float` (in mm) | Horizontal coordinate. |
y | `float` (in mm) | Vertical coordinate. |
tags | `[` `string` `,` `string` `,` ... `]` | List of tags by which it can be identified by other elements. |
zIndexGroup | `integer` | Depth group. The user will not be able to move elements with a lower value over elements with a higher value. (Default: `0`) |
fence | [Area](#area-structure) | Prevents the element from moving outside the specified area. |
snapTo |  | Establishes the positioning rules to follow when the element is moved. |
&nbsp;&nbsp;&nbsp;snapTo.tags | `[` `string` `,` `string` `,` ... `]` | Align the element to the elements with the specified tags. |
&nbsp;&nbsp;&nbsp;snapTo.grid | [Grid](#grid-structure) | Align the element to a grid. |
doNotFrame | `boolean` | If `TRUE`, excludes the element when the table is completely framed. |
onResetMacro | [Macro](#macro-structure) | Macro to run when the table is created or reset. |
onDropMacro | [Macro](#macro-structure) | Macro to run when the element is moved. |
onSelectMacro | [Macro](#macro-structure) | Macro to run when the element is selected. |
onShakeMacro | [Macro](#macro-structure) | Executes a macro when it is shaken. |
onClickMacro | [Macro](#macro-structure) | Macro to run when the element is clicked. |
onMenuMacros | `[` [Macro option](#macro-option-structure) `,` [Macro option](#macro-option-structure) `,` ... `]` | If the element supports the context menu, it shows additional options that allow you to run a macro. |
isVariableZIndex | `boolean` | If `TRUE`, it is brought to the front when selected. |
isDragTopSurfaces | `boolean` | If `TRUE`, the elements above will be transported when the element is moved. |
isDraggable | `boolean` | If `TRUE`, it can be moved by dragging. |
icon | `FALSE` to hide it, `TRUE` to use default values, or [Image](#image-structure) | Element icon. |
mode | `integer` | Appearance of the token. (`0` for square, `1` for rounded, `2` for round) |
labelText | [Text](#text-structure) | Text to show on the token. |
backgroundColor | [Color](#color-structure) | Base color of the element. |
isTransparent | `boolean` | If `TRUE`, it is possible to see what is underneath the element. |

### Standard double-face token

A marker that can be used to indicate a position on the table. It can be turned on the other side.

#### Type identifiers

 * `"token-0-flip"`
 * `"token-1-flip"`
 * `"token-2-flip"`
 * `"token-3-flip"`

#### Tags assigned by default

 * `"type:token"`

#### Supported macro events

 * `flip`
 * `setRotation`
 * `setSide`
 * `shuffle`
 * `spin`

#### Attributes

Name | Type | Description |
--- | --- | --- | 
side | `boolean` | Side on which the token is flipped. (`FALSE` for front, `TRUE` for back) |
rotation | `integer` | Element rotation side. (`0` for straight, `1` for right, `2` for upside-down, `3` for left) |
x | `float` (in mm) | Horizontal coordinate. |
y | `float` (in mm) | Vertical coordinate. |
tags | `[` `string` `,` `string` `,` ... `]` | List of tags by which it can be identified by other elements. |
zIndexGroup | `integer` | Depth group. The user will not be able to move elements with a lower value over elements with a higher value. (Default: `0`) |
fence | [Area](#area-structure) | Prevents the element from moving outside the specified area. |
snapTo |  | Establishes the positioning rules to follow when the element is moved. |
&nbsp;&nbsp;&nbsp;snapTo.tags | `[` `string` `,` `string` `,` ... `]` | Align the element to the elements with the specified tags. |
&nbsp;&nbsp;&nbsp;snapTo.grid | [Grid](#grid-structure) | Align the element to a grid. |
doNotFrame | `boolean` | If `TRUE`, excludes the element when the table is completely framed. |
onResetMacro | [Macro](#macro-structure) | Macro to run when the table is created or reset. |
onDropMacro | [Macro](#macro-structure) | Macro to run when the element is moved. |
onSelectMacro | [Macro](#macro-structure) | Macro to run when the element is selected. |
onShakeMacro | [Macro](#macro-structure) | Executes a macro when it is shaken. |
onClickMacro | [Macro](#macro-structure) | Macro to run when the element is clicked. |
onMenuMacros | `[` [Macro option](#macro-option-structure) `,` [Macro option](#macro-option-structure) `,` ... `]` | If the element supports the context menu, it shows additional options that allow you to run a macro. |
isVariableZIndex | `boolean` | If `TRUE`, it is brought to the front when selected. |
isDragTopSurfaces | `boolean` | If `TRUE`, the elements above will be transported when the element is moved. |
isDraggable | `boolean` | If `TRUE`, it can be moved by dragging. |
icon | `FALSE` to hide it, `TRUE` to use default values, or [Image](#image-structure) | Element icon. |
mode | `integer` | Appearance of the token. (`0` for square, `1` for rounded, `2` for round) |
backgroundColor | [Color](#color-structure) | Base color of the element. |
labelText | [Text](#text-structure) | Text to show on the token. |
flipLabelText | [Text](#text-structure) | Text to show on the token back. |
flipBackgroundColor | [Color](#color-structure) | Token back color. |
isTransparent | `boolean` | If `TRUE`, it is possible to see what is underneath the element. |
messages |  | Token messages. |
&nbsp;&nbsp;&nbsp;messages.flip | `FALSE` to hide it or [Option](#menu-option-structure) | Menu option to show to turn the element on the other face. |
&nbsp;&nbsp;&nbsp;messages.toss | `FALSE` to hide it or [Option](#menu-option-structure) | Menu option to show to toss the element like a coin. |
&nbsp;&nbsp;&nbsp;messages.spin | `FALSE` to hide it or [Option](#menu-option-structure) | Menu option to show to randomly turn the element. |
&nbsp;&nbsp;&nbsp;messages.rotateStraight | `FALSE` to hide it or [Option](#menu-option-structure) | Menu option to set the token in a straight position. |
&nbsp;&nbsp;&nbsp;messages.rotateUpsideDown | `FALSE` to hide it or [Option](#menu-option-structure) | Menu option to set the token on the upside-down position. |
&nbsp;&nbsp;&nbsp;messages.rotateRight | `FALSE` to hide it or [Option](#menu-option-structure) | Menu option to set the token on the right rotated position. |
&nbsp;&nbsp;&nbsp;messages.rotateLeft | `FALSE` to hide it or [Option](#menu-option-structure) | Menu option to set the token on the left rotated position. |

### Default peeple

A token in the shape of a little man that can be placed standing or lying down.

#### Type identifiers

 * `"token-0-peeple"`
 * `"token-1-peeple"`
 * `"token-2-peeple"`
 * `"token-3-peeple"`

#### Tags assigned by default

 * `"type:token"`

#### Supported macro events

 * `flip`
 * `setRotation`
 * `setSide`
 * `shuffle`
 * `spin`

#### Attributes

Name | Type | Description |
--- | --- | --- | 
side | `boolean` | Side on which the token is flipped. (`FALSE` for front, `TRUE` for back) |
rotation | `integer` | Element rotation side. (`0` for straight, `1` for right, `2` for upside-down, `3` for left) |
x | `float` (in mm) | Horizontal coordinate. |
y | `float` (in mm) | Vertical coordinate. |
tags | `[` `string` `,` `string` `,` ... `]` | List of tags by which it can be identified by other elements. |
zIndexGroup | `integer` | Depth group. The user will not be able to move elements with a lower value over elements with a higher value. (Default: `0`) |
fence | [Area](#area-structure) | Prevents the element from moving outside the specified area. |
snapTo |  | Establishes the positioning rules to follow when the element is moved. |
&nbsp;&nbsp;&nbsp;snapTo.tags | `[` `string` `,` `string` `,` ... `]` | Align the element to the elements with the specified tags. |
&nbsp;&nbsp;&nbsp;snapTo.grid | [Grid](#grid-structure) | Align the element to a grid. |
doNotFrame | `boolean` | If `TRUE`, excludes the element when the table is completely framed. |
onResetMacro | [Macro](#macro-structure) | Macro to run when the table is created or reset. |
onDropMacro | [Macro](#macro-structure) | Macro to run when the element is moved. |
onSelectMacro | [Macro](#macro-structure) | Macro to run when the element is selected. |
onShakeMacro | [Macro](#macro-structure) | Executes a macro when it is shaken. |
onClickMacro | [Macro](#macro-structure) | Macro to run when the element is clicked. |
onMenuMacros | `[` [Macro option](#macro-option-structure) `,` [Macro option](#macro-option-structure) `,` ... `]` | If the element supports the context menu, it shows additional options that allow you to run a macro. |
isVariableZIndex | `boolean` | If `TRUE`, it is brought to the front when selected. |
isDragTopSurfaces | `boolean` | If `TRUE`, the elements above will be transported when the element is moved. |
isDraggable | `boolean` | If `TRUE`, it can be moved by dragging. |
icon | `FALSE` to hide it, `TRUE` to use default values, or [Image](#image-structure) | Element icon. |
backgroundColor | [Color](#color-structure) | Base color of the element. |
isTransparent | `boolean` | If `TRUE`, it is possible to see what is underneath the element. |
messages |  | Token messages. |
&nbsp;&nbsp;&nbsp;messages.flip | `FALSE` to hide it or [Option](#menu-option-structure) | Menu option to show to turn the element on the other face. |
&nbsp;&nbsp;&nbsp;messages.toss | `FALSE` to hide it or [Option](#menu-option-structure) | Menu option to show to toss the element like a coin. |
&nbsp;&nbsp;&nbsp;messages.spin | `FALSE` to hide it or [Option](#menu-option-structure) | Menu option to show to randomly turn the element. |
&nbsp;&nbsp;&nbsp;messages.rotateStraight | `FALSE` to hide it or [Option](#menu-option-structure) | Menu option to set the token in a straight position. |
&nbsp;&nbsp;&nbsp;messages.rotateUpsideDown | `FALSE` to hide it or [Option](#menu-option-structure) | Menu option to set the token on the upside-down position. |
&nbsp;&nbsp;&nbsp;messages.rotateRight | `FALSE` to hide it or [Option](#menu-option-structure) | Menu option to set the token on the right rotated position. |
&nbsp;&nbsp;&nbsp;messages.rotateLeft | `FALSE` to hide it or [Option](#menu-option-structure) | Menu option to set the token on the left rotated position. |

### Custom token

A marker that can be used to indicate a position on the table. It can be turned on the other side. (Customizable version)

#### Type identifiers

 * `"token-custom"`

#### Tags assigned by default

 * `"type:token"`

#### Supported macro events

 * `flip`
 * `setRotation`
 * `setSide`
 * `shuffle`
 * `spin`

#### Attributes

Name | Type | Description |
--- | --- | --- | 
side | `boolean` | Side on which the token is flipped. (`FALSE` for front, `TRUE` for back) |
rotation | `integer` | Element rotation side. (`0` for straight, `1` for right, `2` for upside-down, `3` for left) |
x | `float` (in mm) | Horizontal coordinate. |
y | `float` (in mm) | Vertical coordinate. |
tags | `[` `string` `,` `string` `,` ... `]` | List of tags by which it can be identified by other elements. |
zIndexGroup | `integer` | Depth group. The user will not be able to move elements with a lower value over elements with a higher value. (Default: `0`) |
fence | [Area](#area-structure) | Prevents the element from moving outside the specified area. |
snapTo |  | Establishes the positioning rules to follow when the element is moved. |
&nbsp;&nbsp;&nbsp;snapTo.tags | `[` `string` `,` `string` `,` ... `]` | Align the element to the elements with the specified tags. |
&nbsp;&nbsp;&nbsp;snapTo.grid | [Grid](#grid-structure) | Align the element to a grid. |
doNotFrame | `boolean` | If `TRUE`, excludes the element when the table is completely framed. |
onResetMacro | [Macro](#macro-structure) | Macro to run when the table is created or reset. |
onDropMacro | [Macro](#macro-structure) | Macro to run when the element is moved. |
onSelectMacro | [Macro](#macro-structure) | Macro to run when the element is selected. |
onShakeMacro | [Macro](#macro-structure) | Executes a macro when it is shaken. |
onClickMacro | [Macro](#macro-structure) | Macro to run when the element is clicked. |
onMenuMacros | `[` [Macro option](#macro-option-structure) `,` [Macro option](#macro-option-structure) `,` ... `]` | If the element supports the context menu, it shows additional options that allow you to run a macro. |
isVariableZIndex | `boolean` | If `TRUE`, it is brought to the front when selected. |
isDragTopSurfaces | `boolean` | If `TRUE`, the elements above will be transported when the element is moved. |
isDraggable | `boolean` | If `TRUE`, it can be moved by dragging. |
icon | `FALSE` to hide it, `TRUE` to use default values, or [Image](#image-structure) | Element icon. |
messages |  | Token messages. |
&nbsp;&nbsp;&nbsp;messages.flip | `FALSE` to hide it or [Option](#menu-option-structure) | Menu option to show to turn the element on the other face. |
&nbsp;&nbsp;&nbsp;messages.toss | `FALSE` to hide it or [Option](#menu-option-structure) | Menu option to show to toss the element like a coin. |
&nbsp;&nbsp;&nbsp;messages.spin | `FALSE` to hide it or [Option](#menu-option-structure) | Menu option to show to randomly turn the element. |
&nbsp;&nbsp;&nbsp;messages.rotateStraight | `FALSE` to hide it or [Option](#menu-option-structure) | Menu option to set the token in a straight position. |
&nbsp;&nbsp;&nbsp;messages.rotateUpsideDown | `FALSE` to hide it or [Option](#menu-option-structure) | Menu option to set the token on the upside-down position. |
&nbsp;&nbsp;&nbsp;messages.rotateRight | `FALSE` to hide it or [Option](#menu-option-structure) | Menu option to set the token on the right rotated position. |
&nbsp;&nbsp;&nbsp;messages.rotateLeft | `FALSE` to hide it or [Option](#menu-option-structure) | Menu option to set the token on the left rotated position. |
width | `float` (in mm) | Width. |
height | `float` (in mm) | Height. |
value | `integer` | Element value. |
mode | `integer` | Appearance of the token. (`0` for square, `1` for rounded, `2` for round) |
frame | `FALSE` to hide it, `TRUE` to use default values, or [Frame](#frame-structure) | Background block. |
image | `FALSE` to hide it, `TRUE` to use default values, or [Image](#image-structure) | Background image. |
label | [Text](#text-structure) | Token label text. |
labelText | [Text](#text-structure) | Text to show on the token. |
backgroundColor | [Color](#color-structure) | Base color of the element. |
isTransparent | `boolean` | If `TRUE`, it is possible to see what is underneath the element. |
flipImage | `FALSE` to hide it, `TRUE` to use default values, or [Image](#image-structure) | Token back background image. |
flipBackgroundColor | [Color](#color-structure) | Token back color. |
flipLabelText | [Text](#text-structure) | Text to show on the token back. |
flipValue | `integer` | Element value when it shows the back face. |
isRotating | `boolean` | If `TRUE`, the token can be rotated. |
isFlippable | `boolean` | If `TRUE`, the element can be turned on the other side. |
isSpinnable | `boolean` | If `TRUE`, the element can be rotated to a random direction. |
isCut | `boolean` | If `TRUE`, the token is a scissors-generated cutout. |

### Standard tray

A transparent area that helps with moving, summing, and rolling multiple elements. Shake it to roll all the elements placed over it.

#### Type identifiers

 * `"tray"`

#### Tags assigned by default

 * `"type:tray"`

#### Supported macro events

 * `shuffle`

#### Attributes

Name | Type | Description |
--- | --- | --- | 
x | `float` (in mm) | Horizontal coordinate. |
y | `float` (in mm) | Vertical coordinate. |
tags | `[` `string` `,` `string` `,` ... `]` | List of tags by which it can be identified by other elements. |
zIndexGroup | `integer` | Depth group. The user will not be able to move elements with a lower value over elements with a higher value. (Default: `0`) |
fence | [Area](#area-structure) | Prevents the element from moving outside the specified area. |
snapTo |  | Establishes the positioning rules to follow when the element is moved. |
&nbsp;&nbsp;&nbsp;snapTo.tags | `[` `string` `,` `string` `,` ... `]` | Align the element to the elements with the specified tags. |
&nbsp;&nbsp;&nbsp;snapTo.grid | [Grid](#grid-structure) | Align the element to a grid. |
doNotFrame | `boolean` | If `TRUE`, excludes the element when the table is completely framed. |
onResetMacro | [Macro](#macro-structure) | Macro to run when the table is created or reset. |
onDropMacro | [Macro](#macro-structure) | Macro to run when the element is moved. |
onSelectMacro | [Macro](#macro-structure) | Macro to run when the element is selected. |
onShakeMacro | [Macro](#macro-structure) | Executes a macro when it is shaken. |
onClickMacro | [Macro](#macro-structure) | Macro to run when the element is clicked. |
onMenuMacros | `[` [Macro option](#macro-option-structure) `,` [Macro option](#macro-option-structure) `,` ... `]` | If the element supports the context menu, it shows additional options that allow you to run a macro. |
isVariableZIndex | `boolean` | If `TRUE`, it is brought to the front when selected. |
isDragTopSurfaces | `boolean` | If `TRUE`, the elements above will be transported when the element is moved. |
isDraggable | `boolean` | If `TRUE`, it can be moved by dragging. |
icon | `FALSE` to hide it, `TRUE` to use default values, or [Image](#image-structure) | Element icon. |
mode | `integer` | Tray Mode. (`-1` for no mode, `0` for add only, `1` for add/subtract) |
backgroundColor | [Color](#color-structure) | Base color of the element. |
messages |  | Tray messages. |
&nbsp;&nbsp;&nbsp;messages.shake | `FALSE` to hide it or [Option](#menu-option-structure) | Menu option to show to shake the tray. |

### Card shuffler

A tray that handles tokens or cutouts such as a deck of cards.

#### Type identifiers

 * `"tray-cardshuffler"`

#### Tags assigned by default

 * `"type:tray"`

#### Supported macro events

 * `shuffle`

#### Attributes

Name | Type | Description |
--- | --- | --- | 
x | `float` (in mm) | Horizontal coordinate. |
y | `float` (in mm) | Vertical coordinate. |
tags | `[` `string` `,` `string` `,` ... `]` | List of tags by which it can be identified by other elements. |
zIndexGroup | `integer` | Depth group. The user will not be able to move elements with a lower value over elements with a higher value. (Default: `0`) |
fence | [Area](#area-structure) | Prevents the element from moving outside the specified area. |
snapTo |  | Establishes the positioning rules to follow when the element is moved. |
&nbsp;&nbsp;&nbsp;snapTo.tags | `[` `string` `,` `string` `,` ... `]` | Align the element to the elements with the specified tags. |
&nbsp;&nbsp;&nbsp;snapTo.grid | [Grid](#grid-structure) | Align the element to a grid. |
doNotFrame | `boolean` | If `TRUE`, excludes the element when the table is completely framed. |
onResetMacro | [Macro](#macro-structure) | Macro to run when the table is created or reset. |
onDropMacro | [Macro](#macro-structure) | Macro to run when the element is moved. |
onSelectMacro | [Macro](#macro-structure) | Macro to run when the element is selected. |
onShakeMacro | [Macro](#macro-structure) | Executes a macro when it is shaken. |
onClickMacro | [Macro](#macro-structure) | Macro to run when the element is clicked. |
onMenuMacros | `[` [Macro option](#macro-option-structure) `,` [Macro option](#macro-option-structure) `,` ... `]` | If the element supports the context menu, it shows additional options that allow you to run a macro. |
isVariableZIndex | `boolean` | If `TRUE`, it is brought to the front when selected. |
isDragTopSurfaces | `boolean` | If `TRUE`, the elements above will be transported when the element is moved. |
isDraggable | `boolean` | If `TRUE`, it can be moved by dragging. |
icon | `FALSE` to hide it, `TRUE` to use default values, or [Image](#image-structure) | Element icon. |
backgroundColor | [Color](#color-structure) | Base color of the element. |
width | `float` (in mm) | Width. |
height | `float` (in mm) | Height. |
messages |  | Tray messages. |
&nbsp;&nbsp;&nbsp;messages.shake | `FALSE` to hide it or [Option](#menu-option-structure) | Menu option to show to shake the tray. |
label | `FALSE` to hide it, `TRUE` to use default values, or [Label](#text-label-structure) | Tray text label. |
labelText | [Text](#text-structure) | Text to show on the tray. |
image | `FALSE` to hide it, `TRUE` to use default values, or [Image](#image-structure) | Background image. |

### Custom tray

A transparent area that helps with moving, summing, and rolling multiple elements. Shake it to roll all the elements placed over it. (Customizable version)

#### Type identifiers

 * `"tray-custom"`

#### Tags assigned by default

 * `"type:tray"`

#### Supported macro events

 * `shuffle`

#### Attributes

Name | Type | Description |
--- | --- | --- | 
x | `float` (in mm) | Horizontal coordinate. |
y | `float` (in mm) | Vertical coordinate. |
tags | `[` `string` `,` `string` `,` ... `]` | List of tags by which it can be identified by other elements. |
zIndexGroup | `integer` | Depth group. The user will not be able to move elements with a lower value over elements with a higher value. (Default: `0`) |
fence | [Area](#area-structure) | Prevents the element from moving outside the specified area. |
snapTo |  | Establishes the positioning rules to follow when the element is moved. |
&nbsp;&nbsp;&nbsp;snapTo.tags | `[` `string` `,` `string` `,` ... `]` | Align the element to the elements with the specified tags. |
&nbsp;&nbsp;&nbsp;snapTo.grid | [Grid](#grid-structure) | Align the element to a grid. |
doNotFrame | `boolean` | If `TRUE`, excludes the element when the table is completely framed. |
onResetMacro | [Macro](#macro-structure) | Macro to run when the table is created or reset. |
onDropMacro | [Macro](#macro-structure) | Macro to run when the element is moved. |
onSelectMacro | [Macro](#macro-structure) | Macro to run when the element is selected. |
onShakeMacro | [Macro](#macro-structure) | Executes a macro when it is shaken. |
onClickMacro | [Macro](#macro-structure) | Macro to run when the element is clicked. |
onMenuMacros | `[` [Macro option](#macro-option-structure) `,` [Macro option](#macro-option-structure) `,` ... `]` | If the element supports the context menu, it shows additional options that allow you to run a macro. |
isVariableZIndex | `boolean` | If `TRUE`, it is brought to the front when selected. |
isDragTopSurfaces | `boolean` | If `TRUE`, the elements above will be transported when the element is moved. |
isDraggable | `boolean` | If `TRUE`, it can be moved by dragging. |
icon | `FALSE` to hide it, `TRUE` to use default values, or [Image](#image-structure) | Element icon. |
width | `float` (in mm) | Width. |
height | `float` (in mm) | Height. |
label | `FALSE` to hide it, `TRUE` to use default values, or [Label](#text-label-structure) | Tray text label. |
labelText | [Text](#text-structure) | Text to show on the tray. |
frame | `FALSE` to hide it, `TRUE` to use default values, or [Frame](#frame-structure) | Background block. |
mode | `integer` | Tray Mode. (`-1` for no mode, `0` for add only, `1` for add/subtract) |
backgroundColor | [Color](#color-structure) | Base color of the element. |
splitPosition | `float` (0-1) | Width ratio between the sum area and the subtraction area. |
countValues | `integer` | Counts the number of elements on the tray with the specified value instead of adding their value. |
sumLabel | [Label](#text-label-structure) | Sum value text label applied to the background block. (for add only) |
leftLabel | [Label](#text-label-structure) | Value to sum text label. (for add/subtract only) |
rightLabel | ([Frame](#frame-structure) + [Label](#text-label-structure)) | Value to subtract text label. (for add/subtract only) |
bottomLabel | [Label](#text-label-structure) | Result text label. (for add/subtract only) |
messages |  | Tray messages. |
&nbsp;&nbsp;&nbsp;messages.shake | `FALSE` to hide it or [Option](#menu-option-structure) | Menu option to show to shake the tray. |
image | `FALSE` to hide it, `TRUE` to use default values, or [Image](#image-structure) | Background image. |

## Structures

Some elements use complex, shared structures to describe their attributes. In Notoner JSON descriptors, they are represented as simple JSON sub-structures:

```
{
	(Attribute name): (Attribute value),
	...
}
```


### Text structure

#### Attributes

Name | Type | Description |
--- | --- | --- | 
EN | `string` | English text. (Used as default if the user-selected language translation is missing) |
IT | `string` | Italian text. |

### Translated URL structure

#### Attributes

Name | Type | Description |
--- | --- | --- | 
EN | [URL Resource](#resource-url-structure) | English URL. (Used as default if the user-selected language translation is missing) |
IT | [URL Resource](#resource-url-structure) | Italian url. |

### Area structure

#### Attributes

Name | Type | Description |
--- | --- | --- | 
x | `float` (in mm) | Horizontal coordinate. |
y | `float` (in mm) | Vertical coordinate. |
width | `float` (in mm) | Width. |
height | `float` (in mm) | Height. |

### Grid structure

#### Attributes

Name | Type | Description |
--- | --- | --- | 
x | `float` | Horizontal position of the grid origin. |
y | `float` | Vertical position of the grid origin. |
width | `float` | Grid cell width. |
height | `float` | Grid cell height. |

### Macro structure

A macro is described by an array of objects. Each object describes one or multiple actions to perform on a set of elements.

If a macro has just one line you can omit the array and describe the action object only. I.e., the `[ { "forEach": { "setSide": true } } ]` macro contains a single action, so it can be shortened with `{ "forEach": { "setSide": true } }`. Most values ​​that can be specified in a macro, such as boolean, numbers, or elements, can be replaced by a [macro getter](#macro-getter-structure).

#### Attributes

Name | Type | Description |
--- | --- | --- | 
getElementsByTag | `[` `string` `,` `string` `,` ... `]` | Select all the table elements with the specified tags. If not specified it uses the current element or the elements selected in the previous line. |
getRest | `boolean` | If `TRUE`, select all elements discarded by the `on` statement of the macro previous line. |
onElements |  | Select an element subset to be used by this macro line. All clauses are evaluated in `AND`. |
&nbsp;&nbsp;&nbsp;onElements.self | `boolean` | If `TRUE`, add the current element to the selected elements. |
&nbsp;&nbsp;&nbsp;onElements.if | [Macro condition](#macro-condition-structure) | Determines if the element should be selected. |
&nbsp;&nbsp;&nbsp;onElements.pickRandom | `integer` | Selects a random subset of the selected elements. |
if | [Macro condition](#macro-condition-structure) | Determines if the `execute`, `forEach`, `do`, and `onRestDo` will be executed. |
times | `integer` | Executes the `execute`, `forEach`, `do`, and `onRestDo` statements the specified number of times. Default to `1`. |
set | `{` Variable name `:` Variable value `,` Variable name `:` Variable value... `}` | Assign values to multiple variables. |
execute |  | Executes an interface action. |
&nbsp;&nbsp;&nbsp;execute.setTool |  | Set the selected tool. |
&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;execute.setTool.id | `string` | Tool type. (`"pencil"` or `"eraser"`) |
&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;execute.setTool.config | `string` | Tool configuration. (for pencil: `"blue"`, `"green"`, `"red"`, `"yellow"`, `"cyan"`, `"purple"`, or `"black"`. For eraser: `"small"`, `"medium"`, or `"large"`) |
forEach |  | Performs a set of actions on the selected elements. |
&nbsp;&nbsp;&nbsp;forEach.shuffleZIndex | `boolean` | If `TRUE`, it shuffles the depth position of the elements, similar to how you shuffle a deck of cards. |
&nbsp;&nbsp;&nbsp;forEach.invertZIndex | `boolean` | If `TRUE`, it inverts the depth position of the elements, similar to how you flip a deck of cards upside down. |
&nbsp;&nbsp;&nbsp;forEach.shufflePosition | `boolean` | If `TRUE`, it shuffles the horizontal and vertical position of the elements. |
&nbsp;&nbsp;&nbsp;forEach.select | `boolean` | If `TRUE`, it adds the elements to the current selection. |
&nbsp;&nbsp;&nbsp;forEach.toss | `boolean` | If supported and `TRUE`, toss the element like a coin. |
&nbsp;&nbsp;&nbsp;forEach.launch | `boolean` | If supported and `TRUE`, launch the element. |
&nbsp;&nbsp;&nbsp;forEach.roll | `boolean` | If supported and `TRUE`, roll the element. |
&nbsp;&nbsp;&nbsp;forEach.flip | `boolean` | If supported and `TRUE`, flip the element upside-down. |
&nbsp;&nbsp;&nbsp;forEach.reset | `boolean` | If supported and `TRUE`, reset the element. |
&nbsp;&nbsp;&nbsp;forEach.toggle | `boolean` | If supported and `TRUE`, invert the element state. |
&nbsp;&nbsp;&nbsp;forEach.stop | `boolean` | If supported and `TRUE`, stop the element. |
&nbsp;&nbsp;&nbsp;forEach.start | `boolean` | If supported and `TRUE`, start the element. |
&nbsp;&nbsp;&nbsp;forEach.shuffle | `boolean` | If supported and `TRUE`, start the element shuffle animation. |
&nbsp;&nbsp;&nbsp;forEach.spin | `boolean` | If supported and `TRUE`, the element is rotated to a random orientation. |
&nbsp;&nbsp;&nbsp;forEach.shake | `boolean` | If supported and `TRUE`, it shakes the element. |
&nbsp;&nbsp;&nbsp;forEach.stopAnimation | `boolean` | If `TRUE`, stop the playing animation. |
&nbsp;&nbsp;&nbsp;forEach.setSide | `boolean` or `integer` | If supported, set the element side. (`FALSE` for front, `TRUE` for back, or a number starting from `0` for a dice side index) |
&nbsp;&nbsp;&nbsp;forEach.setLastVector | [Vector](#vector-structure) | If supported, set the element target point vector. |
&nbsp;&nbsp;&nbsp;forEach.setLastPoint | [Point](#point-position-structure) | If supported, set the coordinates on the target point on the table. |
&nbsp;&nbsp;&nbsp;forEach.setLastStep | `integer` | If supported, set the step for the next paint. |
&nbsp;&nbsp;&nbsp;forEach.setLastArea | [Area](#area-structure) | If supported, set the selected area. |
&nbsp;&nbsp;&nbsp;forEach.setRotation | `integer` | If supported, set the element rotation. (`0` for straight, `1` for right, `2` for upside-down, `3` for left) |
&nbsp;&nbsp;&nbsp;forEach.setValue | `float` | If supported, set the element value. |
&nbsp;&nbsp;&nbsp;forEach.sumValue | `float` | If supported, sum the value to the element value. |
&nbsp;&nbsp;&nbsp;forEach.subtractValue | `float` | If supported, subtract the value from the element value. |
&nbsp;&nbsp;&nbsp;forEach.paint | `boolean` | If supported and `TRUE`, paint with the element. |
&nbsp;&nbsp;&nbsp;forEach.moveOnTop | `boolean` | If `TRUE`, it moves the elements on top. |
&nbsp;&nbsp;&nbsp;forEach.moveToTable | [Stack](#stack-structure) | It moves the elements to an absolute table position. |
&nbsp;&nbsp;&nbsp;forEach.moveIntoTable | [Area](#area-structure) | It moves the element to a random position in an absolute table area. |
&nbsp;&nbsp;&nbsp;forEach.moveTo | [Stack](#stack-structure) | It moves the elements to a relative position. |
&nbsp;&nbsp;&nbsp;forEach.moveInto | [Area](#area-structure) | It moves the element to a random position in a relative area. |
&nbsp;&nbsp;&nbsp;forEach.moveBy |  | It moves the element horizontally or vertically by a value. |
&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;forEach.moveBy.x | `float` (in mm) | Horizontal coordinate. |
&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;forEach.moveBy.y | `float` (in mm) | Vertical coordinate. |
&nbsp;&nbsp;&nbsp;forEach.do | [Macro](#macro-structure) | Runs a new macro selecting every element. |
do | [Macro](#macro-structure) | Runs a sub-macro on the selected elements. |
onRestDo | [Macro](#macro-structure) | Runs a sub-macro on the elements discarded by the `on` statement. |
break | `boolean` | If `TRUE`, stop the currently running sub-macro. |
else | [Macro](#macro-structure) | Macro to be executed when the `if` condition is not verified. |

### Macro option structure

#### Attributes

Name | Type | Description |
--- | --- | --- | 
if | [Macro condition](#macro-condition-structure) | Determines whether the option should be shown. |
title | [Text](#text-structure) | Option label. |
icon | [URL Resource](#resource-url-structure) or [Canvas Resource](#canvas-structure) or [SVG Resource](#svg-structure) | Option icon. |
macro | [Macro](#macro-structure) | Macro to execute when selected. |

### Image structure

#### Attributes

Name | Type | Description |
--- | --- | --- | 
x | `float` (in mm) | Horizontal coordinate. |
y | `float` (in mm) | Vertical coordinate. |
width | `float` (in mm) | Width. |
height | `float` (in mm) | Height. |
opacity | `float` (0-1) | Opacity. (`1` for fully visible, `0` for invisible) |
padding | `float` (in mm) | Spacing between the content and the border. |
borderRadius | `float` (in mm) | Border radius. |
baseColor | [Color](#color-structure) | Color to be used instead of the `baseColor` defined in the `image` metadata. |
image | [URL Resource](#resource-url-structure) or [Canvas Resource](#canvas-structure) or [SVG Resource](#svg-structure) | Image. |

### Color structure

#### Attributes

Name | Type | Description |
--- | --- | --- | 
r | `integer` (0-255) | Red value. |
g | `integer` (0-255) | Green value. |
b | `integer` (0-255) | Blue value. |
a | `float` (0-1) | Color opacity. (`1` for opaque, `0` for invisible) |

### Menu option structure

#### Attributes

Name | Type | Description |
--- | --- | --- | 
title | [Text](#text-structure) | Option label. |
icon | [URL Resource](#resource-url-structure) or [Canvas Resource](#canvas-structure) or [SVG Resource](#svg-structure) | Option icon. |

### Popup message structure

#### Attributes

Name | Type | Description |
--- | --- | --- | 
title | [Text](#text-structure) | Message text. |

### Frame structure

#### Attributes

Name | Type | Description |
--- | --- | --- | 
x | `float` (in mm) | Horizontal coordinate. |
y | `float` (in mm) | Vertical coordinate. |
width | `float` (in mm) | Width. |
height | `float` (in mm) | Height. |
opacity | `float` (0-1) | Opacity. (`1` for fully visible, `0` for invisible) |
padding | `float` (in mm) | Spacing between the content and the border. |
borderRadius | `float` (in mm) | Border radius. |
right | `float` (in mm) | Distance from the right edge. |
bottom | `float` (in mm) | Distance from the bottom edge. |
borderSize | `float` (in mm) | Border size. |
backgroundColor | [Color](#color-structure) | Background color. |
boxShadow |  | Shadow. |
&nbsp;&nbsp;&nbsp;boxShadow.x | `float` (in mm) | Horizontal offset of the shadow. |
&nbsp;&nbsp;&nbsp;boxShadow.y | `float` (in mm) | Vertical offset of the shadow. |
&nbsp;&nbsp;&nbsp;boxShadow.size | `float` (in mm) | Shadow diffusion. |
&nbsp;&nbsp;&nbsp;boxShadow.color | [Color](#color-structure) | Shadow color. |
&nbsp;&nbsp;&nbsp;boxShadow.type | `string` | Shadow type. (`"inset"` o not specified) |

### Text label structure

#### Attributes

Name | Type | Description |
--- | --- | --- | 
x | `float` (in mm) | Horizontal coordinate. |
y | `float` (in mm) | Vertical coordinate. |
width | `float` (in mm) | Width. |
height | `float` (in mm) | Height. |
opacity | `float` (0-1) | Opacity. (`1` for fully visible, `0` for invisible) |
padding | `float` (in mm) | Spacing between the content and the border. |
borderRadius | `float` (in mm) | Border radius. |
lineHeight | `float` (in mm) | Line height. |
strokeWidth | `float` (in mm) | Text border size. |
strokeColor | [Color](#color-structure) | Text border color. |
textColor | [Color](#color-structure) | Text color. |
fontSize | `float` (in mm) | Text size. |
fontFamily | `string` | Text font. |
fontWeight | `string` | Text weight. |
textAlign | `"auto"` or `"left"` or `"right"` or `"center"` | Text alignment. |
whiteSpace | `"normal"` or "`nowrap"` | Controls how white space inside is handled. |
overflow | `"visible"` or "`hidden"` | Controls what happens to content that is too big to fit into an area. |

### Point position structure

#### Attributes

Name | Type | Description |
--- | --- | --- | 
x | `float` (in mm) | Horizontal coordinate. |
y | `float` (in mm) | Vertical coordinate. |

### Counter button structure

#### Attributes

Name | Type | Description |
--- | --- | --- | 
frame | ([Frame](#frame-structure) + [Label](#text-label-structure)) | Button appearance. |
frameText | [Text](#text-structure) | Button text. |
onSelect | [Action](#counter-button-action-structure) | Button action. |

### Counter menu button structure

#### Attributes

Name | Type | Description |
--- | --- | --- | 
title | [Text](#text-structure) | Option label. |
icon | [URL Resource](#resource-url-structure) or [Canvas Resource](#canvas-structure) or [SVG Resource](#svg-structure) | Option icon. |
onSelect | [Action](#counter-button-action-structure) | Button action. |

### Resource URL structure

#### Attributes

Name | Type | Description |
--- | --- | --- | 
isResource | `TRUE` | Establishes that the object represents a resource. |
type | `"url"` | Resource type. |
url | `string` | Resource URL. If it starts with `/` (i.e., `"/images/elements/dice-default.svg"`) it refers to the Notoner root directory. On template files, relative paths (i.e., `"sheets/sheet-1-EN.svg"`) are referred to the template directory. |
meta | [Metadata](#resource-metadata-structure) | Resource metadata. |

### Canvas structure

#### Attributes

Name | Type | Description |
--- | --- | --- | 
isResource | `TRUE` | Establishes that the object represents a resource. |
type | `"canvas"` | Resource type. |
file | `string` | Name of the image file in the package. The path is always relative (i.e., `"sheet-1-EN.svg"`) and refers to the package root. |
meta | [Metadata](#resource-metadata-structure) | Resource metadata. |

### SVG structure

#### Attributes

Name | Type | Description |
--- | --- | --- | 
isResource | `TRUE` | Establishes that the object represents a resource. |
type | `"svg"` | Resource type. |
file | `string` | Name of the image file in the package. |
meta | [Metadata](#resource-metadata-structure) | Resource metadata. |

### Vector structure

#### Attributes

Name | Type | Description |
--- | --- | --- | 
angle | `float` (in radians) | Angle from the target point. |
length | `float` (in mm) | Distance from the target point. |

### Area option structure

#### Attributes

Name | Type | Description |
--- | --- | --- | 
title | [Text](#text-structure) | Option label. |
icon | [URL Resource](#resource-url-structure) or [Canvas Resource](#canvas-structure) or [SVG Resource](#svg-structure) | Option icon. |
x | `float` (in mm) | Horizontal coordinate. |
y | `float` (in mm) | Vertical coordinate. |
width | `float` (in mm) | Width. |
height | `float` (in mm) | Height. |

### Translated resource structure

#### Attributes

Name | Type | Description |
--- | --- | --- | 
EN | [URL Resource](#resource-url-structure) or [Canvas Resource](#canvas-structure) or [SVG Resource](#svg-structure) | English resource. (Used as default if the user-selected language translation is missing) |
IT | [URL Resource](#resource-url-structure) or [Canvas Resource](#canvas-structure) or [SVG Resource](#svg-structure) | Italian resource. |

### Macro condition structure

A macro condition is described by an array of objects. Each object describes one or multiple sub-conditions.

If a macro condition has just one line you can omit the array and describe the condition object only. I.e., the `[ { "isCollidingWith": { "get": [ "elementByTag", "deck" ] } } ]` macro condition contains a single condition, so it can be shortened with `{ "isCollidingWith": { "get": [ "elementByTag", "deck" ] } }`.

#### Attributes

Name | Type | Description |
--- | --- | --- | 
value | [Macro getter](#macro-getter-structure) | Determines the value to be verified. If not specified, consider the current element. |
isValued | `boolean` | If `TRUE`, test if the value to verify is _true-ish_. |
isNotValued | `boolean` | If `TRUE`, test if the value to verify is _false-ish_. |
isEqualTo | Any | Tests whether the value to be tested is equal to the specified value. |
isNotEqualTo | Any | Tests whether the value to be tested is not equal to the specified value. |
isSameTo | Any | Tests whether the value to be tested is identical to the specified value. It's useful to check an element's identity. |
isNotSameTo | Any | Tests whether the value to be tested is not identical to the specified value. It's useful to check an element's identity. |
isGreaterThan | Any | Tests whether the value to be tested is greater than the specified value. |
isGreaterEqualThan | Any | Tests whether the value to be tested is greater than or equal to the specified value. |
isLessThan | Any | Tests whether the value to be tested is lower than the specified value. |
isLessEqualThan | Any | Tests whether the value to be tested is lower than or equal to the specified value. |
isCollidingWith | Any | Tests whether the value to be tested is an element colliding with the specified element. |
isNotCollidingWith | Any | Tests whether the value to be tested is an element not colliding with the specified element. |
isOver | Any | Tests whether the value to be tested is an element with a higher z-index than the specified element. |
isNotOver | Any | Tests whether the value to be tested is an element with a lower z-index than the specified element. |
isCovering | Any | Tests whether the value to be tested is an element that does fully or partially cover the specified element. |
isNotCovering | Any | Tests whether the value to be tested is an element that does not fully or partially cover the specified element. |
isCoveredBy | Any | Tests whether the value to be tested is an element that is fully or partially covered by the specified element. |
isNotCoveredBy | Any | Tests whether the value to be tested is an element that is not fully or partially covered by the specified element. |
hasTag | `[` `string` `,` `string` `,` ... `]` | Tests whether the value to be tested is an element having one of the specified tags. |
hasNotTag | `[` `string` `,` `string` `,` ... `]` | Tests whether the value to be tested is an element having none of the specified tags. |
isSelected | `boolean` | If `TRUE`, test if the value is a highlighted element. |
isNotSelected | `boolean` | If `TRUE`, test if the value is not a highlighted element. |
not | `boolean` | If `TRUE`, returns the evaluated conditions' opposite value. |

### Stack structure

#### Attributes

Name | Type | Description |
--- | --- | --- | 
x | `float` (in mm) | Horizontal coordinate. |
y | `float` (in mm) | Vertical coordinate. |
gapX | `float` (in mm) | Specifies the horizontal distance between an element and the next one. |
gapY | `float` (in mm) | Specifies the vertical distance between an element and the next one. |

### Counter button action structure

#### Attributes

Name | Type | Description |
--- | --- | --- | 
sumValue | `float` | Adds the specified value to the counter value. |
subtractValue | `float` | Subtracts the specified value to the counter value. |
setValue | `float` | Sets the counter value. |
macro | [Macro](#macro-structure) | Macro to execute when selected. |

### Resource metadata structure

#### Attributes

Name | Type | Description |
--- | --- | --- | 
sprite |  | Defines how to use the resource as a sprite. |
&nbsp;&nbsp;&nbsp;sprite.width | `integer` | Sprite frame width. |
&nbsp;&nbsp;&nbsp;sprite.height | `integer` | Sprite frame height. |
&nbsp;&nbsp;&nbsp;sprite.gapX | `integer` | Horizontal distance between one sprite frame and another. |
&nbsp;&nbsp;&nbsp;sprite.frame | `integer` | Sprite frame index to be used. |
crop |  | Defines the image crop to use. |
&nbsp;&nbsp;&nbsp;crop.x | `float` | Horizontal position of the image crop. |
&nbsp;&nbsp;&nbsp;crop.y | `float` | Vertical position of the image crop. |
&nbsp;&nbsp;&nbsp;crop.width | `float` | Width of the image crop. |
&nbsp;&nbsp;&nbsp;crop.height | `float` | Height of the image crop. |
&nbsp;&nbsp;&nbsp;crop.imageWidth | `integer` | Width of the entire image. Mandatory for images in SVG format. |
&nbsp;&nbsp;&nbsp;crop.imageHeight | `integer` | Height of the entire image. Mandatory for images in SVG format. |
svg |  | Defines the SVG special attributes. |
&nbsp;&nbsp;&nbsp;svg.baseColor | `string` | String to be replaced by the `baseColor` attribute when created by [Image](#image-structure). |

### Macro getter structure

Most values ​​that can be specified in a macro, such as boolean, numbers, or elements, can be replaced by a _macro getter_.

A macro getter is an object that describes a procedure for obtaining the value it replaces. For example, you can use the macro getter `{ "get": "element.x" }` to get the horizontal position value of the current element.

#### Attributes

Name | Type | Description |
--- | --- | --- | 
get | `[` Any `,` Any `,` ... `]` | Executes an operations chain separated by `.` to get a value. |
&nbsp; | `"elementsByTag"`, `string` or `[` `string` `,` `string` `,` ... `]` | Returns the element with the specified tag or tags. |
&nbsp; | `"elementByTag"`, `string` or `[` `string` `,` `string` `,` ... `]` | Returns a single element with the specified tag or tags. |
&nbsp; | `"variable"`, `string` | Returns a variable value. The `self` variable refers to the element that launched the macro. |
&nbsp; | `"rest"` | Returns all elements discarded by the `on` statement of the macro previous line. |
&nbsp; | `"elements"` | Returns all elements considered by the current macro line. |
&nbsp; | `"element"` | Returns the current element. |
&nbsp; | `"count"` | Returns the selected elements count. |
&nbsp; | `"first"` | Returns the first of the selected elements. |
&nbsp; | `"last"` | Returns the last of the selected elements. |
&nbsp; | `string` | Returns the selected element attribute value. |
variable | `string` | Returns a variable value. The `self` variable refers to the element that launched the macro. |
self | `boolean` | Returns the element that launched the macro. |
random |  | Returns a random value. |
&nbsp;&nbsp;&nbsp;random.value | `[` Any `,` Any `,` ... `]` | Returns a random value from the specified list. |
&nbsp;&nbsp;&nbsp;random.number |  | Returns a random number. |
&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;random.number.from | `float` | Sets the lowest number. (included) If not specified, `0`. |
&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;random.number.to | `float` | Sets the highest number. (excluded) If not specified, `0`. |
&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;random.number.step | `float` | Sets the step to be used. If not specified, `1`. |
sum | `[` Any `,` Any `,` ... `]` | Returns the sum of the specified values. |
subtract | `[` Any `,` Any `,` ... `]` | Returns the subtraction of the specified values. |
multiply | `[` Any `,` Any `,` ... `]` | Returns the multiplication between the specified values. |
divide | `[` Any `,` Any `,` ... `]` | Returns the division between the specified values. |

