<template>
  <div class="root">
    <button @click="handleClick" style="display: block;">
      转换方向
    </button>
    <div class="container">
      <svg-tree-org
        :data="data"
        :direction="direction"
        lineColor="#115DDB"
        :lineArrow="lineArrow"
        :lineCircle="lineCircle"
        :collapsable="false"
        @line-mouseover="handleLineMouseover"
      >
        <template #node="slotProps">
          <div style="width: 100%;height: 100%;text-align: center;">
            <img style="width: 56px;" src="./img/terminal.png" alt="">
            <p style="display: block;color: #999;margin: 0;font-size: 12px;">{{ slotProps.node.id }}Desktop</p>
          </div>
        </template>
      </svg-tree-org>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, ref } from '@vue/composition-api'
import SvgTreeOrg from '../src/tree.vue'
import { originData } from './data/index'

export default defineComponent({
  components: {
    SvgTreeOrg,
  },
  setup() {
    const direction = ref('vertical')
    const data = ref(originData)
    const handleClick = () => {
      if (direction.value === 'vertical') {
        direction.value = 'horizontal'
      } else {
        direction.value = 'vertical'
      }
    }

    const lineArrow = ref({
      open: true,
      markerWidth: 5,
      markerHeight: 8,
      refX: 0,
      refY: 4,
      margin: 0
    })

    const lineCircle = ref({
      open: true,
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

    return {
      lineArrow,
      lineCircle,
      data,
      direction,
      handleClick,
      handleLineMouseover
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
</style>
