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
          v-if="node.nodeText.length === 1"
          fill="black" stroke="none"
          :font-size="fontSize"
          :letter-spacing="letterSpacing"
          text-anchor="middle" dominant-baseline="middle"
          :x="middle"
          :y="starY"
        >{{ nodeText[0] }}</text>
        <text v-else></text>
      </g>
    </g>
</template>

<script lang="ts">
import { defineComponent, ref, PropType, computed, toRefs, onMounted } from '@vue/composition-api'
import type { Data, DrawT, Node } from './type'

const lineColor = '#ddd';               	 // 线条颜色
const lineWidth = 1;                    	 // 线条宽度
const collapseSize = 6;                    // 折叠点圆圈尺寸

const fontSize = 14;                       // 节点文本字号
const paddingSize = 5;                     // 一个节点的padding值
const marginSize = 40;                     // 一个节点的右边距
const line1 = 30;                          //  父子节点间距（上方）
const line2 = 80;                          //  父子节点间距（下方）
const maxWidth = 200;                      // 节点矩形框最大宽度
const maxHeight = 200;                     // 节点矩形框最大高度
const lineHeight = 10;                     // 文字行间距
const letterSpacing = 3;                   // 文字字符间距
const toolsHeight = 10

export default defineComponent({
  name: 'TreeNode',
  props: {
    node: {
      type: Object as PropType<Node>,
      default: () => []
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
    }
  },
  setup(props) {
    const { node, fontSize, letterSpacing } = toRefs(props)
    const middle = computed(() => node.value.xStart + node.value.width / 2) // 中间位置
    const verticalMiddle = computed(() => node.value.yStart + node.value.height / 2)

    onMounted(() => {
      setNodeText()
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
    const createText = () => {

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


    }

    return {
      middle,
      verticalMiddle,
      startY,
      startX,
      nodeText,
    }
  }
})
</script>

<style lang="scss">

</style>
