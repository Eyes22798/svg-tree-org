<template>
    <g
      :collapse="collapse"
      :id="node.id"
    >
      <foreignObject v-if="$scopedSlots.node" :x="node.xStart" :y="node.yStart" :width="node.width" :height="node.height">
        <slot name="node" :node="node"></slot>
      </foreignObject>
      <rect
        v-if="!hasSlot"
        :x="node.xStart" :y="node.yStart" :width="node.width" :height="node.height" rx="2"
        class="node-rect"
        fill="white" stroke="#ddd" stroke-width="1"
      ></rect>
      <g v-if="!hasSlot">
        <text
          fill="black" stroke="none"
          :font-size="fontSize"
          :letter-spacing="letterSpacing"
          text-anchor="middle" dominant-baseline="middle"
          :x="middle"
          :y="startY"
        >{{ nodeText[0] }}</text>
      </g>

      <tree-node
        v-for="child in childNodes"
        :id="child.id"
        :node="child"
        :treeDirection="child.treeDirection"
        :key="child.id"
        :lineColor="lineColor"
        :hasSlot="hasSlot"
        :lineArrow="lineArrow"
        :lineCircle="lineCircle"
        :collapsable="collapsable"
        :style="{ display: node.close ? 'none' : '' }"
        :source="linkNodeData.find((item) => item.source === child.id) ? child.id : ''"
        :target="linkNodeData.find((item) => item.target === child.id) ? child.id : ''"
        @line-mouseover="handleLineMouseover"
        @line-mouseout="handleLineMouseout"
      >
        <template #node="slotProps">
          <slot name="node" :node="slotProps.node"></slot>
        </template>
      </tree-node>
      <g id="node-line" :close="String(node.close)">
        <path v-if="node.parentNode && node.prevNode" class="line1" :d="line1Dth" fill="none" :stroke="lineColor" :stroke-width="lineWidth" stroke-linecap="round" />

        <g
          @mouseover="handleLineMouseover(node)"
          @onmouseout="handleLineMouseout(node)"
          fill="none"
          :stroke="node.lineColor || lineColor"
          :stroke-dasharray="node.lineDasharray || 'none'"
        >
          <defs>
            <marker v-if="lineArrow.open" :id="node.id + 'triangleMarker'" markerUnits="strokeWidth" :markerWidth="lineArrow.markerWidth" :markerHeight="lineArrow.markerHeight" :refX="lineArrow.refX" :refY="lineArrow.refY" orient="auto">
              <polygon :fill="node.lineColor || lineColor" :points="`${0},${0}  ${lineArrow.markerWidth }, ${lineArrow.markerHeight / 2}  ${0}, ${lineArrow.markerHeight}`" />
            </marker>
          </defs>
          <defs>
            <marker v-if="lineCircle.open && node.children && node.children.length > 0" :id="node.id + 'circleMarker'" :markerWidth="lineCircle.markerWidth" :markerHeight="lineCircle.markerHeight" :refX="lineCircle.refX" :refY="lineCircle.refY" orient="auto" markerUnits="userSpaceOnUse">
              <circle :stroke="node.children[0].lineColor ? node.children[0].lineColor : lineColor" :cx="lineCircle.markerWidth / 2" :cy="lineCircle.markerHeight / 2" :r="lineCircle.r" :stroke-width="lineCircle.strokeWidth" stroke-dasharray="none" />
            </marker>
          </defs>
          <path
            v-if="node.parentNode"
            class="line2"
            :d="line2Dth"
            :stroke-width="lineWidth"
            stroke-linecap="round"
            :style="{ markerEnd: `url(#${node.id}triangleMarker)` }"
          />
          <path
            v-if="node.children && node.children.length > 0"
            class="lineChild"
            :d="linesChildDth"
            :stroke-width="lineWidth"
            stroke-linecap="round"
            :stroke="node.children[0].lineColor ? node.children[0].lineColor : lineColor"
            :stroke-dasharray="node.children[0].lineDasharray ? node.children[0].lineDasharray : 'none'"
            :style="{ markerEnd: `url(#${node.id}circleMarker)` }"
          />
        </g>

        <circle
          v-if="node.children && node.children.length > 0 && collapsable"
          :cx="node.treeDirection === 'vertical' ? collaspeVerticalStartY : middle"
          :cy="node.treeDirection === 'vertical' ? verticalMiddle : collaspeStartY"
          :r="collapseSize"
          fill="white"
          :stroke="node.children[0].lineColor ? node.children[0].lineColor : lineColor"
          :stroke-width="lineWidth"
          style="cursor: pointer"
          @click="handleCollapse"
        />

        <text
          v-if="node.children && node.children.length > 0 && collapsable"
          :x="node.treeDirection === 'vertical' ? collaspeVerticalStartY : middle"
          :y="node.treeDirection === 'vertical' ? verticalMiddle : collaspeStartY"
          :font-size="12"
          :fill="lineColor"
          :stroke="node.children[0].lineColor ? node.children[0].lineColor : lineColor"
          text-anchor="middle"
          dominant-baseline="middle"
          style="cursor: pointer"
          @click="handleCollapse"
        >{{ node.close ? '+' : '-' }}</text>
      </g>
      <g id="link-line">
        <defs>
          <marker id="markerArrow" markerWidth="13" markerHeight="13" refX="2" refY="6" orient="auto">
            <path d="M2,2 L2,11 L10,6 L2,2" style="fill: #000;" />
          </marker>
        </defs>
        <path
          class="link-line"
          :d="linkLineDth"
          fill="none"
          :stroke="lineColor"
          :stroke-width="lineWidth"
          style="marker-mid:url(#markerArrow);"
        />
      </g>
    </g>
