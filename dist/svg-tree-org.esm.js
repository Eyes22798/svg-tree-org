import { defineComponent, toRefs, computed, ref, inject, watch, onMounted, nextTick, provide } from '@vue/composition-api';

function _defineProperty(obj, key, value) {
  key = _toPropertyKey(key);
  if (key in obj) {
    Object.defineProperty(obj, key, {
      value: value,
      enumerable: true,
      configurable: true,
      writable: true
    });
  } else {
    obj[key] = value;
  }
  return obj;
}
function _toPrimitive(input, hint) {
  if (typeof input !== "object" || input === null) return input;
  var prim = input[Symbol.toPrimitive];
  if (prim !== undefined) {
    var res = prim.call(input, hint || "default");
    if (typeof res !== "object") return res;
    throw new TypeError("@@toPrimitive must return a primitive value.");
  }
  return (hint === "string" ? String : Number)(input);
}
function _toPropertyKey(arg) {
  var key = _toPrimitive(arg, "string");
  return typeof key === "symbol" ? key : String(key);
}

const transformData2Tree = data => {
  let treeData = JSON.parse(JSON.stringify(data));
  const findChild = rootEl => {
    const a = treeData.filter(v => v.parent_id === rootEl.id);
    if (rootEl.id === 0) {
      // marker first root node
      a[0].first = true;
    }
    const b = treeData.filter(v => v.parent_id !== rootEl.id);
    treeData = b;
    rootEl.children = a;
    const level = isNaN(rootEl?.level ?? 0) ? 1 : Number(rootEl.level) + 1;
    for (const v of rootEl?.children ?? []) {
      v.level = level;
      findChild(v);
    }
  };
  const top = {
    id: 0,
    level: 0
  };
  findChild(top);
  treeData = top.children || [];
  treeData.forEach(item => {
    if (!item.first) {
      findFirstLeafNode([item]);
    }
  });
  return treeData;
};
function findFirstLeafNode(tree) {
  if (!Array.isArray(tree) || tree.length === 0) {
    return null; // 如果树为空或不是数组，返回 null
  }

  for (const node of tree) {
    if (!node.children || node.children.length === 0) {
      // 如果节点没有子节点，即为叶子节点
      return node;
    } else {
      // 如果节点有子节点，递归查找子节点中的第一个叶子节点
      const firstLeaf = findFirstLeafNode(node.children);
      if (firstLeaf) {
        firstLeaf.firstLeafNode = true;
        return firstLeaf; // 返回第一个叶子节点
      }
    }
  }

  return null; // 如果树中没有叶子节点，返回 null
}

const findTreeNode = (id, tree) => {
  if (!Array.isArray(tree) || tree.length === 0) {
    return null;
  }
  for (const node of tree) {
    if (node.id === id) {
      return node;
    }
    if (node.children && node.children.length > 0) {
      const current = findTreeNode(id, node.children);
      if (current) return current;
    }
  }
  return null;
};
const makeSVG = (tag, attrs = {}) => {
  const ns = 'http://www.w3.org/2000/svg',
    xlinkns = 'http://www.w3.org/1999/xlink';
  const el = document.createElementNS(ns, tag);
  if (tag === 'svg') {
    el.setAttribute('xmlns:xlink', xlinkns);
    el.setAttribute('draggable', 'true');
  }
  // 动态插入 svg 子元素
  for (const k in attrs) {
    k === 'xlink:href' ? el.setAttributeNS(xlinkns, k, attrs[k]) : el.setAttribute(k, attrs[k]);
  }
  return el;
};

class TreeNode {
  // 节点主文本 有换行的情况，需要分段显示
  // 节点最终宽度
  // 节点最终高度

  // 前一个兄弟节点
  // 后一个兄弟节点
  // 父节点

  constructor(props = {}) {
    // x 坐标
    // y 坐标
    _defineProperty(this, "direction", 'horizontal');
    // 文字排列方向  horizontal:水平   vertical:垂直
    _defineProperty(this, "treeDirection", 'horizontal');
    // 方向  horizontal:水平   vertical:垂直
    _defineProperty(this, "nodeText", []);
    for (const k in props) this[k] = props[k];
  }
  // 设置节点文本
  setNodeText() {
    console.log(this.nodeText);
  }
  // 节点矩形框
  createRect() {
    return makeSVG('rect');
  }
  // 节点文字
  createText() {
    return makeSVG('g');
  }
  // 节点操作按钮
  createTools() {
    return makeSVG('text');
  }
  // 父子节点连接线
  createLine() {
    return makeSVG('g');
  }
}

const paddingSize = 5; // 一个节点的padding值
const maxWidth = 200; // 节点矩形框最大宽度
const maxHeight = 200; // 节点矩形框最大高度
const lineHeight = 10; // 文字行间距
const toolsHeight = 10;
var script$1 = defineComponent({
    name: 'TreeNode',
    props: {
        node: {
            type: Object,
            default: () => ({})
        },
        id: {
            type: [String, Number],
            default: ''
        },
        collapse: {
            type: Boolean,
            default: true
        },
        fontSize: {
            type: Number,
            default: 14
        },
        letterSpacing: {
            type: Number,
            default: 3
        },
        lineColor: {
            type: String,
            default: '#ddd'
        },
        lineWidth: {
            type: Number,
            default: 1
        },
        lineArrow: {
            type: Object,
            default: () => ({
                open: false,
                markerWidth: 5,
                markerHeight: 8,
                refX: 0,
                refY: 4,
                margin: 5
            })
        },
        lineCircle: {
            type: Object,
            default: () => ({
                open: false,
                markerWidth: 8,
                markerHeight: 8,
                refX: 0,
                refY: 4,
                r: 3,
                strokeWidth: 2,
                margin: 4
            })
        },
        collapsable: {
            type: Boolean,
            default: true
        },
        collapseSize: {
            type: Number,
            default: 6
        },
        treeDirection: {
            type: String,
            default: 'horizontal'
        },
        hasSlot: {
            type: [Boolean, Function],
            default: false
        },
        source: {
            type: [String, Number],
            default: ''
        },
        target: {
            type: [String, Number],
            default: ''
        },
    },
    setup(props, { emit }) {
        const { node, fontSize, letterSpacing } = toRefs(props);
        const middle = computed(() => node.value.xStart + node.value.width / 2); // 中间位置
        const verticalMiddle = computed(() => node.value.yStart + node.value.height / 2);
        const childNodes = computed(() => props.node.children);
        // 设置节点文本
        const nodeText = ref([]);
        const setNodeText = () => {
            if (!node.value.name || props.hasSlot)
                return;
            const name = `${node.value.name}`;
            let w, h;
            const isHor = node.value.direction === 'horizontal'; // 文字水平排列
            const compareLength = name.length;
            const maxWords = ((isHor ? maxWidth : maxHeight) - paddingSize) / (fontSize.value + letterSpacing.value) - 1; // 一行或一竖最多可显示字数
            if (compareLength > maxWords) {
                const lines = Math.ceil(compareLength / maxWords);
                if (isHor) {
                    w = maxWidth;
                    h = lines * (fontSize.value + lineHeight) + paddingSize + fontSize.value;
                }
                else {
                    w = lines * (fontSize.value + lineHeight) + paddingSize + fontSize.value;
                    h = maxHeight;
                }
                nodeText.value = [];
                const func = (str) => {
                    if (!str)
                        return;
                    nodeText.value.push(str.substring(0, maxWords));
                    func(str.substring(maxWords));
                };
                func(name);
            }
            else {
                if (isHor) {
                    w = paddingSize + (fontSize.value + letterSpacing.value) * compareLength;
                    h = paddingSize + fontSize.value + lineHeight + fontSize.value;
                }
                else {
                    w = paddingSize + fontSize.value + lineHeight + fontSize.value;
                    h = paddingSize + (fontSize.value + letterSpacing.value) * compareLength;
                }
                nodeText.value = [name];
            }
            if (w < 120)
                w = 120; // 按钮宽度预留
            node.value.width = w;
            node.value.height = h + toolsHeight; // 此处的fontSize 表示负责人一横数据高度
            node.value.nodeText = nodeText.value;
        };
        // 节点文字
        const startY = computed(() => node.value.yStart + paddingSize + fontSize.value);
        const startX = computed(() => node.value.xStart + fontSize.value);
        const setAttrs = (i) => {
            return node.value.direction === 'horizontal' ?
                {
                    x: startX.value,
                    y: startY.value + (fontSize.value + lineHeight) * i,
                } :
                {
                    x: startX.value + (fontSize.value + letterSpacing.value + 10) * i,
                    y: startY.value,
                    transform: `rotate(90, ${startX.value + (fontSize.value + letterSpacing.value + 10) * i}, ${startY})`,
                    rotate: '-90',
                };
        };
        const line2Dth = ref(''); // 折叠节点上或者下方的竖线：line2      竖线
        const line1Dth = ref(''); // 折叠节点下方的横线：向左画（第一个节点不需要画）    横线
        const linesChildDth = ref(''); // 与子节点的第一段连线
        const collaspeStartY = ref(0);
        const collaspeVerticalStartY = ref(0);
        const createLine = () => {
            const parent = node.value.parentNode;
            node.value.middle = middle.value;
            node.value.verticalMiddle = verticalMiddle.value;
            if (parent) {
                const startYParent = parent.yStart + parent.height + parent.line1;
                const verticalStartParent = node.value.xStart - parent.line2;
                const lineArrowMargin = props.lineArrow.open ? (props.lineArrow.markerWidth + props.lineArrow.margin) : 0;
                line2Dth.value = node.value.treeDirection === 'vertical'
                    ? `M ${verticalStartParent} ${verticalMiddle.value} L ${node.value.xStart - lineArrowMargin} ${verticalMiddle.value} ${props.lineArrow.open ? '' : 'z'}` // 如果line右箭头不闭合当前路径
                    : `M ${middle.value} ${startYParent} L ${middle.value} ${node.value.yStart - lineArrowMargin} ${props.lineArrow.open ? '' : 'z'}`;
                // 寻找前一个节点
                const prev = node.value.prevNode;
                if (prev) {
                    const start = node.value.treeDirection === 'vertical'
                        ? `${verticalStartParent} ${prev.verticalMiddle}`
                        : `${prev.middle} ${startYParent}`;
                    const end = node.value.treeDirection === 'vertical'
                        ? `${verticalStartParent} ${verticalMiddle.value}`
                        : `${middle.value} ${startYParent}`;
                    line1Dth.value = `M ${start} L ${end} z`;
                }
            }
            if (!node.value.children || node.value.children.length <= 0)
                return;
            collaspeStartY.value = node.value.yStart + node.value.height + node.value.line1;
            collaspeVerticalStartY.value = node.value.xStart + node.value.width + node.value.line1;
            const lineCircleMargin = props.lineCircle.open ? props.lineCircle.markerWidth + props.lineCircle.margin : 0;
            linesChildDth.value = node.value.treeDirection === 'vertical'
                ? `M ${node.value.xStart + node.value.width + lineCircleMargin} ${verticalMiddle.value} L ${collaspeVerticalStartY.value} ${verticalMiddle.value} z`
                : `M ${middle.value} ${node.value.yStart + node.value.height + lineCircleMargin} L ${middle.value} ${collaspeStartY.value} z`;
        };
        const linkLineDth = ref(''); // 跨节点连接线
        const linkLineColor = ref('');
        const linkNodeData = inject('linkNodeData');
        const treeData = inject('treeData');
        const rootNodesep = inject('rootNodesep');
        const createLinkLine = () => {
            if (props.target) {
                const source = linkNodeData.find((item) => item.target === props.target)?.source ?? -1;
                const offset = linkNodeData.find((item) => item.target === props.target)?.offset ?? [0, 0, 0, 0];
                linkLineColor.value = linkNodeData.find((item) => item.target === props.target)?.lineColor ?? props.lineColor;
                const sourceNode = findTreeNode(source, treeData);
                const targetNode = findTreeNode(props.target, treeData);
                if (sourceNode?.xStart === targetNode?.xStart) {
                    const y1 = Number(sourceNode?.yStart) + (node.value.height / 2);
                    const y2 = Number(targetNode?.yStart) + (node.value.height / 2);
                    const q1 = Number(sourceNode?.xStart) - node.value.width / 2;
                    const q2 = y1 + (y2 - y1) / 2;
                    linkLineDth.value = `M ${sourceNode?.xStart}, ${y1} Q ${q1}, ${q2} ${targetNode?.xStart}, ${y2}`;
                }
                else {
                    const x1 = Number(sourceNode?.xStart) + (node.value.width / 2) + offset[0];
                    const y1 = Number(sourceNode?.yStart) + node.value.height + offset[1];
                    const x2 = Number(targetNode?.xStart) + node.value.width / 2 + offset[2];
                    const y2 = Number(targetNode?.yStart) + offset[3];
                    const mx1 = x1;
                    const my1 = y1 + (y2 - y1) / 2;
                    const mx3 = x2;
                    const my3 = y1 + (y2 - y1) / 2;
                    linkLineDth.value = `M ${x1},${y1} C ${mx1},${my1 + rootNodesep} ${mx3},${my3} ${x2},${y2}`;
                }
            }
        };
        const handleCollapse = () => {
            node.value.close = !node.value.close;
        };
        const handleLineMouseover = (node) => {
            emit('line-mouseover', node);
        };
        const handleLineMouseout = (node) => {
            emit('line-mouseout', node);
        };
        watch(() => props.treeDirection, (val) => {
            setNodeText();
            createLine();
        });
        onMounted(() => {
            setNodeText();
            createLine();
            createLinkLine();
        });
        return {
            middle,
            verticalMiddle,
            startY,
            startX,
            nodeText,
            setAttrs,
            line1Dth,
            line2Dth,
            linesChildDth,
            collaspeStartY,
            collaspeVerticalStartY,
            handleCollapse,
            childNodes,
            handleLineMouseover,
            handleLineMouseout,
            createLinkLine,
            linkNodeData,
            linkLineDth,
            linkLineColor
        };
    }
});

