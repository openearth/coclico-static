<template>
  <VCard ref="dataset" :class="{ open: isOpen }" class="custom-dataset-card">
    <VTabs
      v-model="tab"
      align-tabs="center"
      class="tabs"
      height="35px"
      hide-slider
    >
      <VTooltip
        :location="isOpen ? 'top' : 'bottom'"
        :text="isOpen ? 'Close this window' : 'Open Active data layers'"
      >
        <template v-slot:activator="{ props: tooltip }">
          <VTab
            :ripple="false"
            class="tab"
            height="50"
            hide-slider
            selected-class="selected-tab-style"
            v-bind="mergeProps(tooltip)"
            value="option-1"
            @click="toggle"
          >
            <custom-icon name="layers"></custom-icon>
            <span class="tab-label">Active Data Layers </span>
          </VTab>
        </template>
      </VTooltip>
      <VTooltip
        :location="isOpen ? 'top' : 'bottom'"
        :text="isOpen ? 'Close this window' : 'Open Active dashboard'"
      >
        <template v-slot:activator="{ props: tooltip }">
          <VTab
            :ripple="false"
            class="tab"
            height="50"
            hide-slider
            selected-class="selected-tab-style"
            v-bind="mergeProps(tooltip)"
            value="option-2"
            @click="toggle"
          >
            <custom-icon name="dashboard"></custom-icon>
            <span class="tab-label">Dashboard</span>
          </VTab>
        </template>
      </VTooltip>
    </VTabs>

    <VTabsWindow :key="isOpen" v-model="tab" class="pa-0" style="width: 500px">
      <VTabsWindowItem class="window-item" value="option-1">
        <active-dataset-tab />
      </VTabsWindowItem>
      <VTabsWindowItem class="window-item" value="option-2">
        <dashboard-tab />
      </VTabsWindowItem>
    </VTabsWindow>
  </VCard>
</template>
<script setup>
import ActiveDatasetTab from "./ActiveDatasetTab.vue";
import DashboardTab from "./DashboardTab.vue";
import CustomIcon from "./CustomIcon.vue";
import { computed, mergeProps, ref, watch } from "vue";
import { useTour } from "@/lib/useTour";
import { useStore } from "vuex";

const store = useStore();

const isOpen = ref(false);
const tab = ref("option-1");

const activeDatasets = computed(() =>
  [...store.getters["datasets/activeDatasets"]].filter(
    (dataset) => !dataset?.keywords?.includes("Background Layers"),
  ),
);
const graphs = computed(() => store.getters["dashboard/graphs"]);

watch(tab, () => {
  open();
});
watch(graphs, (newVals, prevVals) => {
  if (prevVals.length === 0 && newVals.length > 0) {
    open();
  }
  if (newVals.length === 0 && activeDatasets.value.length === 0) {
    close();
  }
  if (newVals.length === 0 && activeDatasets.value.length > 0) {
    tab.value = "option-1";
  }
});
watch(activeDatasets, (newVals, prevVals) => {
  if (prevVals.length === 0 && newVals.length > 0) {
    open();
  }
  if (newVals.length === 0 && graphs.value.length === 0) {
    close();
  }
  if (newVals.length === 0 && graphs.value.length > 0) {
    tab.value = "option-2";
  }
});

function toggle() {
  isOpen.value = !isOpen.value;
}

function open() {
  isOpen.value = true;
}

function close() {
  isOpen.value = false;
}

useTour({
  id: "dataset",
  refId: "dataset",
  title: "09/11 - Active data layers",
  description: `Once a dataset or user story is toggled on (as indicated in previous steps), it will appear on the map with the variables presented in the dropdown menus in this active data layer window. You can change the map view by selecting different combinations of variables. Each parameter contains a small description on what it entails, available through the “i”-buttons. If possible, the layer card informs you whether could click the map for more information. <br><br>
If a layer is clickable, a graph pops up once you click on an area or marked point on the map. The graph is interactive, meaning you could toggle on and off some of the lines, you can zoom as well as hover over the points to get their respective values. The solid line with the large dot represents the combination of variables you have selected on the active data layer card and hence shown on the map.`,
  index: 9,
  onTourStep: () => {
    open();
    tab.value = "option-1";
  },
});

useTour({
  id: "dashboard",
  refId: "dataset",
  title: "10/11 - Dashboard",
  description: `In case you want to save the graph, you can add it to the dashboard. Here, you can keep all the graphs that you want to store for your analysis. In this way, you could for instance compare different combinations of variables for the same area of interest, or you could compare different areas with each other, using the same variables. You can remove your graph(s) by clicking the “x”-button(s) on the top right.`,
  index: 10,
  onTourStep: () => {
    tab.value = "option-2";
  },
  onAfterTourStep: () => {
    close();
  },
});
</script>

<style lang="scss" scoped>
.custom-dataset-card {
  position: absolute;
  top: var(--drawer-block-margin);
  right: var(--drawer-inline-margin);
  border-radius: 28px 28px 28px 28px;
  transition:
    height 0.2s linear,
    border-radius 0.2s linear,
    width 0.2s linear 0.1s;
  width: 230px;
  height: 50px;
  max-height: calc(100vh - var(--drawer-block-margin) * 1.75);
  max-width: calc(100vw - var(--drawer-inline-margin) * 3 - 100px);

  .tab-label {
    margin-left: 0;
    transition: 0.1s linear;
    visibility: hidden;
    width: 0;
  }

  &.open {
    border-radius: 28px 28px 28px 0;
    height: max-content;
    width: max-content;

    .tab-label {
      visibility: visible;
      margin-left: 0.5rem;
      width: max-content;
    }

    @supports (height: calc-size(max-content, size)) {
      .tab-label {
        width: calc-size(max-content, size);
      }
      & {
        width: calc-size(max-content, size);
      }
    }
  }
}

.tabs {
  border-bottom: 1px solid hsla(0, 0%, 0%, 0.1);
}

.tab {
  width: 50%;
}

.custom-tab {
  z-index: 5;
}

.selected-tab-style {
  background-color: rgb(var(--v-theme-primary));
  border: none;
  color: rgb(var(--v-theme-white100));
}

:deep(.v-slide-group) {
  height: auto;
}

:deep(.v-slide-group__content) {
  overflow: hidden;
  max-height: max-content;
}

:deep(.v-tabs-window) {
  direction: rtl;
  resize: both;
  overflow: scroll;
  scrollbar-width: none;
  min-width: 500px;
  min-height: 260px;
  max-height: calc(100vh - var(--drawer-block-margin) * 1.75 - 50px);
  max-width: calc(100vw - var(--drawer-inline-margin) * 3 - 100px);
}

:deep(.v-window__container) {
  direction: ltr;
  height: 100%;
  flex-grow: 1;
}
.window-item {
  width: 100%;
  height: 100%;
}
</style>