</template>

<script lang="ts">
import { defineComponent, ref, PropType, computed, toRefs, onMounted, watch, inject } from '@vue/composition-api'
import type { Node, LinkNode } from './type'
import { findTreeNode } from './utils/index'

const paddingSize = 5;                     // 一个节点的padding值
const maxWidth = 200;                      // 节点矩形框最大宽度
const maxHeight = 200;                     // 节点矩形框最大高度
const lineHeight = 10;                     // 文字行间距
const toolsHeight = 10

export default defineComponent({
  name: 'TreeNode',
  props: {
    node: {
      type: Object as PropType<Node>,
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
      type: String as PropType<'horizontal' | 'vertical'>,
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
    const { node, fontSize, letterSpacing } = toRefs(props)
    const middle = computed(() => node.value.xStart + node.value.width / 2) // 中间位置
    const verticalMiddle = computed(() => node.value.yStart + node.value.height / 2)
    const childNodes = computed(() => props.node.children)

    // 设置节点文本
    const nodeText = ref<Array<string>>([])
    const setNodeText = () => {
      if (!node.value.name || props.hasSlot) return

      const name = `${node.value.name}`

      let w, h
      const isHor = node.value.direction === 'horizontal' // 文字水平排列

      const compareLength = name.length
      const maxWords = ((isHor ? maxWidth : maxHeight) - paddingSize) / (fontSize.value + letterSpacing.value) - 1  // 一行或一竖最多可显示字数

      if (compareLength > maxWords) {
        const lines = Math.ceil(compareLength / maxWords)
        if (isHor) {
          w = maxWidth
          h = lines * (fontSize.value + lineHeight) + paddingSize + fontSize.value
        } else {
          w = lines * (fontSize.value + lineHeight) + paddingSize + fontSize.value
          h = maxHeight
        }

        nodeText.value = []
        const func = (str: string) => {
          if (!str) return
          nodeText.value.push(str.substring(0, maxWords))
          func(str.substring(maxWords))
        }
        func(name)
      } else {
        if (isHor) {
          w = paddingSize + (fontSize.value + letterSpacing.value) * compareLength
          h = paddingSize + fontSize.value + lineHeight + fontSize.value
        } else {
          w = paddingSize + fontSize.value + lineHeight + fontSize.value
          h = paddingSize + (fontSize.value + letterSpacing.value) * compareLength
        }
        nodeText.value = [name]
      }

      if (w < 120) w = 120               // 按钮宽度预留

      node.value.width = w
      node.value.height = h + toolsHeight   // 此处的fontSize 表示负责人一横数据高度
      node.value.nodeText = nodeText.value
    }

    // 节点文字
    const startY = computed(() => node.value.yStart + paddingSize + fontSize.value)
    const startX = computed(() => node.value.xStart + fontSize.value)
    const setAttrs = (i: number): Record<string, string | number> => {
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
        }
    }

    const line2Dth = ref('')  // 折叠节点上或者下方的竖线：line2      竖线
    const line1Dth = ref('')  // 折叠节点下方的横线：向左画（第一个节点不需要画）    横线
    const linesChildDth = ref('')  // 与子节点的第一段连线
    const collaspeStartY = ref(0)
    const collaspeVerticalStartY = ref(0)
    const createLine = () => {
      const parent = node.value.parentNode
      node.value.middle = middle.value
      node.value.verticalMiddle = verticalMiddle.value
      if (parent) {
        const startYParent = parent.yStart + parent.height + parent.line1
        const verticalStartParent = node.value.xStart - parent.line2
        const lineArrowMargin = props.lineArrow.open ? (props.lineArrow.markerWidth + props.lineArrow.margin) : 0
        line2Dth.value = node.value.treeDirection === 'vertical'
          ? `M ${verticalStartParent} ${verticalMiddle.value} L ${node.value.xStart - lineArrowMargin} ${verticalMiddle.value} ${props.lineArrow.open ? '' : 'z'}` // 如果line右箭头不闭合当前路径
          : `M ${middle.value} ${startYParent} L ${middle.value} ${node.value.yStart - lineArrowMargin} ${props.lineArrow.open ? '' : 'z'}`

        // 寻找前一个节点
        const prev = node.value.prevNode
        if (prev) {
          const start = node.value.treeDirection === 'vertical'
            ? `${verticalStartParent} ${prev.verticalMiddle}`
            : `${prev.middle} ${startYParent}`
          const end = node.value.treeDirection === 'vertical'
            ? `${verticalStartParent} ${verticalMiddle.value}`
            : `${middle.value} ${startYParent}`
          line1Dth.value = `M ${start} L ${end} z`
        }
      }

      if (!node.value.children || node.value.children.length <= 0) return

      collaspeStartY.value = node.value.yStart + node.value.height + node.value.line1
      collaspeVerticalStartY.value = node.value.xStart + node.value.width + node.value.line1
      const lineCircleMargin = props.lineCircle.open ? props.lineCircle.markerWidth + props.lineCircle.margin : 0
      linesChildDth.value = node.value.treeDirection === 'vertical'
        ? `M ${node.value.xStart + node.value.width + lineCircleMargin} ${verticalMiddle.value} L ${collaspeVerticalStartY.value} ${verticalMiddle.value} z`
        : `M ${middle.value} ${node.value.yStart + node.value.height + lineCircleMargin} L ${middle.value} ${collaspeStartY.value} z`
    }

    const linkLineDth = ref('') // 跨节点连接线
    const linkNodeData = inject('linkNodeData') as unknown as Array<LinkNode>
    const treeData = inject('treeData') as unknown as Array<Node>
    const createLinkLine = () => {
      let linkLine: Array<Node | undefined> = []
      if (props.target) {
        const source = linkNodeData.find((item) => item.target === props.target)?.source ?? -1
        const sourceNode = findTreeNode(source, treeData)
        const targetNode = findTreeNode(props.target, treeData)
        linkLine = [sourceNode, targetNode]
        const y1 = Number(sourceNode?.yStart) + (node.value.height / 2)
        const y2 = Number(targetNode?.yStart) + (node.value.height / 2)
        const q1 = Number(sourceNode?.xStart) - node.value.width / 2
        const q2 = y1 + (y2 - y1) / 2

        linkLineDth.value = `M ${sourceNode?.xStart}, ${y1} Q ${q1}, ${q2} ${targetNode?.xStart}, ${y2}`

        console.log('s t', linkLineDth.value)
      }
    }

    const handleCollapse = () => {
      node.value.close = !node.value.close
    }

    const handleLineMouseover = (node: Node) => {
      emit('line-mouseover', node)
    }

    const handleLineMouseout = (node: Node) => {
      emit('line-mouseout', node)
    }

    watch(() => props.treeDirection, (val) => {
      setNodeText()
      createLine()
    })

    onMounted(() => {
      setNodeText()
      createLine()
      createLinkLine()
    })

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
      linkLineDth
    }
  }
})
</script>

<style lang="scss">

</style>