function normalizeComponent(template, style, script, scopeId, isFunctionalTemplate, moduleIdentifier /* server only */, shadowMode, createInjector, createInjectorSSR, createInjectorShadow) {
    if (typeof shadowMode !== 'boolean') {
        createInjectorSSR = createInjector;
        createInjector = shadowMode;
        shadowMode = false;
    }
    // Vue.extend constructor export interop.
    const options = typeof script === 'function' ? script.options : script;
    // render functions
    if (template && template.render) {
        options.render = template.render;
        options.staticRenderFns = template.staticRenderFns;
        options._compiled = true;
        // functional template
        if (isFunctionalTemplate) {
            options.functional = true;
        }
    }
    // scopedId
    if (scopeId) {
        options._scopeId = scopeId;
    }
    let hook;
    if (moduleIdentifier) {
        // server build
        hook = function (context) {
            // 2.3 injection
            context =
                context || // cached call
                    (this.$vnode && this.$vnode.ssrContext) || // stateful
                    (this.parent && this.parent.$vnode && this.parent.$vnode.ssrContext); // functional
            // 2.2 with runInNewContext: true
            if (!context && typeof __VUE_SSR_CONTEXT__ !== 'undefined') {
                context = __VUE_SSR_CONTEXT__;
            }
            // inject component styles
            if (style) {
                style.call(this, createInjectorSSR(context));
            }
            // register component module identifier for async chunk inference
            if (context && context._registeredComponents) {
                context._registeredComponents.add(moduleIdentifier);
            }
        };
        // used by ssr in case component is cached and beforeCreate
        // never gets called
        options._ssrRegister = hook;
    }
    else if (style) {
        hook = shadowMode
            ? function (context) {
                style.call(this, createInjectorShadow(context, this.$root.$options.shadowRoot));
            }
            : function (context) {
                style.call(this, createInjector(context));
            };
    }
    if (hook) {
        if (options.functional) {
            // register for functional component in vue file
            const originalRender = options.render;
            options.render = function renderWithStyleInjection(h, context) {
                hook.call(context);
                return originalRender(h, context);
            };
        }
        else {
            // inject component registration as beforeCreate hook
            const existing = options.beforeCreate;
            options.beforeCreate = existing ? [].concat(existing, hook) : [hook];
        }
    }
    return script;
}

/* script */
const __vue_script__$1 = script$1;

/* template */
var __vue_render__$1 = function () {
  var _vm = this;
  var _h = _vm.$createElement;
  var _c = _vm._self._c || _h;
  return _c(
    "g",
    {
      attrs: {
        collapse: _vm.collapse,
        id: _vm.node.id,
        root: _vm.node.parent_id === 0,
      },
    },
    [
      _vm.$scopedSlots.node
        ? _c(
            "foreignObject",
            {
              attrs: {
                x: _vm.node.xStart,
                y: _vm.node.yStart,
                width: _vm.node.width,
                height: _vm.node.height,
              },
            },
            [_vm._t("node", null, { node: _vm.node })],
            2
          )
        : _vm._e(),
      _vm._v(" "),
      !_vm.hasSlot
        ? _c("rect", {
            staticClass: "node-rect",
            attrs: {
              x: _vm.node.xStart,
              y: _vm.node.yStart,
              width: _vm.node.width,
              height: _vm.node.height,
              rx: "2",
              fill: "white",
              stroke: "#ddd",
              "stroke-width": "1",
            },
          })
        : _vm._e(),
      _vm._v(" "),
      !_vm.hasSlot
        ? _c("g", [
            _c(
              "text",
              {
                attrs: {
                  fill: "black",
                  stroke: "none",
                  "font-size": _vm.fontSize,
                  "letter-spacing": _vm.letterSpacing,
                  "text-anchor": "middle",
                  "dominant-baseline": "middle",
                  x: _vm.middle,
                  y: _vm.startY,
                },
              },
              [_vm._v(_vm._s(_vm.nodeText[0]))]
            ),
          ])
        : _vm._e(),
      _vm._v(" "),
      _vm._l(_vm.childNodes, function (child) {
        return _c("tree-node", {
          key: child.id,
          style: { display: _vm.node.close ? "none" : "" },
          attrs: {
            id: child.id,
            node: child,
            treeDirection: child.treeDirection,
            lineWidth: _vm.lineWidth,
            lineColor: _vm.lineColor,
            hasSlot: _vm.hasSlot,
            lineArrow: _vm.lineArrow,
            lineCircle: _vm.lineCircle,
            collapsable: _vm.collapsable,
            source: _vm.linkNodeData.find(function (item) {
              return item.source === child.id
            })
              ? child.id
              : "",
            target: _vm.linkNodeData.find(function (item) {
              return item.target === child.id
            })
              ? child.id
              : "",
          },
          on: {
            "line-mouseover": _vm.handleLineMouseover,
            "line-mouseout": _vm.handleLineMouseout,
          },
          scopedSlots: _vm._u(
            [
              {
                key: "node",
                fn: function (slotProps) {
                  return [_vm._t("node", null, { node: slotProps.node })]
                },
              },
            ],
            null,
            true
          ),
        })
      }),
      _vm._v(" "),
      _c("g", { attrs: { id: "node-line", close: String(_vm.node.close) } }, [
        _vm.node.parentNode && _vm.node.prevNode
          ? _c("path", {
              staticClass: "line1",
              attrs: {
                d: _vm.line1Dth,
                fill: "none",
                stroke: _vm.lineColor,
                "stroke-width": _vm.lineWidth,
                "stroke-linejoin": "round",
                "stroke-linecap": "round",
              },
            })
          : _vm._e(),
        _vm._v(" "),
        _c(
          "g",
          {
            attrs: {
              fill: "none",
              stroke: _vm.node.lineColor || _vm.lineColor,
              "stroke-dasharray": _vm.node.lineDasharray || "none",
            },
            on: {
              mouseover: function ($event) {
                return _vm.handleLineMouseover(_vm.node)
              },
              onmouseout: function ($event) {
                return _vm.handleLineMouseout(_vm.node)
              },
            },
          },
          [
            _c("defs", [
              _vm.lineArrow.open
                ? _c(
                    "marker",
                    {
                      attrs: {
                        id: _vm.node.id + "triangleMarker",
                        markerUnits: "strokeWidth",
                        markerWidth: _vm.lineArrow.markerWidth,
                        markerHeight: _vm.lineArrow.markerHeight,
                        refX: _vm.lineArrow.refX,
                        refY: _vm.lineArrow.refY,
                        orient: "auto",
                      },
                    },
                    [
                      _c("polygon", {
                        attrs: {
                          fill: _vm.node.lineColor || _vm.lineColor,
                          points:
                            0 +
                            "," +
                            0 +
                            "  " +
                            _vm.lineArrow.markerWidth +
                            ", " +
                            _vm.lineArrow.markerHeight / 2 +
                            "  " +
                            0 +
                            ", " +
                            _vm.lineArrow.markerHeight,
                        },
                      }),
                    ]
                  )
                : _vm._e(),
            ]),
            _vm._v(" "),
            _c("defs", [
              _vm.lineCircle.open &&
              _vm.node.children &&
              _vm.node.children.length > 0
                ? _c(
                    "marker",
                    {
                      attrs: {
                        id: _vm.node.id + "circleMarker",
                        markerWidth: _vm.lineCircle.markerWidth,
                        markerHeight: _vm.lineCircle.markerHeight,
                        refX: _vm.lineCircle.refX,
                        refY: _vm.lineCircle.refY,
                        orient: "auto",
                        markerUnits: "userSpaceOnUse",
                      },
                    },
                    [
                      _c("circle", {
                        attrs: {
                          stroke: _vm.node.children[0].lineColor
                            ? _vm.node.children[0].lineColor
                            : _vm.lineColor,
                          cx: _vm.lineCircle.markerWidth / 2,
                          cy: _vm.lineCircle.markerHeight / 2,
                          r: _vm.lineCircle.r,
                          "stroke-width": _vm.lineCircle.strokeWidth,
                          "stroke-dasharray": "none",
                        },
                      }),
                    ]
                  )
                : _vm._e(),
            ]),
            _vm._v(" "),
            _vm.node.parentNode
              ? _c("path", {
                  staticClass: "line2",
                  style: {
                    markerEnd: "url(#" + _vm.node.id + "triangleMarker)",
                  },
                  attrs: {
                    d: _vm.line2Dth,
                    "stroke-width": _vm.lineWidth,
                    "stroke-linecap": "round",
                  },
                })
              : _vm._e(),
            _vm._v(" "),
            _vm.node.children && _vm.node.children.length > 0
              ? _c("path", {
                  staticClass: "lineChild",
                  style: { markerEnd: "url(#" + _vm.node.id + "circleMarker)" },
                  attrs: {
                    d: _vm.linesChildDth,
                    "stroke-width": _vm.lineWidth,
                    "stroke-linecap": "round",
                    stroke: _vm.node.children[0].lineColor
                      ? _vm.node.children[0].lineColor
                      : _vm.lineColor,
                    "stroke-dasharray": _vm.node.children[0].lineDasharray
                      ? _vm.node.children[0].lineDasharray
                      : "none",
                  },
                })
              : _vm._e(),
          ]
        ),
        _vm._v(" "),
        _vm.node.children && _vm.node.children.length > 0 && _vm.collapsable
          ? _c("circle", {
              staticStyle: { cursor: "pointer" },
              attrs: {
                cx:
                  _vm.node.treeDirection === "vertical"
                    ? _vm.collaspeVerticalStartY
                    : _vm.middle,
                cy:
                  _vm.node.treeDirection === "vertical"
                    ? _vm.verticalMiddle
                    : _vm.collaspeStartY,
                r: _vm.collapseSize,
                fill: "white",
                stroke: _vm.node.children[0].lineColor
                  ? _vm.node.children[0].lineColor
                  : _vm.lineColor,
                "stroke-width": _vm.lineWidth,
              },
              on: { click: _vm.handleCollapse },
            })
          : _vm._e(),
        _vm._v(" "),
        _vm.node.children && _vm.node.children.length > 0 && _vm.collapsable
          ? _c(
              "text",
              {
                staticStyle: { cursor: "pointer" },
                attrs: {
                  x:
                    _vm.node.treeDirection === "vertical"
                      ? _vm.collaspeVerticalStartY
                      : _vm.middle,
                  y:
                    _vm.node.treeDirection === "vertical"
                      ? _vm.verticalMiddle
                      : _vm.collaspeStartY,
                  "font-size": 12,
                  fill: _vm.lineColor,
                  stroke: _vm.node.children[0].lineColor
                    ? _vm.node.children[0].lineColor
                    : _vm.lineColor,
                  "text-anchor": "middle",
                  "dominant-baseline": "middle",
                },
                on: { click: _vm.handleCollapse },
              },
              [_vm._v(_vm._s(_vm.node.close ? "+" : "-"))]
            )
          : _vm._e(),
      ]),
      _vm._v(" "),
      _c("g", { attrs: { id: "link-line" } }, [
        _c("path", {
          staticClass: "link-line",
          staticStyle: { "marker-mid": "url(#markerArrow)" },
          attrs: {
            id: _vm.node.id + "line-path",
            d: _vm.linkLineDth,
            fill: "none",
            stroke: _vm.linkLineColor,
            "stroke-width": _vm.lineWidth,
          },
        }),
        _vm._v(" "),
        _c(
          "text",
          {
            style: {
              dominantBaseline: "central",
              fill: _vm.linkLineColor,
              fontSize: "8px",
            },
          },
          [
            _c(
              "textPath",
              {
                attrs: {
                  "xlink:href": "#" + _vm.node.id + "line-path",
                  startOffset: "30%",
                },
              },
              [_vm._v("➤")]
            ),
            _vm._v(" "),
            _c(
              "textPath",
              {
                attrs: {
                  "xlink:href": "#" + _vm.node.id + "line-path",
                  startOffset: "60%",
                },
              },
              [_vm._v("➤")]
            ),
            _vm._v(" "),
            _c(
              "textPath",
              {
                attrs: {
                  "xlink:href": "#" + _vm.node.id + "line-path",
                  startOffset: "80%",
                },
              },
              [_vm._v("➤")]
            ),
          ]
        ),
      ]),
    ],
    2
  )
};
var __vue_staticRenderFns__$1 = [];
__vue_render__$1._withStripped = true;

  /* style */
  const __vue_inject_styles__$1 = undefined;
  /* scoped */
  const __vue_scope_id__$1 = undefined;
  /* module identifier */
  const __vue_module_identifier__$1 = undefined;
  /* functional template */
  const __vue_is_functional_template__$1 = false;
  /* style inject */
  
  /* style inject SSR */
  
  /* style inject shadow dom */
  

  
  const __vue_component__$1 = /*#__PURE__*/normalizeComponent(
    { render: __vue_render__$1, staticRenderFns: __vue_staticRenderFns__$1 },
    __vue_inject_styles__$1,
    __vue_script__$1,
    __vue_scope_id__$1,
    __vue_is_functional_template__$1,
    __vue_module_identifier__$1,
    false,
    undefined,
    undefined,
    undefined
  );

