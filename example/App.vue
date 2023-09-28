<template>
  <div class="root">
    <div style="display: flex;gap: 8px;">
      <button @click="handleClick">
        转换方向
      </button>

      <button @click="hanldeZoom(0)">缩小</button>
      <button @click="hanldeZoom(1)">增大</button>
    </div>

    <div class="container">
      <svg-tree-org
        ref="treeOrgRef"
        :data="data"
        :direction="direction"
        :zoomable="zoomable"
        lineColor="#ccc"
        :lineWidth="lineWidth"
        :lineArrow="lineArrow"
        :lineCircle="lineCircle"
        :treeCenter="true"
        :collapsable="false"
        :defaultScale="1"
        :nodeWidth="100"
        :nodeHeight="24"
        :rootNodesep="150"
        :marginSize="0"
        :linkNodeData="linkData"
        @line-mouseover="handleLineMouseover"
      >
        <template #node="slotProps">
          <div class="node-item" style="display: flex;align-items: center;gap: 8px;">
            <img style="width: 24px;" src="./img/group.svg" alt="">
            <p style="display: inline-block;color: #999;margin: 0;font-size: 12px;">{{ slotProps.node.id }}Desktop</p>
          </div>
        </template>
      </svg-tree-org>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, ref } from '@vue/composition-api'
import SvgTreeOrg from '../src/tree.vue'
import { originData, linkNodeData } from './data/index'

export default defineComponent({
  components: {
    SvgTreeOrg,
  },
  setup() {
    const treeOrgRef = ref<InstanceType<typeof SvgTreeOrg> | null>(null)
    const direction = ref('vertical')
    const data = ref(originData)
    const linkData = ref(linkNodeData)
    const handleClick = () => {
      if (direction.value === 'vertical') {
        direction.value = 'horizontal'
      } else {
        direction.value = 'vertical'
      }
    }

    const lineWidth = ref(1)

    const lineArrow = ref({
      open: false,
      markerWidth: 5,
      markerHeight: 8,
      refX: 0,
      refY: 4,
      margin: 0
    })

    const lineCircle = ref({
      open: false,
      markerWidth: 8,
      markerHeight: 8,
      refX: 4,
      refY: 0,
      r: 3,
      strokeWidth: 2,
      margin: 4
    })

    const handleLineMouseover = (node: any) => {
      console.log('node', node)
    }

    const zoomable = ref(true)

    const hanldeZoom = (r: number) => {
      if (r > 0) {
        treeOrgRef.value?.zoomEnlarge()
      } else {
        treeOrgRef.value?.zoomNarrow()
      }
    }

    return {
      treeOrgRef,
      lineArrow,
      lineCircle,
      data,
      direction,
      zoomable,
      linkData,
      lineWidth,
      handleClick,
      handleLineMouseover,
      hanldeZoom,
    }
  }
})
</script>

<style lang="scss">
* {
  margin: 0;
  padding: 0;
}
.root {
  height: 100%;
  display: flex;
  justify-content: center;
  flex-direction: column;
  gap: 10px;
  padding: 16px;
}

.container {
  width: 100%;
  height: 800px;
  border: 1px solid #ddd;
}

.node-item {
  width: 100%;height: 100%;text-align: center;
  // transform: rotate3d(1, 1, 1, 308deg);
}
</style>
