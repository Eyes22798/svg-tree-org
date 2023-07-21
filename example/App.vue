<template>
  <div>
    <button @click="handleClick" style="display: block;">
      转换方向
    </button>
    <svg-tree-org :data="data" :direction="direction">
      <!-- <template #node="slotProps">
        <div style="width: 100%;height: 100%;text-align: center;">
          <img style="width: 56px;" src="./img/terminal.png" alt="">
          <p style="display: block;color: #999;margin: 0;font-size: 12px;">{{ slotProps.node.id }}Desktop</p>
        </div>
      </template> -->
    </svg-tree-org>
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

    return {
      data,
      direction,
      handleClick
    }
  }
})
</script>

<style lang="scss">

</style>
