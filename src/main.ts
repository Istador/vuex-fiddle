import Vue from 'vue'
import VueAsyncComputed from 'vue-async-computed'
import Vuex from 'vuex'
import './plugins/axios'
import App from './App.vue'
import store from './store/index'

Vue.config.productionTip = false

Vue.use(Vuex)
Vue.use(VueAsyncComputed)

new Vue({
  store,
  render: h => h(App),
}).$mount('#app')