var commonjsGlobal = typeof globalThis !== 'undefined' ? globalThis : typeof window !== 'undefined' ? window : typeof global !== 'undefined' ? global : typeof self !== 'undefined' ? self : {};

var lodash_clonedeepExports = {};
var lodash_clonedeep = {
  get exports(){ return lodash_clonedeepExports; },
  set exports(v){ lodash_clonedeepExports = v; },
};

/**
 * lodash (Custom Build) <https://lodash.com/>
 * Build: `lodash modularize exports="npm" -o ./`
 * Copyright jQuery Foundation and other contributors <https://jquery.org/>
 * Released under MIT license <https://lodash.com/license>
 * Based on Underscore.js 1.8.3 <http://underscorejs.org/LICENSE>
 * Copyright Jeremy Ashkenas, DocumentCloud and Investigative Reporters & Editors
 */

(function (module, exports) {
	/** Used as the size to enable large array optimizations. */
	var LARGE_ARRAY_SIZE = 200;

	/** Used to stand-in for `undefined` hash values. */
	var HASH_UNDEFINED = '__lodash_hash_undefined__';

	/** Used as references for various `Number` constants. */
	var MAX_SAFE_INTEGER = 9007199254740991;

	/** `Object#toString` result references. */
	var argsTag = '[object Arguments]',
	    arrayTag = '[object Array]',
	    boolTag = '[object Boolean]',
	    dateTag = '[object Date]',
	    errorTag = '[object Error]',
	    funcTag = '[object Function]',
	    genTag = '[object GeneratorFunction]',
	    mapTag = '[object Map]',
	    numberTag = '[object Number]',
	    objectTag = '[object Object]',
	    promiseTag = '[object Promise]',
	    regexpTag = '[object RegExp]',
	    setTag = '[object Set]',
	    stringTag = '[object String]',
	    symbolTag = '[object Symbol]',
	    weakMapTag = '[object WeakMap]';

	var arrayBufferTag = '[object ArrayBuffer]',
	    dataViewTag = '[object DataView]',
	    float32Tag = '[object Float32Array]',
	    float64Tag = '[object Float64Array]',
	    int8Tag = '[object Int8Array]',
	    int16Tag = '[object Int16Array]',
	    int32Tag = '[object Int32Array]',
	    uint8Tag = '[object Uint8Array]',
	    uint8ClampedTag = '[object Uint8ClampedArray]',
	    uint16Tag = '[object Uint16Array]',
	    uint32Tag = '[object Uint32Array]';

	/**
	 * Used to match `RegExp`
	 * [syntax characters](http://ecma-international.org/ecma-262/7.0/#sec-patterns).
	 */
	var reRegExpChar = /[\\^$.*+?()[\]{}|]/g;

	/** Used to match `RegExp` flags from their coerced string values. */
	var reFlags = /\w*$/;

	/** Used to detect host constructors (Safari). */
	var reIsHostCtor = /^\[object .+?Constructor\]$/;

	/** Used to detect unsigned integer values. */
	var reIsUint = /^(?:0|[1-9]\d*)$/;

	/** Used to identify `toStringTag` values supported by `_.clone`. */
	var cloneableTags = {};
	cloneableTags[argsTag] = cloneableTags[arrayTag] =
	cloneableTags[arrayBufferTag] = cloneableTags[dataViewTag] =
	cloneableTags[boolTag] = cloneableTags[dateTag] =
	cloneableTags[float32Tag] = cloneableTags[float64Tag] =
	cloneableTags[int8Tag] = cloneableTags[int16Tag] =
	cloneableTags[int32Tag] = cloneableTags[mapTag] =
	cloneableTags[numberTag] = cloneableTags[objectTag] =
	cloneableTags[regexpTag] = cloneableTags[setTag] =
	cloneableTags[stringTag] = cloneableTags[symbolTag] =
	cloneableTags[uint8Tag] = cloneableTags[uint8ClampedTag] =
	cloneableTags[uint16Tag] = cloneableTags[uint32Tag] = true;
	cloneableTags[errorTag] = cloneableTags[funcTag] =
	cloneableTags[weakMapTag] = false;

	/** Detect free variable `global` from Node.js. */
	var freeGlobal = typeof commonjsGlobal == 'object' && commonjsGlobal && commonjsGlobal.Object === Object && commonjsGlobal;

	/** Detect free variable `self`. */
	var freeSelf = typeof self == 'object' && self && self.Object === Object && self;

	/** Used as a reference to the global object. */
	var root = freeGlobal || freeSelf || Function('return this')();

	/** Detect free variable `exports`. */
	var freeExports = exports && !exports.nodeType && exports;

	/** Detect free variable `module`. */
	var freeModule = freeExports && 'object' == 'object' && module && !module.nodeType && module;

	/** Detect the popular CommonJS extension `module.exports`. */
	var moduleExports = freeModule && freeModule.exports === freeExports;

	/**
	 * Adds the key-value `pair` to `map`.
	 *
	 * @private
	 * @param {Object} map The map to modify.
	 * @param {Array} pair The key-value pair to add.
	 * @returns {Object} Returns `map`.
	 */
	function addMapEntry(map, pair) {
	  // Don't return `map.set` because it's not chainable in IE 11.
	  map.set(pair[0], pair[1]);
	  return map;
	}

	/**
	 * Adds `value` to `set`.
	 *
	 * @private
	 * @param {Object} set The set to modify.
	 * @param {*} value The value to add.
	 * @returns {Object} Returns `set`.
	 */
	function addSetEntry(set, value) {
	  // Don't return `set.add` because it's not chainable in IE 11.
	  set.add(value);
	  return set;
	}

	/**
	 * A specialized version of `_.forEach` for arrays without support for
	 * iteratee shorthands.
	 *
	 * @private
	 * @param {Array} [array] The array to iterate over.
	 * @param {Function} iteratee The function invoked per iteration.
	 * @returns {Array} Returns `array`.
	 */
	function arrayEach(array, iteratee) {
	  var index = -1,
	      length = array ? array.length : 0;

	  while (++index < length) {
	    if (iteratee(array[index], index, array) === false) {
	      break;
	    }
	  }
	  return array;
	}

	/**
	 * Appends the elements of `values` to `array`.
	 *
	 * @private
	 * @param {Array} array The array to modify.
	 * @param {Array} values The values to append.
	 * @returns {Array} Returns `array`.
	 */
	function arrayPush(array, values) {
	  var index = -1,
	      length = values.length,
	      offset = array.length;

	  while (++index < length) {
	    array[offset + index] = values[index];
	  }
	  return array;
	}

	/**
	 * A specialized version of `_.reduce` for arrays without support for
	 * iteratee shorthands.
	 *
	 * @private
	 * @param {Array} [array] The array to iterate over.
	 * @param {Function} iteratee The function invoked per iteration.
	 * @param {*} [accumulator] The initial value.
	 * @param {boolean} [initAccum] Specify using the first element of `array` as
	 *  the initial value.
	 * @returns {*} Returns the accumulated value.
	 */
	function arrayReduce(array, iteratee, accumulator, initAccum) {
	  var index = -1,
	      length = array ? array.length : 0;

	  if (initAccum && length) {
	    accumulator = array[++index];
	  }
	  while (++index < length) {
	    accumulator = iteratee(accumulator, array[index], index, array);
	  }
	  return accumulator;
	}

	/**
	 * The base implementation of `_.times` without support for iteratee shorthands
	 * or max array length checks.
	 *
	 * @private
	 * @param {number} n The number of times to invoke `iteratee`.
	 * @param {Function} iteratee The function invoked per iteration.
	 * @returns {Array} Returns the array of results.
	 */
	function baseTimes(n, iteratee) {
	  var index = -1,
	      result = Array(n);

	  while (++index < n) {
	    result[index] = iteratee(index);
	  }
	  return result;
	}

	/**
	 * Gets the value at `key` of `object`.
	 *
	 * @private
	 * @param {Object} [object] The object to query.
	 * @param {string} key The key of the property to get.
	 * @returns {*} Returns the property value.
	 */
	function getValue(object, key) {
	  return object == null ? undefined : object[key];
	}

	/**
	 * Checks if `value` is a host object in IE < 9.
	 *
	 * @private
	 * @param {*} value The value to check.
	 * @returns {boolean} Returns `true` if `value` is a host object, else `false`.
	 */
	function isHostObject(value) {
	  // Many host objects are `Object` objects that can coerce to strings
	  // despite having improperly defined `toString` methods.
	  var result = false;
	  if (value != null && typeof value.toString != 'function') {
	    try {
	      result = !!(value + '');
	    } catch (e) {}
	  }
	  return result;
	}

	/**
	 * Converts `map` to its key-value pairs.
	 *
	 * @private
	 * @param {Object} map The map to convert.
	 * @returns {Array} Returns the key-value pairs.
	 */
	function mapToArray(map) {
	  var index = -1,
	      result = Array(map.size);

	  map.forEach(function(value, key) {
	    result[++index] = [key, value];
	  });
	  return result;
	}

	/**
	 * Creates a unary function that invokes `func` with its argument transformed.
	 *
	 * @private
	 * @param {Function} func The function to wrap.
	 * @param {Function} transform The argument transform.
	 * @returns {Function} Returns the new function.
	 */
	function overArg(func, transform) {
	  return function(arg) {
	    return func(transform(arg));
	  };
	}

	/**
	 * Converts `set` to an array of its values.
	 *
	 * @private
	 * @param {Object} set The set to convert.
	 * @returns {Array} Returns the values.
	 */
	function setToArray(set) {
	  var index = -1,
	      result = Array(set.size);

	  set.forEach(function(value) {
	    result[++index] = value;
	  });
	  return result;
	}

	/** Used for built-in method references. */
	var arrayProto = Array.prototype,
	    funcProto = Function.prototype,
	    objectProto = Object.prototype;

	/** Used to detect overreaching core-js shims. */
	var coreJsData = root['__core-js_shared__'];

	/** Used to detect methods masquerading as native. */
	var maskSrcKey = (function() {
	  var uid = /[^.]+$/.exec(coreJsData && coreJsData.keys && coreJsData.keys.IE_PROTO || '');
	  return uid ? ('Symbol(src)_1.' + uid) : '';
	}());

	/** Used to resolve the decompiled source of functions. */
	var funcToString = funcProto.toString;

	/** Used to check objects for own properties. */
	var hasOwnProperty = objectProto.hasOwnProperty;

	/**
	 * Used to resolve the
	 * [`toStringTag`](http://ecma-international.org/ecma-262/7.0/#sec-object.prototype.tostring)
	 * of values.
	 */
	var objectToString = objectProto.toString;

	/** Used to detect if a method is native. */
	var reIsNative = RegExp('^' +
	  funcToString.call(hasOwnProperty).replace(reRegExpChar, '\\$&')
	  .replace(/hasOwnProperty|(function).*?(?=\\\()| for .+?(?=\\\])/g, '$1.*?') + '$'
	);

	/** Built-in value references. */
	var Buffer = moduleExports ? root.Buffer : undefined,
	    Symbol = root.Symbol,
	    Uint8Array = root.Uint8Array,
	    getPrototype = overArg(Object.getPrototypeOf, Object),
	    objectCreate = Object.create,
	    propertyIsEnumerable = objectProto.propertyIsEnumerable,
	    splice = arrayProto.splice;

	/* Built-in method references for those with the same name as other `lodash` methods. */
	var nativeGetSymbols = Object.getOwnPropertySymbols,
	    nativeIsBuffer = Buffer ? Buffer.isBuffer : undefined,
	    nativeKeys = overArg(Object.keys, Object);

	/* Built-in method references that are verified to be native. */
	var DataView = getNative(root, 'DataView'),
	    Map = getNative(root, 'Map'),
	    Promise = getNative(root, 'Promise'),
	    Set = getNative(root, 'Set'),
	    WeakMap = getNative(root, 'WeakMap'),
	    nativeCreate = getNative(Object, 'create');

	/** Used to detect maps, sets, and weakmaps. */
	var dataViewCtorString = toSource(DataView),
	    mapCtorString = toSource(Map),
	    promiseCtorString = toSource(Promise),
	    setCtorString = toSource(Set),
	    weakMapCtorString = toSource(WeakMap);

	/** Used to convert symbols to primitives and strings. */
	var symbolProto = Symbol ? Symbol.prototype : undefined,
	    symbolValueOf = symbolProto ? symbolProto.valueOf : undefined;

	/**
	 * Creates a hash object.
	 *
	 * @private
	 * @constructor
	 * @param {Array} [entries] The key-value pairs to cache.
	 */
	function Hash(entries) {
	  var index = -1,
	      length = entries ? entries.length : 0;

	  this.clear();
	  while (++index < length) {
	    var entry = entries[index];
	    this.set(entry[0], entry[1]);
	  }
	}

	/**
	 * Removes all key-value entries from the hash.
	 *
	 * @private
	 * @name clear
	 * @memberOf Hash
	 */
	function hashClear() {
	  this.__data__ = nativeCreate ? nativeCreate(null) : {};
	}

	/**
	 * Removes `key` and its value from the hash.
	 *
	 * @private
	 * @name delete
	 * @memberOf Hash
	 * @param {Object} hash The hash to modify.
	 * @param {string} key The key of the value to remove.
	 * @returns {boolean} Returns `true` if the entry was removed, else `false`.
	 */
	function hashDelete(key) {
	  return this.has(key) && delete this.__data__[key];
	}

	/**
	 * Gets the hash value for `key`.
	 *
	 * @private
	 * @name get
	 * @memberOf Hash
	 * @param {string} key The key of the value to get.
	 * @returns {*} Returns the entry value.
	 */
	function hashGet(key) {
	  var data = this.__data__;
	  if (nativeCreate) {
	    var result = data[key];
	    return result === HASH_UNDEFINED ? undefined : result;
	  }
	  return hasOwnProperty.call(data, key) ? data[key] : undefined;
	}

	/**
	 * Checks if a hash value for `key` exists.
	 *
	 * @private
	 * @name has
	 * @memberOf Hash
	 * @param {string} key The key of the entry to check.
	 * @returns {boolean} Returns `true` if an entry for `key` exists, else `false`.
	 */
	function hashHas(key) {
	  var data = this.__data__;
	  return nativeCreate ? data[key] !== undefined : hasOwnProperty.call(data, key);
	}

	/**
	 * Sets the hash `key` to `value`.
	 *
	 * @private
	 * @name set
	 * @memberOf Hash
	 * @param {string} key The key of the value to set.
	 * @param {*} value The value to set.
	 * @returns {Object} Returns the hash instance.
	 */
	function hashSet(key, value) {
	  var data = this.__data__;
	  data[key] = (nativeCreate && value === undefined) ? HASH_UNDEFINED : value;
	  return this;
	}

	// Add methods to `Hash`.
	Hash.prototype.clear = hashClear;
	Hash.prototype['delete'] = hashDelete;
	Hash.prototype.get = hashGet;
	Hash.prototype.has = hashHas;
	Hash.prototype.set = hashSet;

	/**
	 * Creates an list cache object.
	 *
	 * @private
	 * @constructor
	 * @param {Array} [entries] The key-value pairs to cache.
	 */
	function ListCache(entries) {
	  var index = -1,
	      length = entries ? entries.length : 0;

	  this.clear();
	  while (++index < length) {
	    var entry = entries[index];
	    this.set(entry[0], entry[1]);
	  }
	}

	/**
	 * Removes all key-value entries from the list cache.
	 *
	 * @private
	 * @name clear
	 * @memberOf ListCache
	 */
	function listCacheClear() {
	  this.__data__ = [];
	}

	/**
	 * Removes `key` and its value from the list cache.
	 *
	 * @private
	 * @name delete
	 * @memberOf ListCache
	 * @param {string} key The key of the value to remove.
	 * @returns {boolean} Returns `true` if the entry was removed, else `false`.
	 */
	function listCacheDelete(key) {
	  var data = this.__data__,
	      index = assocIndexOf(data, key);

	  if (index < 0) {
	    return false;
	  }
	  var lastIndex = data.length - 1;
	  if (index == lastIndex) {
	    data.pop();
	  } else {
	    splice.call(data, index, 1);
	  }
	  return true;
	}

	/**
	 * Gets the list cache value for `key`.
	 *
	 * @private
	 * @name get
	 * @memberOf ListCache
	 * @param {string} key The key of the value to get.
	 * @returns {*} Returns the entry value.
	 */
	function listCacheGet(key) {
	  var data = this.__data__,
	      index = assocIndexOf(data, key);

	  return index < 0 ? undefined : data[index][1];
	}

	/**
	 * Checks if a list cache value for `key` exists.
	 *
	 * @private
	 * @name has
	 * @memberOf ListCache
	 * @param {string} key The key of the entry to check.
	 * @returns {boolean} Returns `true` if an entry for `key` exists, else `false`.
	 */
	function listCacheHas(key) {
	  return assocIndexOf(this.__data__, key) > -1;
	}

	/**
	 * Sets the list cache `key` to `value`.
	 *
	 * @private
	 * @name set
	 * @memberOf ListCache
	 * @param {string} key The key of the value to set.
	 * @param {*} value The value to set.
	 * @returns {Object} Returns the list cache instance.
	 */
	function listCacheSet(key, value) {
	  var data = this.__data__,
	      index = assocIndexOf(data, key);

	  if (index < 0) {
	    data.push([key, value]);
	  } else {
	    data[index][1] = value;
	  }
	  return this;
	}

	// Add methods to `ListCache`.
	ListCache.prototype.clear = listCacheClear;
	ListCache.prototype['delete'] = listCacheDelete;
	ListCache.prototype.get = listCacheGet;
	ListCache.prototype.has = listCacheHas;
	ListCache.prototype.set = listCacheSet;

	/**
	 * Creates a map cache object to store key-value pairs.
	 *
	 * @private
	 * @constructor
	 * @param {Array} [entries] The key-value pairs to cache.
	 */
	function MapCache(entries) {
	  var index = -1,
	      length = entries ? entries.length : 0;

	  this.clear();
	  while (++index < length) {
	    var entry = entries[index];
	    this.set(entry[0], entry[1]);
	  }
	}

	/**
	 * Removes all key-value entries from the map.
	 *
	 * @private
	 * @name clear
	 * @memberOf MapCache
	 */
	function mapCacheClear() {
	  this.__data__ = {
	    'hash': new Hash,
	    'map': new (Map || ListCache),
	    'string': new Hash
	  };
	}

	/**
	 * Removes `key` and its value from the map.
	 *
	 * @private
	 * @name delete
	 * @memberOf MapCache
	 * @param {string} key The key of the value to remove.
	 * @returns {boolean} Returns `true` if the entry was removed, else `false`.
	 */
	function mapCacheDelete(key) {
	  return getMapData(this, key)['delete'](key);
	}

	/**
	 * Gets the map value for `key`.
	 *
	 * @private
	 * @name get
	 * @memberOf MapCache
	 * @param {string} key The key of the value to get.
	 * @returns {*} Returns the entry value.
	 */
	function mapCacheGet(key) {
	  return getMapData(this, key).get(key);
	}

	/**
	 * Checks if a map value for `key` exists.
	 *
	 * @private
	 * @name has
	 * @memberOf MapCache
	 * @param {string} key The key of the entry to check.
	 * @returns {boolean} Returns `true` if an entry for `key` exists, else `false`.
	 */
	function mapCacheHas(key) {
	  return getMapData(this, key).has(key);
	}

	/**
	 * Sets the map `key` to `value`.
	 *
	 * @private
	 * @name set
	 * @memberOf MapCache
	 * @param {string} key The key of the value to set.
	 * @param {*} value The value to set.
	 * @returns {Object} Returns the map cache instance.
	 */
	function mapCacheSet(key, value) {
	  getMapData(this, key).set(key, value);
	  return this;
	}

	// Add methods to `MapCache`.
	MapCache.prototype.clear = mapCacheClear;
	MapCache.prototype['delete'] = mapCacheDelete;
	MapCache.prototype.get = mapCacheGet;
	MapCache.prototype.has = mapCacheHas;
	MapCache.prototype.set = mapCacheSet;

	/**
	 * Creates a stack cache object to store key-value pairs.
	 *
	 * @private
	 * @constructor
	 * @param {Array} [entries] The key-value pairs to cache.
	 */
	function Stack(entries) {
	  this.__data__ = new ListCache(entries);
	}

	/**
	 * Removes all key-value entries from the stack.
	 *
	 * @private
	 * @name clear
	 * @memberOf Stack
	 */
	function stackClear() {
	  this.__data__ = new ListCache;
	}

	/**
	 * Removes `key` and its value from the stack.
	 *
	 * @private
	 * @name delete
	 * @memberOf Stack
	 * @param {string} key The key of the value to remove.
	 * @returns {boolean} Returns `true` if the entry was removed, else `false`.
	 */
	function stackDelete(key) {
	  return this.__data__['delete'](key);
	}

	/**
	 * Gets the stack value for `key`.
	 *
	 * @private
	 * @name get
	 * @memberOf Stack
	 * @param {string} key The key of the value to get.
	 * @returns {*} Returns the entry value.
	 */
	function stackGet(key) {
	  return this.__data__.get(key);
	}

	/**
	 * Checks if a stack value for `key` exists.
	 *
	 * @private
	 * @name has
	 * @memberOf Stack
	 * @param {string} key The key of the entry to check.
	 * @returns {boolean} Returns `true` if an entry for `key` exists, else `false`.
	 */
	function stackHas(key) {
	  return this.__data__.has(key);
	}

	/**
	 * Sets the stack `key` to `value`.
	 *
	 * @private
	 * @name set
	 * @memberOf Stack
	 * @param {string} key The key of the value to set.
	 * @param {*} value The value to set.
	 * @returns {Object} Returns the stack cache instance.
	 */
	function stackSet(key, value) {
	  var cache = this.__data__;
	  if (cache instanceof ListCache) {
	    var pairs = cache.__data__;
	    if (!Map || (pairs.length < LARGE_ARRAY_SIZE - 1)) {
	      pairs.push([key, value]);
	      return this;
	    }
	    cache = this.__data__ = new MapCache(pairs);
	  }
	  cache.set(key, value);
	  return this;
	}

	// Add methods to `Stack`.
	Stack.prototype.clear = stackClear;
	Stack.prototype['delete'] = stackDelete;
	Stack.prototype.get = stackGet;
	Stack.prototype.has = stackHas;
	Stack.prototype.set = stackSet;

	/**
	 * Creates an array of the enumerable property names of the array-like `value`.
	 *
	 * @private
	 * @param {*} value The value to query.
	 * @param {boolean} inherited Specify returning inherited property names.
	 * @returns {Array} Returns the array of property names.
	 */
	function arrayLikeKeys(value, inherited) {
	  // Safari 8.1 makes `arguments.callee` enumerable in strict mode.
	  // Safari 9 makes `arguments.length` enumerable in strict mode.
	  var result = (isArray(value) || isArguments(value))
	    ? baseTimes(value.length, String)
	    : [];

	  var length = result.length,
	      skipIndexes = !!length;

	  for (var key in value) {
	    if ((inherited || hasOwnProperty.call(value, key)) &&
	        !(skipIndexes && (key == 'length' || isIndex(key, length)))) {
	      result.push(key);
	    }
	  }
	  return result;
	}

	/**
	 * Assigns `value` to `key` of `object` if the existing value is not equivalent
	 * using [`SameValueZero`](http://ecma-international.org/ecma-262/7.0/#sec-samevaluezero)
	 * for equality comparisons.
	 *
	 * @private
	 * @param {Object} object The object to modify.
	 * @param {string} key The key of the property to assign.
	 * @param {*} value The value to assign.
	 */
	function assignValue(object, key, value) {
	  var objValue = object[key];
	  if (!(hasOwnProperty.call(object, key) && eq(objValue, value)) ||
	      (value === undefined && !(key in object))) {
	    object[key] = value;
	  }
	}

	/**
	 * Gets the index at which the `key` is found in `array` of key-value pairs.
	 *
	 * @private
	 * @param {Array} array The array to inspect.
	 * @param {*} key The key to search for.
	 * @returns {number} Returns the index of the matched value, else `-1`.
	 */
	function assocIndexOf(array, key) {
	  var length = array.length;
	  while (length--) {
	    if (eq(array[length][0], key)) {
	      return length;
	    }
	  }
	  return -1;
	}

	/**
	 * The base implementation of `_.assign` without support for multiple sources
	 * or `customizer` functions.
	 *
	 * @private
	 * @param {Object} object The destination object.
	 * @param {Object} source The source object.
	 * @returns {Object} Returns `object`.
	 */
	function baseAssign(object, source) {
	  return object && copyObject(source, keys(source), object);
	}

	/**
	 * The base implementation of `_.clone` and `_.cloneDeep` which tracks
	 * traversed objects.
	 *
	 * @private
	 * @param {*} value The value to clone.
	 * @param {boolean} [isDeep] Specify a deep clone.
	 * @param {boolean} [isFull] Specify a clone including symbols.
	 * @param {Function} [customizer] The function to customize cloning.
	 * @param {string} [key] The key of `value`.
	 * @param {Object} [object] The parent object of `value`.
	 * @param {Object} [stack] Tracks traversed objects and their clone counterparts.
	 * @returns {*} Returns the cloned value.
	 */
	function baseClone(value, isDeep, isFull, customizer, key, object, stack) {
	  var result;
	  if (customizer) {
	    result = object ? customizer(value, key, object, stack) : customizer(value);
	  }
	  if (result !== undefined) {
	    return result;
	  }
	  if (!isObject(value)) {
	    return value;
	  }
	  var isArr = isArray(value);
	  if (isArr) {
	    result = initCloneArray(value);
	    if (!isDeep) {
	      return copyArray(value, result);
	    }
	  } else {
	    var tag = getTag(value),
	        isFunc = tag == funcTag || tag == genTag;

	    if (isBuffer(value)) {
	      return cloneBuffer(value, isDeep);
	    }
	    if (tag == objectTag || tag == argsTag || (isFunc && !object)) {
	      if (isHostObject(value)) {
	        return object ? value : {};
	      }
	      result = initCloneObject(isFunc ? {} : value);
	      if (!isDeep) {
	        return copySymbols(value, baseAssign(result, value));
	      }
	    } else {
	      if (!cloneableTags[tag]) {
	        return object ? value : {};
	      }
	      result = initCloneByTag(value, tag, baseClone, isDeep);
	    }
	  }
	  // Check for circular references and return its corresponding clone.
	  stack || (stack = new Stack);
	  var stacked = stack.get(value);
	  if (stacked) {
	    return stacked;
	  }
	  stack.set(value, result);

	  if (!isArr) {
	    var props = isFull ? getAllKeys(value) : keys(value);
	  }
	  arrayEach(props || value, function(subValue, key) {
	    if (props) {
	      key = subValue;
	      subValue = value[key];
	    }
	    // Recursively populate clone (susceptible to call stack limits).
	    assignValue(result, key, baseClone(subValue, isDeep, isFull, customizer, key, value, stack));
	  });
	  return result;
	}

	/**
	 * The base implementation of `_.create` without support for assigning
	 * properties to the created object.
	 *
	 * @private
	 * @param {Object} prototype The object to inherit from.
	 * @returns {Object} Returns the new object.
	 */
	function baseCreate(proto) {
	  return isObject(proto) ? objectCreate(proto) : {};
	}

	/**
	 * The base implementation of `getAllKeys` and `getAllKeysIn` which uses
	 * `keysFunc` and `symbolsFunc` to get the enumerable property names and
	 * symbols of `object`.
	 *
	 * @private
	 * @param {Object} object The object to query.
	 * @param {Function} keysFunc The function to get the keys of `object`.
	 * @param {Function} symbolsFunc The function to get the symbols of `object`.
	 * @returns {Array} Returns the array of property names and symbols.
	 */
	function baseGetAllKeys(object, keysFunc, symbolsFunc) {
	  var result = keysFunc(object);
	  return isArray(object) ? result : arrayPush(result, symbolsFunc(object));
	}

	/**
	 * The base implementation of `getTag`.
	 *
	 * @private
	 * @param {*} value The value to query.
	 * @returns {string} Returns the `toStringTag`.
	 */
	function baseGetTag(value) {
	  return objectToString.call(value);
	}

	/**
	 * The base implementation of `_.isNative` without bad shim checks.
	 *
	 * @private
	 * @param {*} value The value to check.
	 * @returns {boolean} Returns `true` if `value` is a native function,
	 *  else `false`.
	 */
	function baseIsNative(value) {
	  if (!isObject(value) || isMasked(value)) {
	    return false;
	  }
	  var pattern = (isFunction(value) || isHostObject(value)) ? reIsNative : reIsHostCtor;
	  return pattern.test(toSource(value));
	}

	/**
	 * The base implementation of `_.keys` which doesn't treat sparse arrays as dense.
	 *
	 * @private
	 * @param {Object} object The object to query.
	 * @returns {Array} Returns the array of property names.
	 */
	function baseKeys(object) {
	  if (!isPrototype(object)) {
	    return nativeKeys(object);
	  }
	  var result = [];
	  for (var key in Object(object)) {
	    if (hasOwnProperty.call(object, key) && key != 'constructor') {
	      result.push(key);
	    }
	  }
	  return result;
	}

	/**
	 * Creates a clone of  `buffer`.
	 *
	 * @private
	 * @param {Buffer} buffer The buffer to clone.
	 * @param {boolean} [isDeep] Specify a deep clone.
	 * @returns {Buffer} Returns the cloned buffer.
	 */
	function cloneBuffer(buffer, isDeep) {
	  if (isDeep) {
	    return buffer.slice();
	  }
	  var result = new buffer.constructor(buffer.length);
	  buffer.copy(result);
	  return result;
	}

	/**
	 * Creates a clone of `arrayBuffer`.
	 *
	 * @private
	 * @param {ArrayBuffer} arrayBuffer The array buffer to clone.
	 * @returns {ArrayBuffer} Returns the cloned array buffer.
	 */
	function cloneArrayBuffer(arrayBuffer) {
	  var result = new arrayBuffer.constructor(arrayBuffer.byteLength);
	  new Uint8Array(result).set(new Uint8Array(arrayBuffer));
	  return result;
	}

	/**
	 * Creates a clone of `dataView`.
	 *
	 * @private
	 * @param {Object} dataView The data view to clone.
	 * @param {boolean} [isDeep] Specify a deep clone.
	 * @returns {Object} Returns the cloned data view.
	 */
	function cloneDataView(dataView, isDeep) {
	  var buffer = isDeep ? cloneArrayBuffer(dataView.buffer) : dataView.buffer;
	  return new dataView.constructor(buffer, dataView.byteOffset, dataView.byteLength);
	}

	/**
	 * Creates a clone of `map`.
	 *
	 * @private
	 * @param {Object} map The map to clone.
	 * @param {Function} cloneFunc The function to clone values.
	 * @param {boolean} [isDeep] Specify a deep clone.
	 * @returns {Object} Returns the cloned map.
	 */
	function cloneMap(map, isDeep, cloneFunc) {
	  var array = isDeep ? cloneFunc(mapToArray(map), true) : mapToArray(map);
	  return arrayReduce(array, addMapEntry, new map.constructor);
	}

	/**
	 * Creates a clone of `regexp`.
	 *
	 * @private
	 * @param {Object} regexp The regexp to clone.
	 * @returns {Object} Returns the cloned regexp.
	 */
	function cloneRegExp(regexp) {
	  var result = new regexp.constructor(regexp.source, reFlags.exec(regexp));
	  result.lastIndex = regexp.lastIndex;
	  return result;
	}

	/**
	 * Creates a clone of `set`.
	 *
	 * @private
	 * @param {Object} set The set to clone.
	 * @param {Function} cloneFunc The function to clone values.
	 * @param {boolean} [isDeep] Specify a deep clone.
	 * @returns {Object} Returns the cloned set.
	 */
	function cloneSet(set, isDeep, cloneFunc) {
	  var array = isDeep ? cloneFunc(setToArray(set), true) : setToArray(set);
	  return arrayReduce(array, addSetEntry, new set.constructor);
	}

	/**
	 * Creates a clone of the `symbol` object.
	 *
	 * @private
	 * @param {Object} symbol The symbol object to clone.
	 * @returns {Object} Returns the cloned symbol object.
	 */
	function cloneSymbol(symbol) {
	  return symbolValueOf ? Object(symbolValueOf.call(symbol)) : {};
	}

	/**
	 * Creates a clone of `typedArray`.
	 *
	 * @private
	 * @param {Object} typedArray The typed array to clone.
	 * @param {boolean} [isDeep] Specify a deep clone.
	 * @returns {Object} Returns the cloned typed array.
	 */
	function cloneTypedArray(typedArray, isDeep) {
	  var buffer = isDeep ? cloneArrayBuffer(typedArray.buffer) : typedArray.buffer;
	  return new typedArray.constructor(buffer, typedArray.byteOffset, typedArray.length);
	}

	/**
	 * Copies the values of `source` to `array`.
	 *
	 * @private
	 * @param {Array} source The array to copy values from.
	 * @param {Array} [array=[]] The array to copy values to.
	 * @returns {Array} Returns `array`.
	 */
	function copyArray(source, array) {
	  var index = -1,
	      length = source.length;

	  array || (array = Array(length));
	  while (++index < length) {
	    array[index] = source[index];
	  }
	  return array;
	}

	/**
	 * Copies properties of `source` to `object`.
	 *
	 * @private
	 * @param {Object} source The object to copy properties from.
	 * @param {Array} props The property identifiers to copy.
	 * @param {Object} [object={}] The object to copy properties to.
	 * @param {Function} [customizer] The function to customize copied values.
	 * @returns {Object} Returns `object`.
	 */
	function copyObject(source, props, object, customizer) {
	  object || (object = {});

	  var index = -1,
	      length = props.length;

	  while (++index < length) {
	    var key = props[index];

	    var newValue = customizer
	      ? customizer(object[key], source[key], key, object, source)
	      : undefined;

	    assignValue(object, key, newValue === undefined ? source[key] : newValue);
	  }
	  return object;
	}

	/**
	 * Copies own symbol properties of `source` to `object`.
	 *
	 * @private
	 * @param {Object} source The object to copy symbols from.
	 * @param {Object} [object={}] The object to copy symbols to.
	 * @returns {Object} Returns `object`.
	 */
	function copySymbols(source, object) {
	  return copyObject(source, getSymbols(source), object);
	}

	/**
	 * Creates an array of own enumerable property names and symbols of `object`.
	 *
	 * @private
	 * @param {Object} object The object to query.
	 * @returns {Array} Returns the array of property names and symbols.
	 */
	function getAllKeys(object) {
	  return baseGetAllKeys(object, keys, getSymbols);
	}

	/**
	 * Gets the data for `map`.
	 *
	 * @private
	 * @param {Object} map The map to query.
	 * @param {string} key The reference key.
	 * @returns {*} Returns the map data.
	 */
	function getMapData(map, key) {
	  var data = map.__data__;
	  return isKeyable(key)
	    ? data[typeof key == 'string' ? 'string' : 'hash']
	    : data.map;
	}

	/**
	 * Gets the native function at `key` of `object`.
	 *
	 * @private
	 * @param {Object} object The object to query.
	 * @param {string} key The key of the method to get.
	 * @returns {*} Returns the function if it's native, else `undefined`.
	 */
	function getNative(object, key) {
	  var value = getValue(object, key);
	  return baseIsNative(value) ? value : undefined;
	}

	/**
	 * Creates an array of the own enumerable symbol properties of `object`.
	 *
	 * @private
	 * @param {Object} object The object to query.
	 * @returns {Array} Returns the array of symbols.
	 */
	var getSymbols = nativeGetSymbols ? overArg(nativeGetSymbols, Object) : stubArray;

	/**
	 * Gets the `toStringTag` of `value`.
	 *
	 * @private
	 * @param {*} value The value to query.
	 * @returns {string} Returns the `toStringTag`.
	 */
	var getTag = baseGetTag;

	// Fallback for data views, maps, sets, and weak maps in IE 11,
	// for data views in Edge < 14, and promises in Node.js.
	if ((DataView && getTag(new DataView(new ArrayBuffer(1))) != dataViewTag) ||
	    (Map && getTag(new Map) != mapTag) ||
	    (Promise && getTag(Promise.resolve()) != promiseTag) ||
	    (Set && getTag(new Set) != setTag) ||
	    (WeakMap && getTag(new WeakMap) != weakMapTag)) {
	  getTag = function(value) {
	    var result = objectToString.call(value),
	        Ctor = result == objectTag ? value.constructor : undefined,
	        ctorString = Ctor ? toSource(Ctor) : undefined;

	    if (ctorString) {
	      switch (ctorString) {
	        case dataViewCtorString: return dataViewTag;
	        case mapCtorString: return mapTag;
	        case promiseCtorString: return promiseTag;
	        case setCtorString: return setTag;
	        case weakMapCtorString: return weakMapTag;
	      }
	    }
	    return result;
	  };
	}

	/**
	 * Initializes an array clone.
	 *
	 * @private
	 * @param {Array} array The array to clone.
	 * @returns {Array} Returns the initialized clone.
	 */
	function initCloneArray(array) {
	  var length = array.length,
	      result = array.constructor(length);

	  // Add properties assigned by `RegExp#exec`.
	  if (length && typeof array[0] == 'string' && hasOwnProperty.call(array, 'index')) {
	    result.index = array.index;
	    result.input = array.input;
	  }
	  return result;
	}

	/**
	 * Initializes an object clone.
	 *
	 * @private
	 * @param {Object} object The object to clone.
	 * @returns {Object} Returns the initialized clone.
	 */
	function initCloneObject(object) {
	  return (typeof object.constructor == 'function' && !isPrototype(object))
	    ? baseCreate(getPrototype(object))
	    : {};
	}

	/**
	 * Initializes an object clone based on its `toStringTag`.
	 *
	 * **Note:** This function only supports cloning values with tags of
	 * `Boolean`, `Date`, `Error`, `Number`, `RegExp`, or `String`.
	 *
	 * @private
	 * @param {Object} object The object to clone.
	 * @param {string} tag The `toStringTag` of the object to clone.
	 * @param {Function} cloneFunc The function to clone values.
	 * @param {boolean} [isDeep] Specify a deep clone.
	 * @returns {Object} Returns the initialized clone.
	 */
	function initCloneByTag(object, tag, cloneFunc, isDeep) {
	  var Ctor = object.constructor;
	  switch (tag) {
	    case arrayBufferTag:
	      return cloneArrayBuffer(object);

	    case boolTag:
	    case dateTag:
	      return new Ctor(+object);

	    case dataViewTag:
	      return cloneDataView(object, isDeep);

	    case float32Tag: case float64Tag:
	    case int8Tag: case int16Tag: case int32Tag:
	    case uint8Tag: case uint8ClampedTag: case uint16Tag: case uint32Tag:
	      return cloneTypedArray(object, isDeep);

	    case mapTag:
	      return cloneMap(object, isDeep, cloneFunc);

	    case numberTag:
	    case stringTag:
	      return new Ctor(object);

	    case regexpTag:
	      return cloneRegExp(object);

	    case setTag:
	      return cloneSet(object, isDeep, cloneFunc);

	    case symbolTag:
	      return cloneSymbol(object);
	  }
	}

	/**
	 * Checks if `value` is a valid array-like index.
	 *
	 * @private
	 * @param {*} value The value to check.
	 * @param {number} [length=MAX_SAFE_INTEGER] The upper bounds of a valid index.
	 * @returns {boolean} Returns `true` if `value` is a valid index, else `false`.
	 */
	function isIndex(value, length) {
	  length = length == null ? MAX_SAFE_INTEGER : length;
	  return !!length &&
	    (typeof value == 'number' || reIsUint.test(value)) &&
	    (value > -1 && value % 1 == 0 && value < length);
	}

	/**
	 * Checks if `value` is suitable for use as unique object key.
	 *
	 * @private
	 * @param {*} value The value to check.
	 * @returns {boolean} Returns `true` if `value` is suitable, else `false`.
	 */
	function isKeyable(value) {
	  var type = typeof value;
	  return (type == 'string' || type == 'number' || type == 'symbol' || type == 'boolean')
	    ? (value !== '__proto__')
	    : (value === null);
	}

	/**
	 * Checks if `func` has its source masked.
	 *
	 * @private
	 * @param {Function} func The function to check.
	 * @returns {boolean} Returns `true` if `func` is masked, else `false`.
	 */
	function isMasked(func) {
	  return !!maskSrcKey && (maskSrcKey in func);
	}

	/**
	 * Checks if `value` is likely a prototype object.
	 *
	 * @private
	 * @param {*} value The value to check.
	 * @returns {boolean} Returns `true` if `value` is a prototype, else `false`.
	 */
	function isPrototype(value) {
	  var Ctor = value && value.constructor,
	      proto = (typeof Ctor == 'function' && Ctor.prototype) || objectProto;

	  return value === proto;
	}

	/**
	 * Converts `func` to its source code.
	 *
	 * @private
	 * @param {Function} func The function to process.
	 * @returns {string} Returns the source code.
	 */
	function toSource(func) {
	  if (func != null) {
	    try {
	      return funcToString.call(func);
	    } catch (e) {}
	    try {
	      return (func + '');
	    } catch (e) {}
	  }
	  return '';
	}

	/**
	 * This method is like `_.clone` except that it recursively clones `value`.
	 *
	 * @static
	 * @memberOf _
	 * @since 1.0.0
	 * @category Lang
	 * @param {*} value The value to recursively clone.
	 * @returns {*} Returns the deep cloned value.
	 * @see _.clone
	 * @example
	 *
	 * var objects = [{ 'a': 1 }, { 'b': 2 }];
	 *
	 * var deep = _.cloneDeep(objects);
	 * console.log(deep[0] === objects[0]);
	 * // => false
	 */
	function cloneDeep(value) {
	  return baseClone(value, true, true);
	}

	/**
	 * Performs a
	 * [`SameValueZero`](http://ecma-international.org/ecma-262/7.0/#sec-samevaluezero)
	 * comparison between two values to determine if they are equivalent.
	 *
	 * @static
	 * @memberOf _
	 * @since 4.0.0
	 * @category Lang
	 * @param {*} value The value to compare.
	 * @param {*} other The other value to compare.
	 * @returns {boolean} Returns `true` if the values are equivalent, else `false`.
	 * @example
	 *
	 * var object = { 'a': 1 };
	 * var other = { 'a': 1 };
	 *
	 * _.eq(object, object);
	 * // => true
	 *
	 * _.eq(object, other);
	 * // => false
	 *
	 * _.eq('a', 'a');
	 * // => true
	 *
	 * _.eq('a', Object('a'));
	 * // => false
	 *
	 * _.eq(NaN, NaN);
	 * // => true
	 */
	function eq(value, other) {
	  return value === other || (value !== value && other !== other);
	}

	/**
	 * Checks if `value` is likely an `arguments` object.
	 *
	 * @static
	 * @memberOf _
	 * @since 0.1.0
	 * @category Lang
	 * @param {*} value The value to check.
	 * @returns {boolean} Returns `true` if `value` is an `arguments` object,
	 *  else `false`.
	 * @example
	 *
	 * _.isArguments(function() { return arguments; }());
	 * // => true
	 *
	 * _.isArguments([1, 2, 3]);
	 * // => false
	 */
	function isArguments(value) {
	  // Safari 8.1 makes `arguments.callee` enumerable in strict mode.
	  return isArrayLikeObject(value) && hasOwnProperty.call(value, 'callee') &&
	    (!propertyIsEnumerable.call(value, 'callee') || objectToString.call(value) == argsTag);
	}

	/**
	 * Checks if `value` is classified as an `Array` object.
	 *
	 * @static
	 * @memberOf _
	 * @since 0.1.0
	 * @category Lang
	 * @param {*} value The value to check.
	 * @returns {boolean} Returns `true` if `value` is an array, else `false`.
	 * @example
	 *
	 * _.isArray([1, 2, 3]);
	 * // => true
	 *
	 * _.isArray(document.body.children);
	 * // => false
	 *
	 * _.isArray('abc');
	 * // => false
	 *
	 * _.isArray(_.noop);
	 * // => false
	 */
	var isArray = Array.isArray;

	/**
	 * Checks if `value` is array-like. A value is considered array-like if it's
	 * not a function and has a `value.length` that's an integer greater than or
	 * equal to `0` and less than or equal to `Number.MAX_SAFE_INTEGER`.
	 *
	 * @static
	 * @memberOf _
	 * @since 4.0.0
	 * @category Lang
	 * @param {*} value The value to check.
	 * @returns {boolean} Returns `true` if `value` is array-like, else `false`.
	 * @example
	 *
	 * _.isArrayLike([1, 2, 3]);
	 * // => true
	 *
	 * _.isArrayLike(document.body.children);
	 * // => true
	 *
	 * _.isArrayLike('abc');
	 * // => true
	 *
	 * _.isArrayLike(_.noop);
	 * // => false
	 */
	function isArrayLike(value) {
	  return value != null && isLength(value.length) && !isFunction(value);
	}

	/**
	 * This method is like `_.isArrayLike` except that it also checks if `value`
	 * is an object.
	 *
	 * @static
	 * @memberOf _
	 * @since 4.0.0
	 * @category Lang
	 * @param {*} value The value to check.
	 * @returns {boolean} Returns `true` if `value` is an array-like object,
	 *  else `false`.
	 * @example
	 *
	 * _.isArrayLikeObject([1, 2, 3]);
	 * // => true
	 *
	 * _.isArrayLikeObject(document.body.children);
	 * // => true
	 *
	 * _.isArrayLikeObject('abc');
	 * // => false
	 *
	 * _.isArrayLikeObject(_.noop);
	 * // => false
	 */
	function isArrayLikeObject(value) {
	  return isObjectLike(value) && isArrayLike(value);
	}

	/**
	 * Checks if `value` is a buffer.
	 *
	 * @static
	 * @memberOf _
	 * @since 4.3.0
	 * @category Lang
	 * @param {*} value The value to check.
	 * @returns {boolean} Returns `true` if `value` is a buffer, else `false`.
	 * @example
	 *
	 * _.isBuffer(new Buffer(2));
	 * // => true
	 *
	 * _.isBuffer(new Uint8Array(2));
	 * // => false
	 */
	var isBuffer = nativeIsBuffer || stubFalse;

	/**
	 * Checks if `value` is classified as a `Function` object.
	 *
	 * @static
	 * @memberOf _
	 * @since 0.1.0
	 * @category Lang
	 * @param {*} value The value to check.
	 * @returns {boolean} Returns `true` if `value` is a function, else `false`.
	 * @example
	 *
	 * _.isFunction(_);
	 * // => true
	 *
	 * _.isFunction(/abc/);
	 * // => false
	 */
	function isFunction(value) {
	  // The use of `Object#toString` avoids issues with the `typeof` operator
	  // in Safari 8-9 which returns 'object' for typed array and other constructors.
	  var tag = isObject(value) ? objectToString.call(value) : '';
	  return tag == funcTag || tag == genTag;
	}

	/**
	 * Checks if `value` is a valid array-like length.
	 *
	 * **Note:** This method is loosely based on
	 * [`ToLength`](http://ecma-international.org/ecma-262/7.0/#sec-tolength).
	 *
	 * @static
	 * @memberOf _
	 * @since 4.0.0
	 * @category Lang
	 * @param {*} value The value to check.
	 * @returns {boolean} Returns `true` if `value` is a valid length, else `false`.
	 * @example
	 *
	 * _.isLength(3);
	 * // => true
	 *
	 * _.isLength(Number.MIN_VALUE);
	 * // => false
	 *
	 * _.isLength(Infinity);
	 * // => false
	 *
	 * _.isLength('3');
	 * // => false
	 */
	function isLength(value) {
	  return typeof value == 'number' &&
	    value > -1 && value % 1 == 0 && value <= MAX_SAFE_INTEGER;
	}

	/**
	 * Checks if `value` is the
	 * [language type](http://www.ecma-international.org/ecma-262/7.0/#sec-ecmascript-language-types)
	 * of `Object`. (e.g. arrays, functions, objects, regexes, `new Number(0)`, and `new String('')`)
	 *
	 * @static
	 * @memberOf _
	 * @since 0.1.0
	 * @category Lang
	 * @param {*} value The value to check.
	 * @returns {boolean} Returns `true` if `value` is an object, else `false`.
	 * @example
	 *
	 * _.isObject({});
	 * // => true
	 *
	 * _.isObject([1, 2, 3]);
	 * // => true
	 *
	 * _.isObject(_.noop);
	 * // => true
	 *
	 * _.isObject(null);
	 * // => false
	 */
	function isObject(value) {
	  var type = typeof value;
	  return !!value && (type == 'object' || type == 'function');
	}

	/**
	 * Checks if `value` is object-like. A value is object-like if it's not `null`
	 * and has a `typeof` result of "object".
	 *
	 * @static
	 * @memberOf _
	 * @since 4.0.0
	 * @category Lang
	 * @param {*} value The value to check.
	 * @returns {boolean} Returns `true` if `value` is object-like, else `false`.
	 * @example
	 *
	 * _.isObjectLike({});
	 * // => true
	 *
	 * _.isObjectLike([1, 2, 3]);
	 * // => true
	 *
	 * _.isObjectLike(_.noop);
	 * // => false
	 *
	 * _.isObjectLike(null);
	 * // => false
	 */
	function isObjectLike(value) {
	  return !!value && typeof value == 'object';
	}

	/**
	 * Creates an array of the own enumerable property names of `object`.
	 *
	 * **Note:** Non-object values are coerced to objects. See the
	 * [ES spec](http://ecma-international.org/ecma-262/7.0/#sec-object.keys)
	 * for more details.
	 *
	 * @static
	 * @since 0.1.0
	 * @memberOf _
	 * @category Object
	 * @param {Object} object The object to query.
	 * @returns {Array} Returns the array of property names.
	 * @example
	 *
	 * function Foo() {
	 *   this.a = 1;
	 *   this.b = 2;
	 * }
	 *
	 * Foo.prototype.c = 3;
	 *
	 * _.keys(new Foo);
	 * // => ['a', 'b'] (iteration order is not guaranteed)
	 *
	 * _.keys('hi');
	 * // => ['0', '1']
	 */
	function keys(object) {
	  return isArrayLike(object) ? arrayLikeKeys(object) : baseKeys(object);
	}

	/**
	 * This method returns a new empty array.
	 *
	 * @static
	 * @memberOf _
	 * @since 4.13.0
	 * @category Util
	 * @returns {Array} Returns the new empty array.
	 * @example
	 *
	 * var arrays = _.times(2, _.stubArray);
	 *
	 * console.log(arrays);
	 * // => [[], []]
	 *
	 * console.log(arrays[0] === arrays[1]);
	 * // => false
	 */
	function stubArray() {
	  return [];
	}

	/**
	 * This method returns `false`.
	 *
	 * @static
	 * @memberOf _
	 * @since 4.13.0
	 * @category Util
	 * @returns {boolean} Returns `false`.
	 * @example
	 *
	 * _.times(2, _.stubFalse);
	 * // => [false, false]
	 */
	function stubFalse() {
	  return false;
	}

	module.exports = cloneDeep;
} (lodash_clonedeep, lodash_clonedeepExports));

