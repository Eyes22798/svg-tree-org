import { PluginFunction } from "vue"
import TreeOrg from './tree.vue'
export const CustomTreeOrg  = TreeOrg

const install: PluginFunction<null> = function (Vue) {
  Vue.component(TreeOrg.name, CustomTreeOrg)
}

export default install