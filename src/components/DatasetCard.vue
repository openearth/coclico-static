<template>
  <v-card class="custom-dataset-card" :class="{ open: isOpen }">
    <v-tabs v-model="tab" grow hide-slider class="pa-2" height="35px">
      <v-tab
        value="option-1"
        hide-slider
        rounded="xl"
        :ripple="false"
        selected-class="selected-tab-style"
        class="mr-2"
        @click="toggle"
      >
        <custom-icon name="layers" class="pr-1 mr-1"></custom-icon>
        <span class="tab-label">Active Data Layers </span>
      </v-tab>
      <v-tab
        value="option-2"
        hide-slider
        rounded="xl"
        :ripple="false"
        selected-class="selected-tab-style"
        class="mr-2"
        @click="toggle"
      >
        <custom-icon name="dashboard" class="pr-1 mr-1"></custom-icon>
        <span class="tab-label">Dashboard</span>
      </v-tab>
    </v-tabs>
    <div v-if="!activeDatasets.length" class="text-center mx-16 pb-4">
      <p class="font-weight-black">No data layers have been selected.</p>
      <p class="mt-4">
        Explore data categories and activate data layers from the left hand-side
        navigation bar.
      </p>
    </div>

    <v-window v-model="tab" v-else>
      <v-window-item value="option-1">
        <active-dataset-tab />
      </v-window-item>
      <v-window-item value="option-2">
        <dashboard-tab />
      </v-window-item>
    </v-window>
  </v-card>
</template>
<script>
import ActiveDatasetTab from "./ActiveDatasetTab.vue";
import DashboardTab from "./DashboardTab.vue";
import CustomIcon from "./CustomIcon.vue";
import { mapGetters } from "vuex";

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
    ...mapGetters("dashboard", ["activeGraphs"]),
    ...mapGetters("datasets", ["activeDatasets", "activeDatasetProperties"]),
  },
  watch: {
    tab() {
      this.open();
    },
    activeGraphs(newVals, prevVals) {
      if (prevVals.length === 0 && newVals.length > 0) {
        this.open();
      }
      if (newVals.length === 0) {
        this.close();
      }
    },
    activeDatasets(newVals, prevVals) {
      if (prevVals.length === 0 && newVals.length > 0) {
        this.open();
      }
      if (newVals.length === 0) {
        this.close();
      }
    },
  },
  methods: {
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
  top: 25px;
  right: 50px;
  border-radius: 28px 28px 28px 28px;
  max-width: 450px;
  max-height: 397px;
  transition: height 0.2s linear, width 0.2s linear 0.1s;
  width: 225px;
  height: 50px;
  .tab-label {
    transition: 0.1s linear;
    visibility: hidden;
    width: 0;
  }
  &.open {
    @supports (height: calc-size(auto, size)) {
      .tab-label {
        visibility: visible;
        width: calc-size(auto, size);
      }
      & {
        width: calc-size(auto, size);
        height: calc-size(auto, size);
      }
    }
  }
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
