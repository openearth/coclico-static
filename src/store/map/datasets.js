import Vue from 'vue'


export default {
  state: () => ({}),
  mutations: {
    addDataset (state, dataset) {
    Vue.set(state, dataset.id, dataset)
  }
  }
}
