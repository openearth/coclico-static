<template>
  <v-card flat class="scrollable-card">
    <v-card
      flat
      v-for="({ graphData, title }, index) in activeGraphs"
      :key="index"
      class="ma-3"
    >
      <div class="graph-title">
        <v-card-title>
          {{ title }}<br />
          <small>
            (
            {{ roundCoords(graphData.coords.lat) }},
            {{ roundCoords(graphData.coords.lng) }}
            )
          </small>
        </v-card-title>
        <v-btn icon flat class="close-button" @click="removeGraph(index)">
          <v-icon>mdi-close</v-icon>
        </v-btn>
      </div>
      <component
        :is="graphComponents[graphData.graphType]"
        :graph-data="graphData"
        style="height: 300px"
      />
    </v-card>
    <v-card flat> </v-card>
  </v-card>
</template>

<script>
import { markRaw } from "vue";
import { mapActions, mapGetters } from "vuex";
import SeaLevelGraph from "@/components/ChartComponents/SeaLevelGraph.vue";
import FloodExtentGraph from "@/components/ChartComponents/FloodExtentGraph.vue";
import LineChart from "@/components/ChartComponents/LineChart.vue";
import { GRAPH_TYPES } from "@/lib/graphs";
import PieChart from "@/components/ChartComponents/PieChart.vue";

export default {
  components: {
    SeaLevelGraph,
    FloodExtentGraph,
    LineChart,
  },
  data() {
    return {
      open: false,
      GRAPH_TYPES,
      graphComponents: {
        [GRAPH_TYPES.FLOOD_EXTEND]: markRaw(FloodExtentGraph),
        [GRAPH_TYPES.SEA_LEVEL_RISE]: markRaw(SeaLevelGraph),
        [GRAPH_TYPES.LINE_CHART]: markRaw(LineChart),
        [GRAPH_TYPES.PIE_CHART]: markRaw(PieChart),
      },
    };
  },
  computed: {
    ...mapGetters("dashboard", ["activeGraphs"]),
  },
  methods: {
    ...mapActions("dashboard", ["removeGraph"]),
    roundCoords(number) {
      return Number(number).toFixed(3);
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
.graph-title {
  display: flex;
  justify-content: space-between;
}
.graph-title > .v-card-title {
  flex: 0 1 auto;
}
</style>
