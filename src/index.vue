<template>
  <div ref="box" id="box" style="width:100vw;height:100vh;overflow: auto"></div>
</template>

<script lang="ts">
import { defineComponent, onMounted, PropType, watch, ref } from '@vue/composition-api'
import { Tree } from './tree'
import { transformData2Tree } from './utils'
import type { Data } from './type'

export default defineComponent({
  name: 'SvgTreeOrg',
  props: {
    data: {
      type: Array as PropType<Array<Data>>,
      default: () => []
    },
    direction: {
      type: String as PropType<'vertical' | 'horizontal'>,
      default: 'vertical'
    }
  },
  setup(props) {
    const box = ref<HTMLElement | null>(null)
    const tree = ref<Tree>()
    onMounted(() => {
      tree.value = new Tree({
        data: transformData2Tree(props.data),
        direction: props.direction,
        $box: box.value,
        toolsHandle: () => {   // 操作按钮
          console.log(1111)
        }
      })

      tree.value.create()
    })

    watch(() => props.direction, (val) => {
      tree.value?.changeDirection(val)
    })

    return {
      box
    }
  }
})
</script>

<style lang="scss">
.node-rect:hover {
  fill: rgba(78, 194, 255, 0.16);
}

.node-tools {
  cursor: pointer;
}

svg text {
  -webkit-user-select: none;
  -moz-user-select: none;
  -khtml-user-select: none;
  -ms-user-select: none;
}
</style>
