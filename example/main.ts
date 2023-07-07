import Vue from 'vue'
import App from './App.vue'
import vueCompositionApi from '@vue/composition-api'
import ElementUI from 'element-ui'
import 'element-ui/lib/theme-chalk/index.css'

Vue.use(ElementUI, {
  size: 'small'
})

Vue.config.productionTip = false
Vue.use(vueCompositionApi)

new Vue({
  render: h => h(App)
}).$mount('#app')