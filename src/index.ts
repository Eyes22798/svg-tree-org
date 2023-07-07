import { PluginFunction } from "vue"
import CustomButtonCom from './index.vue'
export const CustomButton  = CustomButtonCom

const install: PluginFunction<null> = function (Vue) {
  Vue.component(CustomButtonCom.name, CustomButton)
}

export default install