import { toast } from "vue-sonner";
import { formatCoords } from "@/lib/location";

export default {
  namespaced: true,

  state: {
    graphs: [],
  },

  getters: {
    graphs: (state) => {
      return state.graphs;
    },
    activeGraphs: (state, getters, rootState, rootGetters) => {
      const datasetIds = rootGetters["datasets/activeDatasetIds"];
      return state.graphs.filter(({ graphData: { datasetId } }) =>
        datasetIds.includes(datasetId),
      );
    },
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
    addGraph({ commit, state }, graph) {
      if (
        !state.graphs.some(
          (g) =>
            g.graphData.id === graph.graphData.id &&
            formatCoords(g.graphData.coords) ===
              formatCoords(graph.graphData.coords) &&
            g.properties === graph.properties,
        )
      ) {
        commit("ADD_GRAPH", graph);
      } else {
        toast.warning("An identical graph is already saved to the dashboard.");
      }
    },
    removeGraph({ commit }, index) {
      commit("REMOVE_GRAPH", index);
    },
  },
};
