<template>
  <div
    ref="treeBox"
    class="tree-box"
    @wheel="zoom"
    @mousedown="mousedown"
    @mouseup="mouseup"
    @mousemove="drag"
  >
    <svg
      ref="svgRef"
      xmlns:xlink="http://www.w3.org/1999/xlink"
      draggable="true"
      :width="treeWidth"
      :height="treeHeight"
      :viewBox="viewBox"
      version="1.1"
      style="display: block; margin: auto;"
    >
      <tree-node
        v-for="node in treeData"
        :lineColor="lineColor"
        :treeDirection="direction"
        :node="node"
        :key="node.id"
        :hasSlot="$scopedSlots.node"
        :lineArrow="lineArrow"
        :lineCircle="lineCircle"
        :collapsable="collapsable"
      >
        <template #node="slotProps">
          <slot name="node" :node="slotProps.node" />
        </template>
      </tree-node>
    </svg>
  </div>

</template>

<script lang="ts">
import { defineComponent, ref, onMounted, PropType, watch, computed } from '@vue/composition-api'
import type { Data, Node } from './type'
import { TreeNode } from './core/tree-node'
import treeNode from './node.vue'
import { transformData2Tree } from './utils'
import cloneDeep from 'lodash.clonedeep'

export default defineComponent({
  name: 'SvgTreeOrg',
  components: { treeNode },
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
    collapsable: {
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
    marginSize: { // 层间距
      type: Number,
      default: 10
    }
  },
  setup(props, { emit }) {
    const svgRef = ref<SVGSVGElement | null>(null)
    const treeBox = ref<HTMLElement | null>(null)
    const treeData = ref<Array<Node>>([])
    let currentTreeData: unknown = []

    const setData = (data: Array<Data>) => {
      if (!data || data.length === 0) {
        treeData.value = []
        return
      }

      treeData.value = transformData2Tree(cloneDeep(data)) as unknown as Array<Node>  // 深拷贝原始数据
      currentTreeData = transformData2Tree(cloneDeep(data)) as unknown as Array<Node>
    }

    const treeWidth = ref(0)
    const treeHeight = ref(0)
    const viewBox = ref('0 0 0 0')
    // 设置节点坐标和svg宽高
    const setAxis = () => {
      const levelXStart: Record<number, number> = {}  // 寻找同级节点的离当前线最近的x坐标，防止节点重叠
			const levelYStart: Record<number, number> = {}  // 寻找同级节点的离当前线最近的y坐标，防止节点重叠

      let xStart = 0,
        svgWidth = 0,
        svgHeight = 0
      let yStart = props.direction === 'vertical' ? 0 : 0

      const func = (arr: Array<Node>, parent?: Node) => {
        if (!arr || arr.length <= 0) return

        const y = parent ? (parent.yStart + parent.line1 + parent.line2 + parent.height) : 0  // line1 line2 参见 node.js
        const x = parent ? (parent.xStart + parent.line1 + parent.line2 + parent.width) : 0   // line1 line2 参见 node.js

        arr.forEach((v: Node, i) => {
          const node = new TreeNode(v)
          node.width = props.nodeWidth
          node.height = props.nodeHeight
          node.marginSize = props.marginSize
          node.yStart = y
          if (props.direction === 'vertical') node.xStart = x
          node.parentNode = parent
          node.prevNode = arr[i - 1]
          node.toolsHandle = props.toolsHandle  // 操作按钮
          node.treeDirection = props.direction  // 树的方向
          node.close = false
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

      func(currentTreeData as unknown as Array<Node>)

      treeData.value = currentTreeData as unknown as Array<Node>

      const boxWidth = treeBox.value && window.getComputedStyle(treeBox.value).width
      const boxHeight = treeBox.value && window.getComputedStyle(treeBox.value).height

      treeWidth.value = Number(boxWidth?.split('px')[0])
      treeHeight.value = Number(boxHeight?.split('px')[0])

      const xMiddle = (treeWidth.value - svgWidth) / 2 > 0 ? (treeWidth.value - svgWidth) / 2 : 0
      const yMiddle = (treeHeight.value - svgHeight) / 2 > 0 ? (treeHeight.value - svgHeight) / 2 : 0
      viewBox.value = `${-xMiddle} ${-yMiddle} ${treeWidth.value} ${treeHeight.value}`
    }

    // client与svg坐标相互转换
    const svgMatrixTransform = (e: DragEvent | WheelEvent) => {
      const startViewBox = viewBox.value.split(' ').map(n => parseFloat(n))
      const startClient = {
        x: e.clientX,
        y: e.clientY
      }

      // 将client坐标转换为svg坐标
      let newSVGPoint = svgRef.value?.createSVGPoint()
      let CTM = svgRef.value?.getScreenCTM()
      if (newSVGPoint) {
        newSVGPoint.x = startClient.x
        newSVGPoint.y = startClient.y
      }

      const startSVGPoint = newSVGPoint?.matrixTransform(CTM?.inverse()) // 转换后的svg坐标

      //	将一开始的 viewPort Client 利用新的 CTM 转换为新的svg坐标
      CTM = svgRef.value?.getScreenCTM()
      let moveToSVGPoint = newSVGPoint?.matrixTransform(CTM?.inverse())

      return {
        startViewBox,
        newSVGPoint,
        CTM,
        startSVGPoint,
        moveToSVGPoint
      }
    }

    // 缩放功能
    const zoom = (e: WheelEvent) => {
      const { startViewBox, startSVGPoint, moveToSVGPoint } = svgMatrixTransform(e)

      // 设置缩放
      let r
      if (e.deltaY > 0) {
        r = 1.1
      } else if (e.deltaY < 0) {
        r = 0.9
      } else {
        r = 1
      }
      viewBox.value = `${startViewBox[0]} ${startViewBox[1]} ${startViewBox[2] * r} ${startViewBox[3] * r}`

      //	计算偏移量
      let delta = {
        dx: startSVGPoint && moveToSVGPoint ? startSVGPoint.x - moveToSVGPoint.x : 0,
        dy: startSVGPoint && moveToSVGPoint ? startSVGPoint.y - moveToSVGPoint.y : 0
      }

      // 设置最终viewport位置
      let middleViewBox = viewBox.value.split(' ').map(n => parseFloat(n))
      let moveBackViewBox = `${middleViewBox[0] + delta.dx} ${middleViewBox[1] + delta.dy} ${middleViewBox[2]} ${middleViewBox[3]}`
      viewBox.value = moveBackViewBox

      emit('zoom', e, viewBox.value)
    }

    // 拖拽相关功能
    const dragging = ref(false)
    const mousedown = () => {
      dragging.value = true
    }
    const mouseup = () => {
      dragging.value = false
    }
    const drag = (e: DragEvent) => {
      if (!dragging.value || !props.draggable) return
      const startViewBox = viewBox.value.split(' ').map(n => parseFloat(n))
      const startClient = {
        x: e.clientX,
        y: e.clientY
      }

      // 将client坐标转换为svg坐标
      let newSVGPoint = svgRef.value?.createSVGPoint()
      let CTM = svgRef.value?.getScreenCTM()
      if (newSVGPoint) {
        newSVGPoint.x = startClient.x
        newSVGPoint.y = startClient.y
      }

      const startSVGPoint = newSVGPoint?.matrixTransform(CTM?.inverse()) // 转换后的svg坐标

      let moveToClient = {
        x: e.clientX + e.movementX,
        y: e.clientY + e.movementY
      }

      newSVGPoint = svgRef.value?.createSVGPoint()
      CTM = svgRef.value?.getScreenCTM()
      if (newSVGPoint) {
        newSVGPoint.x = moveToClient.x
        newSVGPoint.y = moveToClient.y
      }

      let moveToSVGPoint = newSVGPoint?.matrixTransform(CTM?.inverse())

      if (startSVGPoint && moveToSVGPoint) {
        let delta = {
          dx: startSVGPoint.x - moveToSVGPoint.x,
          dy: startSVGPoint.y - moveToSVGPoint.y
        }

        let moveToViewBox = `${startViewBox[0] + delta.dx} ${startViewBox[1] + delta.dy} ${startViewBox[2]} ${startViewBox[3]}`

        viewBox.value = moveToViewBox
      }
    }

    watch(() => props.direction, (val: 'horizontal' | 'vertical') => {
      setAxis()
    })

    onMounted(() => {
      if (props.data) {
        setData(props.data)
        setAxis()
      }
    })

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
      mouseup
    }
  }
})
</script>

<style lang="scss">
.tree-box {
  width: 100%;
  height: 100%;
  overflow: hidden;
}
</style>
