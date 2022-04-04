import Vue from 'vue'
import './registerServiceWorker'
import router from './router'
import store from './store'
import vuetify from './plugins/vuetify'
import './plugins/composition-api'
import './plugins/vuelidate'

import '@/css/main.css'
import '@/css/helpers.css'
import '@/css/markdown.css'
import '@/css/typography.css'

import App from './App.vue'

Vue.config.productionTip = false

new Vue({
  router,
  store,
  vuetify,
  render: h => h(App)
}).$mount('#app')
