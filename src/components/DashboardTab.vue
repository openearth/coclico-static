<template>
  <VCard flat class="card">
    <VCard
      flat
      v-for="({ graphData, title }, index) in graphs"
      :key="index"
      class="ma-3 item"
    >
      <div class="graph-title">
        <VCardTitle>
          {{ title }}
          <br />
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
      <Suspense>
        <component
          :is="graphComponents[graphData.graphType]"
          :graph-data="graphData"
          style="height: 300px"
        />
        <template #fallback>
          <VProgressCircular indeterminate color="primary" :size="50" />
        </template>
      </Suspense>
    </VCard>
    <div v-if="!graphs.length" class="empty text-center mx-16 pb-4">
      <p class="font-weight-black">
        No data or graph has have been added to the dashboard.
      </p>
      <p class="mt-4">
        <span class="d-block">
          Explore data categories and activate data layers from the left
          hand-side navigation bar.
        </span>
        <span class="d-block">
          Add data to the dashboard by clicking
          <span class="font-weight-bold">"add to dashboard"</span>
          when viewing a graph
        </span>
      </p>
    </div>
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
    ...mapGetters("dashboard", ["graphs"]),
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
.empty {
  max-width: 50ch;
}
.card {
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
}
.item {
  max-width: 400px;
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
