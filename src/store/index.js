import Vue from 'vue'
import Vuex from 'vuex'
import map from './map'
import preferences from './preferences'

Vue.use(Vuex)

export default new Vuex.Store({
  modules: {
    map,
    preferences
  }
})
