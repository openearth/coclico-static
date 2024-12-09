export default {
  namespaced: true,

  state: {
    graphs: [],
  },

  getters: {
    graphs: (state) => state.graphs,
  },

  mutations: {
    ADD_GRAPH(state, graph) {
      state.graphs.push(graph);
    },
    REMOVE_GRAPH(state, index) {
      state.graphs.splice(index, 1);
    },
  },

  actions: {
    addGraph({ commit }, graph) {
      commit("ADD_GRAPH", graph);
    },
    removeGraph({ commit }, index) {
      commit("REMOVE_GRAPH", index);
    },
  },
};
