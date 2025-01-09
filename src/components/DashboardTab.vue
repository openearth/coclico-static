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
import { mapGetters, mapActions } from "vuex";
import { graphTypes } from "../store/graphs";
import SeaLevelGraph from "./ChartComponents/SeaLevelGraph.vue";
import FloodExtentGraph from "./ChartComponents/FloodExtentGraph.vue";
import LineChartZarr from "./ChartComponents/LineChartZarr.vue";

export default {
  components: {
    SeaLevelGraph,
    FloodExtentGraph,
    LineChartZarr,
  },
  data() {
    return {
      graphTypes,
      graphComponents: {
        [graphTypes.FLOOD_EXTEND]: markRaw(FloodExtentGraph),
        [graphTypes.SEA_LEVEL_RISE]: markRaw(SeaLevelGraph),
        [graphTypes.LINE_CHART]: markRaw(LineChartZarr),
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