var cloneDeep = lodash_clonedeepExports;

var script = defineComponent({
    name: 'SvgTreeOrg',
    components: { treeNode: __vue_component__$1 },
    props: {
        data: {
            type: Array,
            default: () => []
        },
        linkNodeData: {
            type: Array,
            default: () => []
        },
        direction: {
            type: String,
            default: 'horizontal'
        },
        collapsable: {
            type: Boolean,
            default: true
        },
        toolsHandle: {
            type: Function,
            default: () => (null)
        },
        lineWidth: {
            type: Number,
            default: 1
        },
        lineColor: {
            type: String,
            default: '#ddd'
        },
        lineArrow: {
            type: Object,
            default: () => ({
                open: false,
                markerWidth: 5,
                markerHeight: 8,
                refX: 0,
                refY: 4,
                margin: 0
            })
        },
        lineCircle: {
            type: Object,
            default: () => ({
                open: false,
                markerWidth: 8,
                markerHeight: 8,
                refX: 0,
                refY: 4,
                r: 3,
                strokeWidth: 2,
                margin: 4
            })
        },
        zoomable: {
            type: Boolean,
            default: true
        },
        draggable: {
            type: Boolean,
            default: true
        },
        nodeWidth: {
            type: Number,
            default: 100,
        },
        nodeHeight: {
            type: Number,
            default: 60
        },
        rootNodesep: {
            type: Number,
            default: 10
        },
        marginSize: {
            type: Number,
            default: 10
        },
        line1: {
            type: Number,
            default: 30
        },
        line2: {
            type: Number,
            default: 80
        },
        treeCenter: {
            type: Boolean,
            default: true
        },
        defaultScale: {
            type: Number,
            default: 1
        }
    },
    setup(props, { emit }) {
        const svgRef = ref(null);
        const treeBox = ref(null);
        const treeData = ref([]);
        let currentTreeData = [];
        const setData = (data) => {
            if (!data || data.length === 0) {
                treeData.value = [];
                return;
            }
            treeData.value = transformData2Tree(cloneDeep(data)); // 深拷贝原始数据
            currentTreeData = transformData2Tree(cloneDeep(data));
        };
        const treeWidth = ref(0);
        const treeHeight = ref(0);
        const viewBox = ref('0 0 0 0');
        let svgWidth = 0;
        let svgHeight = 0;
        // 设置节点坐标和svg宽高
        const setAxis = () => {
            const levelXStart = {}; // 寻找同级节点的离当前线最近的x坐标，防止节点重叠
            const levelYStart = {}; // 寻找同级节点的离当前线最近的y坐标，防止节点重叠
            let xStart = 0;
            let yStart = 0;
            const func = (arr, parent) => {
                if (!arr || arr.length <= 0)
                    return;
                const y = parent
                    ? (parent.yStart + (props.direction === 'vertical' ? 0 : parent.line1 + parent.line2) + parent.height)
                    : 0;
                const x = parent
                    ? (parent.xStart + (props.direction === 'horizontal' ? 0 : parent.line1 + parent.line2) + parent.width)
                    : 0;
                arr.forEach((v, i) => {
                    const node = new TreeNode(v);
                    node.width = props.nodeWidth;
                    node.height = props.nodeHeight;
                    node.marginSize = props.marginSize;
                    node.rootNodesep = props.rootNodesep;
                    node.line1 = props.line1;
                    node.line2 = props.line2;
                    node.yStart = y;
                    if (props.direction === 'vertical')
                        node.xStart = x;
                    node.parentNode = parent;
                    node.prevNode = arr[i - 1];
                    node.nextNode = arr[i + 1];
                    node.toolsHandle = props.toolsHandle; // 操作按钮
                    node.treeDirection = props.direction; // 树的方向
                    node.close = false;
                    arr[i] = node;
                    if (levelXStart[v.level] > xStart)
                        xStart = levelXStart[v.level];
                    if (levelYStart[v.level] > yStart)
                        yStart = levelYStart[v.level];
                    if (node.children && node.children.length) {
                        const minXStart = xStart;
                        const minYStart = yStart;
                        func(node.children, node);
                        const end = node.children[node.children.length - 1], first = node.children[0];
                        const nowXStart = (end.xStart + end.width - first.xStart - node.width) / 2 + first.xStart; // 计算子节点中最左和最右节点的中间位置
                        const nowYStart = (end.yStart + end.height - first.yStart - node.height) / 2 + first.yStart; // 计算子节点中最上和最下节点的中间位置
                        const nowLimit = props.direction === 'vertical' ? nowYStart < minYStart : nowXStart < minXStart;
                        if (nowLimit) { // 可能有重叠块，重新计算一下位置
                            const num = props.direction === 'vertical' ? (minYStart - nowYStart) : (minXStart - nowXStart);
                            const resetAxis = (childs) => {
                                for (const v of childs) {
                                    if (props.direction === 'vertical') {
                                        v.yStart += num;
                                        const x = v.yStart + v.height + v.marginSize;
                                        if (levelYStart[v.level] < x)
                                            levelYStart[v.level] = x;
                                    }
                                    if (props.direction === 'horizontal') {
                                        v.xStart += num;
                                        const x = v.xStart + v.width + v.marginSize;
                                        if (levelXStart[v.level] < x)
                                            levelXStart[v.level] = x;
                                    }
                                    if (v.children && v.children.length)
                                        resetAxis(v.children);
                                }
                            };
                            resetAxis(node.children);
                            if (props.direction === 'vertical') {
                                yStart = minYStart;
                            }
                            else {
                                xStart = nowXStart;
                            }
                        }
                        else {
                            if (props.direction === 'vertical') {
                                yStart = nowYStart;
                            }
                            else {
                                xStart = nowXStart;
                            }
                        }
                        if (props.direction === 'vertical') {
                            node.yStart = yStart;
                            if (arr[i + 1])
                                yStart += node.height + node.marginSize;
                        }
                        else {
                            node.xStart = xStart;
                            if (arr[i + 1])
                                xStart += node.width + node.marginSize;
                        }
                    }
                    else {
                        if (props.direction === 'vertical') {
                            node.yStart = yStart;
                            yStart += node.height + node.marginSize;
                            if (node.rootNodesep && node.firstLeafNode) {
                                node.yStart += node.rootNodesep;
                                yStart += node.rootNodesep;
                            }
                        }
                        else {
                            node.xStart = xStart;
                            xStart += node.width + node.marginSize;
                            if (node.rootNodesep && node.firstLeafNode) {
                                node.xStart += node.rootNodesep;
                                xStart += node.rootNodesep;
                            }
                        }
                    }
                    if (props.direction === 'vertical') {
                        levelYStart[v.level] = yStart;
                    }
                    else {
                        levelXStart[v.level] = xStart;
                    }
                });
                // 画布大小设置
                if (y > svgHeight)
                    svgHeight = y;
                if (x > svgWidth && props.direction === 'vertical')
                    svgWidth = x;
                if (xStart > svgWidth)
                    svgWidth = xStart;
                if (yStart > svgHeight && props.direction === 'vertical')
                    svgHeight = yStart;
            };
            func(currentTreeData);
            treeData.value = currentTreeData;
            fitContent();
        };
        // 垂直水平居中
        const fitContent = async () => {
            const boxWidth = treeBox.value && window.getComputedStyle(treeBox.value).width;
            const boxHeight = treeBox.value && window.getComputedStyle(treeBox.value).height;
            treeWidth.value = Number(boxWidth?.split('px')[0]);
            treeHeight.value = Number(boxHeight?.split('px')[0]);
            const xMiddle = props.treeCenter
                ? (treeWidth.value - svgWidth) / 2 > 0 ? (treeWidth.value - svgWidth) / 2 : 0
                : 0;
            const yMiddle = props.treeCenter
                ? (treeHeight.value - svgHeight) / 2 > 0 ? (treeHeight.value - svgHeight) / 2 : 0
                : 0;
            viewBox.value = `${-xMiddle} ${-yMiddle} ${treeWidth.value * 1 / props.defaultScale} ${treeHeight.value * 1 / props.defaultScale}`;
            if (props.defaultScale === 1)
                return;
            await nextTick();
            const lastGElement = treeBox.value?.children[0].lastElementChild;
            if (lastGElement) {
                const gWidth = lastGElement.getBoundingClientRect().width;
                const gHeight = lastGElement.getBoundingClientRect().height;
                const gXMiddle = props.treeCenter
                    ? (treeWidth.value - gWidth) > 0 ? (treeWidth.value - gWidth) / 2 / props.defaultScale : 0
                    : 0;
                const gYMiddle = props.treeCenter
                    ? (treeHeight.value - gHeight) > 0 ? (treeHeight.value - gHeight) / 2 / props.defaultScale : 0
                    : 0;
                viewBox.value = `${-gXMiddle} ${-gYMiddle} ${treeWidth.value * 1 / props.defaultScale} ${treeHeight.value * 1 / props.defaultScale}`;
            }
        };
        // 跨节点连接
        const setNodeLink = () => {
            provide('linkNodeData', props.linkNodeData);
            provide('treeData', currentTreeData);
            provide('rootNodesep', props.rootNodesep);
        };
        // const matrixTransformSVG = (treeData: Array<Node>) => {
        //   let matrix = compose(
        //     rotate(Math.PI/3, 200, 200)
        //   )
        //   const transform = (treeData: Array<Node>) => {
        //     treeData.forEach((node) => {
        //       const { x, y } = applyToPoint(matrix, {x: node.xStart, y: node.yStart})
        //       node.xStart = x
        //       node.yStart = y
        //       if (node.children && node.children?.length > 0) {
        //         transform(node.children)
        //       }
        //     })
        //   }
        //   transform(treeData)
        // }
        // client与svg坐标相互转换
        const svgMatrixTransform = (e) => {
            const startViewBox = viewBox.value.split(' ').map(n => parseFloat(n));
            const startClient = {
                x: e.clientX,
                y: e.clientY
            };
            // 将client坐标转换为svg坐标
            let newSVGPoint = svgRef.value?.createSVGPoint();
            let CTM = svgRef.value?.getScreenCTM();
            if (newSVGPoint) {
                newSVGPoint.x = startClient.x;
                newSVGPoint.y = startClient.y;
            }
            const startSVGPoint = newSVGPoint?.matrixTransform(CTM?.inverse()); // 转换后的svg坐标
            //	将一开始的 viewPort Client 利用新的 CTM 转换为新的svg坐标
            CTM = svgRef.value?.getScreenCTM();
            let moveToSVGPoint = newSVGPoint?.matrixTransform(CTM?.inverse());
            return {
                startViewBox,
                newSVGPoint,
                CTM,
                startSVGPoint,
                moveToSVGPoint
            };
        };
        // 缩放功能
        const zoom = (e) => {
            const { startViewBox, startSVGPoint, moveToSVGPoint } = svgMatrixTransform(e);
            // 设置缩放
            let r;
            if (e.deltaY > 0) {
                r = 1.1;
            }
            else if (e.deltaY < 0) {
                r = 0.9;
            }
            else {
                r = 1;
            }
            viewBox.value = `${startViewBox[0]} ${startViewBox[1]} ${startViewBox[2] * r} ${startViewBox[3] * r}`;
            //	计算偏移量
            let delta = {
                dx: startSVGPoint && moveToSVGPoint ? startSVGPoint.x - moveToSVGPoint.x : 0,
                dy: startSVGPoint && moveToSVGPoint ? startSVGPoint.y - moveToSVGPoint.y : 0
            };
            // 设置最终viewport位置
            let middleViewBox = viewBox.value.split(' ').map(n => parseFloat(n));
            let moveBackViewBox = `${middleViewBox[0] + delta.dx} ${middleViewBox[1] + delta.dy} ${middleViewBox[2]} ${middleViewBox[3]}`;
            viewBox.value = moveBackViewBox;
            emit('zoom', viewBox.value);
        };
        const handleZoom = (r) => {
            const startViewBox = viewBox.value.split(' ').map(n => parseFloat(n));
            viewBox.value = `${startViewBox[0]} ${startViewBox[1]} ${startViewBox[2] * r} ${startViewBox[3] * r}`;
            emit('zoom', viewBox.value);
        };
        const zoomNarrow = () => {
            const r = 1;
            handleZoom(r + 0.1);
        };
        const zoomEnlarge = () => {
            const r = 1;
            handleZoom(r - 0.1);
        };
        // 拖拽相关功能
        const dragging = ref(false);
        const mousedown = () => {
            dragging.value = true;
        };
        const mouseup = () => {
            dragging.value = false;
        };
        const drag = (e) => {
            if (!dragging.value || !props.draggable)
                return;
            const startViewBox = viewBox.value.split(' ').map(n => parseFloat(n));
            const startClient = {
                x: e.clientX,
                y: e.clientY
            };
            // 将client坐标转换为svg坐标
            let newSVGPoint = svgRef.value?.createSVGPoint();
            let CTM = svgRef.value?.getScreenCTM();
            if (newSVGPoint) {
                newSVGPoint.x = startClient.x;
                newSVGPoint.y = startClient.y;
            }
            const startSVGPoint = newSVGPoint?.matrixTransform(CTM?.inverse()); // 转换后的svg坐标
            let moveToClient = {
                x: e.clientX + e.movementX,
                y: e.clientY + e.movementY
            };
            newSVGPoint = svgRef.value?.createSVGPoint();
            CTM = svgRef.value?.getScreenCTM();
            if (newSVGPoint) {
                newSVGPoint.x = moveToClient.x;
                newSVGPoint.y = moveToClient.y;
            }
            let moveToSVGPoint = newSVGPoint?.matrixTransform(CTM?.inverse());
            if (startSVGPoint && moveToSVGPoint) {
                let delta = {
                    dx: startSVGPoint.x - moveToSVGPoint.x,
                    dy: startSVGPoint.y - moveToSVGPoint.y
                };
                let moveToViewBox = `${startViewBox[0] + delta.dx} ${startViewBox[1] + delta.dy} ${startViewBox[2]} ${startViewBox[3]}`;
                viewBox.value = moveToViewBox;
            }
        };
        const handleLineMouseover = (node) => {
            emit('line-mouseover', node);
        };
        const handleLineMouseout = (node) => {
            emit('line-mouseout', node);
        };
        watch(() => props.direction, (val) => {
            setAxis();
        });
        onMounted(() => {
            if (props.data && props.data.length > 0) {
                setData(props.data);
                setAxis();
            }
            if (props.linkNodeData) {
                setNodeLink();
            }
            // matrixTransformSVG(treeData.value)
        });
        return {
            svgRef,
            treeBox,
            viewBox,
            currentTreeData,
            treeData,
            treeWidth,
            treeHeight,
            zoom,
            drag,
            mousedown,
            mouseup,
            handleLineMouseover,
            handleLineMouseout,
            zoomNarrow,
            zoomEnlarge,
            fitContent
        };
    }
});

