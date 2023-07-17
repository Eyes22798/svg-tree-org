<template>
  <svg
    xmlns:xlink="http://www.w3.org/1999/xlink"
    draggable="true"
    class="radial-progress-bar"
    :width="treeWidth"
    :height="treeHeight"
    version="1.1"
  >
    <g
      v-for="node in treeData"
      :key="node.id"
      :collapse="collapse"
      :id="node.id"
    >

    </g>
  </svg>
</template>

<script lang="ts">
import { defineComponent, ref, onMounted, PropType, computed } from '@vue/composition-api'
import type { Data, DrawT, Node } from './type'
import { makeSVG } from './utils/index'
import { TreeNode } from './tree-node'

export default defineComponent({
  props: {
    hasCreate: {
      type: Boolean,
      default: false
    },
    data: {
      type: Array as PropType<Array<Data>>,
      default: () => []
    },
    direction: {
      type: String as PropType<'horizontal' | 'vertical'>,
      default: 'horizontal'
    },
    collapse: {
      type: Boolean,
      default: true
    },
    $box: {
      type: Object as PropType<HTMLElement | null>,
      default: null
    },
    $svg: {
      type: Object as PropType<SVGElement | null>,
      default: null
    },
    toolsHandle:{
      type: Function,
      default: () => (null)
    }
  },
  setup(props) {
    const treeData = ref<Array<Node>>([])
    const rootNode = computed(() => props.data.length > 0 ? props.data[0] : { id: 'root' })

    onMounted(() => {
      if (props.data) setData(props.data)
    })

    const setData = (data: Array<Data>) => {
      if (!data || data.length === 0) {
        treeData.value = []
        return
      }
      treeData.value = JSON.parse(JSON.stringify(data))  // 深拷贝原始数据
    }

    const treeWidth = ref(0)
    const treeHeight = ref(0)
    // 设置节点坐标和svg宽高
    const setAxis = () => {
      const levelXStart: Record<number, number> = {},  // 寻找同级节点的离当前线最近的x坐标，防止节点重叠
			levelYStart: Record<number, number> = {}

      let xStart = 100,
        svgWidth = 0,
        svgHeight = 0
      let yStart = props.direction === 'vertical' ? 100 : 0

      const func = (arr: Array<Node>, parent?: Node) => {
        if (!arr || arr.length <= 0) return

        const y = parent ? (parent.yStart + parent.line1 + parent.line2 + parent.height) : 0  // line1 line2 参见 node.js
        const x = parent ? (parent.xStart + parent.line1 + parent.line2 + parent.width) : 0   // line1 line2 参见 node.js

        arr.forEach((v: TreeNode, i) => {
          const node = new TreeNode(v)
          node.yStart = y
          if (props.direction === 'vertical') node.xStart = x
          node.parentNode = parent
          node.prevNode = arr[i - 1]
          node.toolsHandle = props.toolsHandle  // 操作按钮
          node.treeDirection = props.direction  // 树的方向
          arr[i] = node

          if (levelXStart[v.level] > xStart) xStart = levelXStart[v.level]
          if (levelYStart[v.level] > yStart) yStart = levelYStart[v.level]

          if (node.children && node.children.length) {
            const minXStart = xStart
            const minYStart = yStart
            func(node.children, node)

            const end = node.children[node.children.length - 1], first = node.children[0]

            const nowXStart = (end.xStart + end.width - first.xStart - node.width) / 2 + first.xStart // 计算子节点中最左和最右节点的中间位置
            const nowYStart = (end.yStart + end.height - first.yStart - node.height) / 2 + first.yStart // 计算子节点中最上和最下节点的中间位置

            const nowLimit = props.direction === 'vertical' ? nowYStart < minYStart : nowXStart < minXStart
            if (nowLimit) { // 可能有重叠块，重新计算一下位置
              const num = props.direction === 'vertical' ? (minYStart - nowYStart) : (minXStart - nowXStart)
              const resetAxis = (childs: Array<Node>) => {
                for (const v of childs) {
                  if (props.direction === 'vertical') {
                    v.yStart += num
                    const x = v.yStart + v.height + v.marginSize
                    if (levelYStart[v.level] < x) levelYStart[v.level] = x
                  }
                  if (props.direction === 'horizontal') {
                    v.xStart += num
                    const x = v.xStart + v.width + v.marginSize
                    if (levelXStart[v.level] < x) levelXStart[v.level] = x
                  }

                  if (v.children && v.children.length) resetAxis(v.children)
                }
              }
              resetAxis(node.children)

              if (props.direction === 'vertical') {
                yStart = minYStart
              } else {
                xStart = nowXStart
              }
            } else {
              if (props.direction === 'vertical') {
                yStart = nowYStart
              } else {
                xStart = nowXStart
              }
            }
            if (props.direction === 'vertical') {
              node.yStart = yStart
              if (arr[i + 1]) yStart += node.height + node.marginSize
            } else {
              node.xStart = xStart
              if (arr[i + 1]) xStart += node.width + node.marginSize
            }
          } else {
            if (props.direction === 'vertical') {
              node.yStart = yStart
              yStart += node.height + node.marginSize
            } else {
              node.xStart = xStart
              xStart += node.width + node.marginSize
            }
          }
          if (props.direction === 'vertical') {
            levelYStart[v.level] = yStart
          } else {
            levelXStart[v.level] = xStart
          }
        })

        // 画布大小设置
        if (y > svgHeight) svgHeight = y
        if (x > svgWidth && props.direction === 'vertical') svgWidth = x
        if (xStart > svgWidth) svgWidth = xStart
        if (yStart > svgHeight && props.direction === 'vertical') svgHeight = yStart
      }

      func(treeData.value as unknown as Array<Node>)

      treeWidth.value = svgWidth + 300
      treeHeight.value = svgHeight + 300
    }


    return {
      treeData,
      treeWidth,
      treeHeight
    }
  }
})
</script>

<style lang="scss">

</style>
