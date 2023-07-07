<template>
  <div>
    <el-button>
      click me
    </el-button>
    <CustomButton text="测试" />
  </div>
</template>

<script lang="ts">
import { defineComponent } from '@vue/composition-api'
import CustomButton from '../src/index.vue'

export default defineComponent({
  components: {
    CustomButton,
  },
})
</script>

<style lang="scss">

</style>