const isOldIE = typeof navigator !== 'undefined' &&
    /msie [6-9]\\b/.test(navigator.userAgent.toLowerCase());
function createInjector(context) {
    return (id, style) => addStyle(id, style);
}
let HEAD;
const styles = {};
function addStyle(id, css) {
    const group = isOldIE ? css.media || 'default' : id;
    const style = styles[group] || (styles[group] = { ids: new Set(), styles: [] });
    if (!style.ids.has(id)) {
        style.ids.add(id);
        let code = css.source;
        if (css.map) {
            // https://developer.chrome.com/devtools/docs/javascript-debugging
            // this makes source maps inside style tags work properly in Chrome
            code += '\n/*# sourceURL=' + css.map.sources[0] + ' */';
            // http://stackoverflow.com/a/26603875
            code +=
                '\n/*# sourceMappingURL=data:application/json;base64,' +
                    btoa(unescape(encodeURIComponent(JSON.stringify(css.map)))) +
                    ' */';
        }
        if (!style.element) {
            style.element = document.createElement('style');
            style.element.type = 'text/css';
            if (css.media)
                style.element.setAttribute('media', css.media);
            if (HEAD === undefined) {
                HEAD = document.head || document.getElementsByTagName('head')[0];
            }
            HEAD.appendChild(style.element);
        }
        if ('styleSheet' in style.element) {
            style.styles.push(code);
            style.element.styleSheet.cssText = style.styles
                .filter(Boolean)
                .join('\n');
        }
        else {
            const index = style.ids.size - 1;
            const textNode = document.createTextNode(code);
            const nodes = style.element.childNodes;
            if (nodes[index])
                style.element.removeChild(nodes[index]);
            if (nodes.length)
                style.element.insertBefore(textNode, nodes[index]);
            else
                style.element.appendChild(textNode);
        }
    }
}

