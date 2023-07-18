<template>
    <g
      :collapse="collapse"
      :id="node.id"
    >
      <rect
        :x="node.xStart" :y="node.yStart" :width="node.width" :height="node.height" rx="2"
        class="node-rect"
        fill="white" stroke="#ddd" stroke-width="1"
      ></rect>
      <g>
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
        :node="child"
        :treeDirection="child.treeDirection"
        :key="child.id"
        :style="{ display: node.close ? 'none' : '' }"
      >
      </tree-node>
      <g id="node-line" :close="String(node.close)">
        <path v-if="node.parentNode" key="line2" :d="line2Dth" fill="none" :stroke="lineColor" :stroke-width="lineWidth" />
        <path v-if="node.parentNode && node.prevNode" key="line1" :d="line1Dth" fill="none" :stroke="lineColor" :stroke-width="lineWidth" />
        <path v-if="node.children && node.children.length > 0" key="lineChild" :d="linesChildDth" fill="none" :stroke="lineColor" :stroke-width="lineWidth" />

        <circle
          v-if="node.children && node.children.length > 0"
          :cx="node.treeDirection === 'vertical' ? collaspeVerticalStartY : middle"
          :cy="node.treeDirection === 'vertical' ? verticalMiddle : collaspeStartY"
          :r="collapseSize"
          fill="white"
          :stroke="lineColor"
          :stroke-width="lineWidth"
          style="cursor: pointer"
          @click="handleCollapse"
        />

        <text
          v-if="node.children && node.children.length > 0"
          :x="node.treeDirection === 'vertical' ? collaspeVerticalStartY : middle"
          :y="node.treeDirection === 'vertical' ? verticalMiddle : collaspeStartY"
          :font-size="12"
          :fill="lineColor"
          text-anchor="middle"
          dominant-baseline="middle"
          style="cursor: pointer"
          @click="handleCollapse"
        >{{ node.close ? '+' : '-' }}</text>
      </g>
    </g>
</template>

<script lang="ts">
import { defineComponent, ref, PropType, computed, toRefs, onMounted, watch } from '@vue/composition-api'
import type { Node } from './type'

const paddingSize = 5;                     // 一个节点的padding值
const line1 = 30;                          //  父子节点间距（上方）
const line2 = 80;                          //  父子节点间距（下方）
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
    collapseSize: {
      type: Number,
      default: 6
    },
    treeDirection: {
      type: String as PropType<'horizontal' | 'vertical'>,
      default: 'horizontal'
    }
  },
  setup(props) {
    const { node, fontSize, letterSpacing } = toRefs(props)
    const middle = computed(() => node.value.xStart + node.value.width / 2) // 中间位置
    const verticalMiddle = computed(() => node.value.yStart + node.value.height / 2)
    const childNodes = computed(() => {
      const childs = props.node.children
      return childs
    })

    // 设置节点文本
    const nodeText = ref<Array<string>>([])
    const setNodeText = () => {
      if (!node.value.name) return

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
    const startY = ref(node.value.yStart + paddingSize + fontSize.value)
    const startX = ref(node.value.xStart + fontSize.value)
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
        const startYParent = parent.yStart + parent.height + line1
        const verticalStartParent = node.value.xStart - line2
        line2Dth.value = node.value.treeDirection === 'vertical'
          ? `M ${verticalStartParent} ${verticalMiddle.value} L ${node.value.xStart} ${verticalMiddle.value} z`
          : `M ${middle.value} ${startYParent} L ${middle.value} ${node.value.yStart} z`

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

      collaspeStartY.value = node.value.yStart + node.value.height + line1
      collaspeVerticalStartY.value = node.value.xStart + node.value.width + line1
      linesChildDth.value = node.value.treeDirection === 'vertical'
        ? `M ${node.value.xStart + node.value.width} ${verticalMiddle.value} L ${collaspeVerticalStartY.value} ${verticalMiddle.value} z`
        : `M ${middle.value} ${node.value.yStart + node.value.height} L ${middle.value} ${collaspeStartY.value} z`
    }

    const handleCollapse = () => {
      node.value.close = !node.value.close
    }

    watch(() => props.treeDirection, (val) => {
      setNodeText()
      createLine()
    })

    onMounted(() => {
      setNodeText()
      createLine()
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
      childNodes
    }
  }
})
</script>

<style lang="scss">

</style>
