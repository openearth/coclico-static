<template>
  <v-card flat class="scrollable-card">
    <v-card
      flat
      v-for="(graph, index) in graphs"
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
        :graph-data="graph.data"
      />

      <flood-extent-graph
        v-else-if="graph.type === 'floodExtentGraph'"
        style="z-index: -1"
        :graph-data="graph.data"
      />
      <line-chart-zarr
        v-else-if="graph.type === 'lineChartZarr'"
        style="z-index: -1"
        :graph-data="graph.data"
      />
    </v-card>
    <v-card flat> </v-card>
  </v-card>
</template>

<script>
import { mapGetters, mapActions } from "vuex";
import SeaLevelGraph from "./ChartComponents/SeaLevelGraph.vue";
import FloodExtentGraph from "./ChartComponents/FloodExtentGraph.vue";
import LineChartZarr from "./ChartComponents/LineChartZarr.vue";

export default {
  components: {
    SeaLevelGraph,
    FloodExtentGraph,
    LineChartZarr,
  },
  computed: {
    ...mapGetters("dashboard", ["graphs"]),
  },
  methods: {
    ...mapActions("dashboard", ["removeGraph"]),
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
