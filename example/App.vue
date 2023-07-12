<template>
  <div>
    <button @click="handleClick">
      转换方向
    </button>
    <svg-tree-org :data="data" :direction="direction" />
  </div>
</template>

<script lang="ts">
import { defineComponent, ref } from '@vue/composition-api'
import SvgTreeOrg from '../src/index.vue'
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
