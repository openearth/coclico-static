<template>
  <div class="app-chart__container" v-if="graphData">
    <component
      :is="graphComponents[graphData.graphType]"
      :graph-data="graphData"
    />
  </div>
  <div v-else class="app-chart__loader">
    <v-progress-circular
      indeterminate
      color="primary"
      :size="50"
    ></v-progress-circular>
  </div>
</template>
<script>
import { markRaw } from "vue";
import { mapGetters } from "vuex";
import { graphTypes } from "../store/graphs";
import FloodExtentGraph from "./ChartComponents/FloodExtentGraph.vue";
import SeaLevelGraph from "./ChartComponents/SeaLevelGraph.vue";
import LineChartZarr from "./ChartComponents/LineChartZarr.vue";

export default {
  components: {
    FloodExtentGraph,
    SeaLevelGraph,
    LineChartZarr,
  },
  data() {
    return {
      graphComponents: {
        [graphTypes.FLOOD_EXTEND]: markRaw(FloodExtentGraph),
        [graphTypes.SEA_LEVEL_RISE]: markRaw(SeaLevelGraph),
        [graphTypes.LINE_CHART]: markRaw(LineChartZarr),
      },
    };
  },
  computed: {
    ...mapGetters("graphs", ["graphData"]),
    ...mapGetters("map", ["activeClickableDataset"]),
  },
};
</script>

<style lang="scss">
.app-chart__loader {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  height: 400px;
}
.app-chart__container {
  width: 25vw;
  height: 25vh;
}
</style>
