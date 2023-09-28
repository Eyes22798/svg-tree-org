# svg-tree-org

> A simple organization tree chart based on svg and Vue2.x

Features:
+ Expand and shrink
+ switch direction
+ custom node by slot
+ custom line
+ zoom
+ drag
+ fitContent

## Usage

### NPM

```
# use npm
npm i eyes22798/svg-tree-org

# use yarn
yarn add eyes22798/svg-tree-org
```
### Import Plugins

``` js
import Vue from 'vue'
import SvgTreeOrg from '@eyes22798/svg-tree-org'

Vue.use(SvgTreeOrg)

// ...
```


## API

#### props

  prop              | descripton                              | type                   | default
  ------------------|-----------------------------------------|:----------------------:|:---------------------------------------------------------:
  data              |                                         | `Array`                |
  direction         |                                         | `String`               | `vertical`
  zoomable          |                                         | `Boolean`              | `true`
  draggable         |                                         | `Boolean`              | `true`
  collapsable       |  children node is collapsable           | `Boolean`              | `false`
  treeCenter        |  center vertically and horizontally     | `Boolean`              | `true`
  defaultScale      |  graph init scale                       | `Number`               | `1`
  lineColor         |  line color                             | `String`               | `#ddd`
  lineWidth         |  line width                             | `String`               | `1px`
  lineArrow         |  line decorate right arrow              | `Object`               | `{ open: false, markerWidth: 5, markerHeight: 8, refX: 0, refY: 4, margin: 0 }`
  lineCircle        |  line decorate left dot                 | `Object`               | `{ open: false, markerWidth: 5, markerHeight: 8, refX: 0, refY: 4, r: 3, strokeWidth: 2, margin: 4 }`
  nodeWidth         |  set node width                         | `Number`               |  `100`
  nodeHeight        |  set node height                        | `Number`               |  `60`
  rootNodesep       |  root svg sep                           | `Number`               |  `10`
  marginSize        |  node sep                               | `Number`               |  `10`
  linkNodeData      |  Cross node link                        | `Array`                |     -


### events

  event name        | descripton                              | type
  ------------------|-----------------------------------------|:----------------------
  click             |  Click event                            | `Function`
  mouseover         |  onMouseOver event                      | `Function`
  mouseout          |  onMouseOut event                       | `Function`

### Call events

#### on-line-mouseover
It is called when the mouse hovers over the line.

- params `e` `Event`
- params `data` `Current node data`

#### on-line-mouseout
It is called when the mouse leaves the line.

- params `e` `Event`
- params `data` `Current node data`

## Example

  ![default](./screenshot.png)

## License
[MIT](./LICENSE)
