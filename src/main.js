import Vue from 'vue'
import './registerServiceWorker'
/* The vue-composition API should always being imported before all others plugins */
import './plugins/composition-api' 
import router from './router'
import store from './store'
import vuetify from './plugins/vuetify'


import '@/css/main.css'

import App from './App.vue'

Vue.config.productionTip = false

new Vue({
  router,
  store,
  vuetify,
  render: h => h(App)
}).$mount('#app')
