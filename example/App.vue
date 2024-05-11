<template>
  <div class="root">
    <div style="display: flex;gap: 8px;height: 50px;align-items: center;padding: 0 16px;">
      <button class="bn54" @click="handleClick">
        <span class="bn54span">转换方向</span>
      </button>

      <button class="bn54" @click="hanldeZoom(0)">
        <span class="bn54span">缩小</span>
      </button>

      <button class="bn54" @click="hanldeZoom(1)">
        <span class="bn54span">增大</span>
      </button>

      <button class="bn54" @click="handleChangeCenter()">
        <span class="bn54span">切换居中</span>
      </button>

      <button class="bn54" @click="handleCollapseable()">
        <span class="bn54span">展开收起</span>
      </button>

      <button class="bn54" @click="handleChangeDec()">
        <span class="bn54span">装饰器</span>
      </button>

      <div style="position:relative; display:inline-block">
        <button type="button" class="bn54 btn btn-secondary herramienta">
          <span class="bn54span">边颜色</span>
        </button>
        <input @change="handleColorChange" type="color" :value="lineColor" style="opacity:0; position:absolute; left:0;top:0;width:100%"/>
      </div>
    </div>

    <div class="container">
      <svg-tree-org
        ref="treeOrgRef"
        :data="data"
        :direction="direction"
        :zoomable="zoomable"
        :treeCenter="treeCenter"
        :collapsable="collapsable"
        :lineColor="lineColor"
        :lineWidth="lineWidth"
        :lineArrow="lineArrow"
        :lineCircle="lineCircle"
        :defaultScale="1"
        :nodeWidth="100"
        :nodeHeight="24"
        :rootNodesep="100"
        :marginSize="5"
        :linkNodeData="linkData"
        @line-mouseover="handleLineMouseover"
      >
        <template #node="slotProps">
          <div v-if="slotProps.node.parent_id === 0" class="node-item" style="display: flex;align-items: center;gap: 8px;">
            <img style="width: 24px;" src="./img/home.svg" alt="">
            <p style="display: inline-block;color: #999;margin: 0;font-size: 12px;">{{ slotProps.node.id }}Desktop</p>
          </div>

          <div v-else class="node-item" style="display: flex;align-items: center;gap: 8px;">
            <img style="width: 24px;" src="./img/a-cartfull.svg" alt="">
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

    const zoomable = ref(true)

    const hanldeZoom = (r: number) => {
      if (r > 0) {
        treeOrgRef.value?.zoomEnlarge()
      } else {
        treeOrgRef.value?.zoomNarrow()
      }
    }

    const treeCenter = ref(true)
    const handleChangeCenter = () => {
      treeCenter.value = !treeCenter.value
      treeOrgRef.value?.setAxis()
    }

    const collapsable = ref(true)
    const handleCollapseable = () => {
      collapsable.value = !collapsable.value
    }

    const lineColor = ref('#115DDB')
    const handleColorChange = (e: Event, value: string) => {
      lineColor.value = (e.target as any)?.value

      console.log(lineColor.value)
    }

    const handleChangeDec = () => {
      lineArrow.value.open = !lineArrow.value.open
      // lineCircle.value.open = !lineCircle.value.open
    }

    return {
      lineColor,
      handleColorChange,
      treeOrgRef,
      lineArrow,
      lineCircle,
      data,
      direction,
      zoomable,
      linkData,
      lineWidth,
      treeCenter,
      handleChangeCenter,
      handleClick,
      handleLineMouseover,
      hanldeZoom,
      collapsable,
      handleCollapseable,
      handleChangeDec,
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
  height: 100vh;
  overflow: hidden;
  display: flex;
  justify-content: center;
  flex-direction: column;
}

.container {
  width: 100%;
  flex: 1;
  margin: 16px;
  margin-top: 0;
  box-shadow: rgba(100, 100, 111, 0.2) 0px 7px 29px 0px;
}

.node-item {
  width: 100%;height: 100%;text-align: center;
  // transform: rotate3d(1, 1, 1, 308deg);
}

.bn54 {
  position: relative;
  outline: none;
  text-decoration: none;
  border-radius: 35px;
  display: flex;
  justify-content: center;
  align-items: center;
  cursor: pointer;
  text-transform: uppercase;
  height: 30px;
  width: 90px;
  opacity: 1;
  background-color: #ffffff;
  border: 1px solid rgba(0, 0, 0, 0.6);
}

.bn54 .bn54span {
  font-family: Verdana, Geneva, Tahoma, sans-serif;
  color: #000000;
  font-size: 12px;
  font-weight: 500;
  letter-spacing: 0.7px;
}

.bn54:hover {
  animation: bn54rotate 0.7s ease-in-out both;
}

.bn54:hover .bn54span {
  animation: bn54storm 0.7s ease-in-out both;
  animation-delay: 0.06s;
}

@keyframes bn54rotate {
  0% {
    transform: rotate(0deg) translate3d(0, 0, 0);
  }
  25% {
    transform: rotate(3deg) translate3d(0, 0, 0);
  }
  50% {
    transform: rotate(-3deg) translate3d(0, 0, 0);
  }
  75% {
    transform: rotate(1deg) translate3d(0, 0, 0);
  }
  100% {
    transform: rotate(0deg) translate3d(0, 0, 0);
  }
}

@keyframes bn54storm {
  0% {
    transform: translate3d(0, 0, 0) translateZ(0);
  }
  25% {
    transform: translate3d(4px, 0, 0) translateZ(0);
  }
  50% {
    transform: translate3d(-3px, 0, 0) translateZ(0);
  }
  75% {
    transform: translate3d(2px, 0, 0) translateZ(0);
  }
  100% {
    transform: translate3d(0, 0, 0) translateZ(0);
  }
}
</style>