/* script */
const __vue_script__ = script;

/* template */
var __vue_render__ = function () {
  var _vm = this;
  var _h = _vm.$createElement;
  var _c = _vm._self._c || _h;
  return _c(
    "div",
    {
      ref: "treeBox",
      staticClass: "tree-box",
      on: {
        wheel: _vm.zoom,
        mousedown: _vm.mousedown,
        mouseup: _vm.mouseup,
        mousemove: _vm.drag,
      },
    },
    [
      _c(
        "svg",
        {
          ref: "svgRef",
          staticStyle: { display: "block", margin: "auto" },
          attrs: {
            xmlns: "http://www.w3.org/2000/svg",
            "xmlns:xlink": "http://www.w3.org/1999/xlink",
            draggable: "true",
            width: _vm.treeWidth,
            height: _vm.treeHeight,
            viewBox: _vm.viewBox,
            version: "1.1",
          },
        },
        _vm._l(_vm.treeData, function (node) {
          return _c("tree-node", {
            key: node.id,
            attrs: {
              id: node.id,
              lineWidth: _vm.lineWidth,
              lineColor: _vm.lineColor,
              treeDirection: _vm.direction,
              node: node,
              hasSlot: _vm.$scopedSlots.node,
              lineArrow: _vm.lineArrow,
              lineCircle: _vm.lineCircle,
              collapsable: _vm.collapsable,
              source: _vm.linkNodeData.find(function (item) {
                return item.source === node.id
              })
                ? node.id
                : "",
              target: _vm.linkNodeData.find(function (item) {
                return item.target === node.id
              })
                ? node.id
                : "",
            },
            on: {
              "line-mouseover": _vm.handleLineMouseover,
              "line-mouseout": _vm.handleLineMouseout,
            },
            scopedSlots: _vm._u(
              [
                {
                  key: "node",
                  fn: function (slotProps) {
                    return [_vm._t("node", null, { node: slotProps.node })]
                  },
                },
              ],
              null,
              true
            ),
          })
        }),
        1
      ),
    ]
  )
};
var __vue_staticRenderFns__ = [];
__vue_render__._withStripped = true;

  /* style */
  const __vue_inject_styles__ = function (inject) {
    if (!inject) return
    inject("data-v-47e487cc_0", { source: ".tree-box {\n  width: 100%;\n  height: 100%;\n  overflow: hidden;\n}", map: undefined, media: undefined });

  };
  /* scoped */
  const __vue_scope_id__ = undefined;
  /* module identifier */
  const __vue_module_identifier__ = undefined;
  /* functional template */
  const __vue_is_functional_template__ = false;
  /* style inject SSR */
  
  /* style inject shadow dom */
  

  
  const __vue_component__ = /*#__PURE__*/normalizeComponent(
    { render: __vue_render__, staticRenderFns: __vue_staticRenderFns__ },
    __vue_inject_styles__,
    __vue_script__,
    __vue_scope_id__,
    __vue_is_functional_template__,
    __vue_module_identifier__,
    false,
    createInjector,
    undefined,
    undefined
  );

const CustomTreeOrg = __vue_component__;
const install = function (Vue) {
  Vue.component(__vue_component__.name, CustomTreeOrg);
};

export { CustomTreeOrg, install as default };
