<template>
  <div>12312</div>
</template>

<script lang="ts">
import { defineComponent } from '@vue/composition-api'

export default defineComponent({
  name: 'CustomButton',
  props: {
    text: {
      type: String,
      default: ''
    }
  }
})
</script>

<style lang="scss">
</style>
