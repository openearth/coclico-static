<template>
  <VCard ref="tour" class="custom-dataset-card" :class="{ open: isOpen }">
    <VTabs v-model="tab" hide-slider class="tabs" height="35px">
      <VTooltip
        :location="isOpen ? 'top' : 'bottom'"
        :text="isOpen ? 'Close this window' : 'Open Active data layers'"
      >
        <template v-slot:activator="{ props: tooltip }">
          <VTab
            v-bind="mergeProps(tooltip)"
            value="option-1"
            hide-slider
            :ripple="false"
            height="50"
            class="tab"
            selected-class="selected-tab-style"
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
            v-bind="mergeProps(tooltip)"
            value="option-2"
            hide-slider
            :ripple="false"
            height="50"
            class="tab"
            selected-class="selected-tab-style"
            @click="toggle"
          >
            <custom-icon name="dashboard"></custom-icon>
            <span class="tab-label">Dashboard</span>
          </VTab>
        </template>
      </VTooltip>
    </VTabs>

    <VWindow v-model="tab" class="pt-4">
      <VWindowItem value="option-1">
        <active-dataset-tab />
      </VWindowItem>
      <VWindowItem value="option-2">
        <dashboard-tab />
      </VWindowItem>
    </VWindow>
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

const activeDatasets = computed(() => store.getters["datasets/activeDatasets"]);
const graphs = computed(() => store.getters["dashboard/graphs"]);

useTour({
  id: "dataset",
  refId: "tour",
  title: "Active Data Layers & Dashboard",
  description: `This window displays the active data layers and allows you to view saved graphs on the dashboard.\n\n
  It opens and closes either automatically or by pressing one of the tabs.`,
  onTourStep: () => {
    open();
  },
  onAfterTourStep: () => {
    close();
  },
});

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
</script>

<style lang="scss" scoped>
.custom-dataset-card {
  position: absolute;
  top: var(--drawer-block-margin);
  right: var(--drawer-inline-margin);
  border-radius: 28px 28px 28px 28px;
  max-height: 397px;
  transition:
    height 0.2s linear,
    width 0.2s linear 0.1s;
  width: 230px;
  height: 50px;
  .tab-label {
    margin-left: 0;
    transition: 0.1s linear;
    visibility: hidden;
    width: 0;
  }
  &.open {
    @supports (height: calc-size(max-content, size)) {
      .tab-label {
        visibility: visible;
        margin-left: 0.5rem;
        width: calc-size(max-content, size);
      }
      & {
        width: calc-size(max-content, min(size + 5vw, 500px));
        height: max-content;
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
</style>
