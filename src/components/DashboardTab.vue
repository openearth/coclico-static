<template>
  <v-card flat class="scrollable-card">
    <v-card
      flat
      v-for="(graph, index) in graphsInDashboard"
      :key="index"
      class="ma-3"
      style="height: 350px"
    >
      <v-col class="column-right">
        <v-btn icon flat class="close-button" @click="removeGraph(index)">
          <v-icon>mdi-close</v-icon>
        </v-btn>
      </v-col>
      <sea-level-graph
        v-if="graph.type === 'seaLevelGraph'"
        style="z-index: -1"
        :sea-level-rise-data="graph.data"
      />

      <flood-extent-graph
        v-else-if="graph.type === 'floodExtentGraph'"
        style="z-index: -1"
      />
    </v-card>
    <v-card flat> </v-card>
  </v-card>
</template>

<script>
import { mapGetters, mapActions } from "vuex";
import SeaLevelGraph from "./ChartComponents/SeaLevelGraph.vue";
import FloodExtentGraph from "./ChartComponents/FloodExtentGraph.vue";

export default {
  components: {
    SeaLevelGraph,
    FloodExtentGraph,
  },
  computed: {
    ...mapGetters("map", ["graphsInDashboard"]),
  },
  methods: {
    ...mapActions("map", ["removeGraphFromDashboard"]),
    removeGraph(index) {
      this.removeGraphFromDashboard(index);
    },
  },
};
</script>

<style scoped>
.scrollable-card {
  max-height: 300px;
  overflow-y: visible;
}
.close-button {
  color: rgb(var(--v-theme-grey80));
}
.column-right {
  display: flex;
  justify-content: flex-end;
  margin-bottom: -47px;
  z-index: 0;
}
</style>
