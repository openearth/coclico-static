import Vue from 'vue'
import Vuex from 'vuex'
import map from './map'
import preferences from './preferences'
import stories from './stories'

Vue.use(Vuex)

export default new Vuex.Store({
  modules: {
    map,
    stories,
    preferences
  }
})
