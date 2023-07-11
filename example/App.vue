<template>
  <div>
    <button>
      click me
    </button>
    <CustomButton text="测试" />
  </div>
</template>

<script lang="ts">
import { defineComponent } from '@vue/composition-api'
import CustomButton from '../src/index.vue'
import { transformData2Tree } from '../src/utils/index'
import { originData } from '../src/data/index'

export default defineComponent({
  components: {
    CustomButton,
  },
  setup() {
    console.log(transformData2Tree(originData))
  }
})
</script>

<style lang="scss">

</style>
