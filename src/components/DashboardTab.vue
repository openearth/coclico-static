<template>
  <v-card flat class="scrollable-card">
    <v-card
      flat
      v-for="(graphData, index) in graphs"
      :key="index"
      class="ma-3"
      style="height: 350px"
    >
      <v-col class="column-right">
        <v-btn icon flat class="close-button" @click="removeGraph(index)">
          <v-icon>mdi-close</v-icon>
        </v-btn>
      </v-col>
      <component
        :is="graphComponents[graphData.graphType]"
        :graph-data="graphData"
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
