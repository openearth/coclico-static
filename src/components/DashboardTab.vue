<template>
  <VContainer class="dashboard">
    <VCard
      v-for="(
        {
          graphData,
          title,
          location = null,
          propertyValues = {},
          properties = {},
        },
        index
      ) in graphs"
      :key="`${graphData.id}-${formatCoords(graphData?.coords)}-${properties}`"
      class="item"
    >
      <div>
        <div class="graph-title">
          <VCardTitle>
            {{ title }}
          </VCardTitle>
          <VBtn class="close-button" flat icon @click="removeGraph(index)">
            <VIcon>mdi-close</VIcon>
          </VBtn>
        </div>
        <VCardSubtitle>
          {{ location }}
          {{ formatCoords(graphData?.coords) }}
          <small class="d-flex my-2">
            <VChip
              flat
              size="small"
              class="mr-2"
              v-for="value in Object.values(propertyValues)"
              :key="value"
            >
              {{ value }}
            </VChip>
          </small>
        </VCardSubtitle>
      </div>
      <Suspense>
        <app-chart
          :graph-data="graphData"
          :properties="properties"
          :property-values="propertyValues"
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

<script setup>
import { computed } from "vue";
import { useStore } from "vuex";
import { formatCoords } from "@/lib/location";
import AppChart from "@/components/AppChart.vue";

const store = useStore();
const graphs = computed(() => store.getters["dashboard/graphs"]);
const removeGraph = (index) => {
  store.dispatch("dashboard/removeGraph", index);
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
  min-width: 500px;
  max-width: 510px;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  gap: 5px;
  height: max-content;
  box-shadow: 1px -1px 2px 0 hsla(0 0% 0% / 10%);
}

.close-button {
  max-height: 36px;
  color: rgb(var(--v-theme-grey80));
}

.graph-title {
  display: flex;
  justify-content: space-between;
}

.graph-title > .v-card-title {
  flex: 0 1 auto;
  padding-bottom: 0;
}
</style>
