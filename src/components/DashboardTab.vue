<template>
  <VContainer class="dashboard">
    <VCard
      v-for="({ graphData, title }, index) in graphs"
      :key="`${graphData.id}-card-${index}`"
      class="item"
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
        <VBtn class="close-button" flat icon @click="removeGraph(index)">
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
          <VProgressCircular :size="50" color="primary" indeterminate />
        </template>
      </Suspense>
    </VCard>
    <div v-if="!graphs.length" class="empty text-center mx-16 py-4">
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
  </VContainer>
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

.dashboard {
  display: flex;
  flex-wrap: wrap;
  justify-content: flex-start;
  align-items: flex-start;
  margin: 0;
  overflow: visible;
  height: 100%;
  width: 100%;
  max-width: none;
  padding: 0;
  max-height: max-content;
  gap: 1px;
}

.item {
  padding: 5px 10px;
  min-width: 450px;
  max-width: 510px;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  gap: 5px;
  height: max-content;
  box-shadow: 1px -1px 2px 0 hsla(0 0% 0% / 10%);
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
