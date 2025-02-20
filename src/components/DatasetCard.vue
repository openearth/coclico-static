<template>
  <VCard class="custom-dataset-card" :class="{ open: isOpen }">
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
<script>
import ActiveDatasetTab from "./ActiveDatasetTab.vue";
import DashboardTab from "./DashboardTab.vue";
import CustomIcon from "./CustomIcon.vue";
import { mapGetters } from "vuex";
import { mergeProps } from "vue";

export default {
  components: {
    ActiveDatasetTab,
    DashboardTab,
    CustomIcon,
  },
  data() {
    return {
      isOpen: false,
      tab: "option-1",
      sliderValue: 0,
    };
  },
  computed: {
    ...mapGetters("dashboard", ["graphs"]),
    ...mapGetters("datasets", ["activeDatasets", "activeDatasetProperties"]),
  },
  watch: {
    tab() {
      this.open();
    },
    graphs(newVals, prevVals) {
      if (prevVals.length === 0 && newVals.length > 0) {
        this.open();
      }
      if (newVals.length === 0 && this.activeDatasets.length === 0) {
        this.close();
      }
      if (newVals.length === 0 && this.activeDatasets.length > 0) {
        this.tab = "option-1";
      }
    },
    activeDatasets(newVals, prevVals) {
      if (prevVals.length === 0 && newVals.length > 0) {
        this.open();
      }
      if (newVals.length === 0 && this.graphs.length === 0) {
        this.close();
      }
      if (newVals.length === 0 && this.graphs.length > 0) {
        this.tab = "option-2";
      }
    },
  },
  methods: {
    mergeProps,
    toggle() {
      this.isOpen = !this.isOpen;
    },
    open() {
      this.isOpen = true;
    },
    close() {
      this.isOpen = false;
    },
  },
};
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
