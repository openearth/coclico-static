<template>
  <VCard flat class="scrollable-card">
    <VCard
      flat
      v-for="({ graphData, title }, index) in activeGraphs"
      :key="index"
      class="ma-3"
    >
      <div class="graph-title">
        <VCardTitle>
          {{ title }}<br />
          <small>
            (
            {{ roundCoords(graphData.coords.lat) }},
            {{ roundCoords(graphData.coords.lng) }}
            )
          </small>
        </VCardTitle>
        <VBtn icon flat class="close-button" @click="removeGraph(index)">
          <VIcon>mdi-close</VIcon>
        </VBtn>
      </div>
      <component
        :is="graphComponents[graphData.graphType]"
        :graph-data="graphData"
        style="height: 300px"
      />
    </VCard>
    <VCard flat> </VCard>
  </VCard>
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
