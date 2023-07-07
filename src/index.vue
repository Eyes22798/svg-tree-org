<template>
  <Button>{{ text }}</Button>
</template>

<script lang="ts">
import { defineComponent } from '@vue/composition-api'
import { Button } from 'element-ui'

export default defineComponent({
  name: 'CustomButton',
  components: {
    Button
  },
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
