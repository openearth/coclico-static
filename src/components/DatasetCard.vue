<template>
  <v-card width="450px" height="397px" class="custom-dataset-card">
    <v-tabs v-model="tab" grow hide-slider class="pa-2" height="35px">
      <v-tab
        value="option-1"
        hide-slider
        rounded="xl"
        :ripple="false"
        selected-class="selected-tab-style"
        class="mr-2"
      >
        <custom-icon name="layers" class="pr-1 mr-1"></custom-icon> Active Data
        Layers
      </v-tab>
      <v-tab
        value="option-2"
        hide-slider
        rounded="xl"
        :ripple="false"
        selected-class="selected-tab-style"
        class="mr-2"
      >
        <custom-icon name="dashboard" class="pr-1 mr-1"></custom-icon>Dashboard
      </v-tab>
    </v-tabs>
    <div v-if="!activeDatasets.length" class="text-center mx-16">
      <p class="font-weight-black">No data layers have been selected.</p>
      <p class="mt-4">
        Explore data categories and activate data layers from the left hand-side
        navigation bar.
      </p>
    </div>

    <v-window v-model="tab" v-else>
      <v-window-item value="option-1">
        <active-dataset-tab :datasets="activeDatasets" />
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
      tab: "option-1",
      sliderValue: 0,
    };
  },
  computed: {
    ...mapGetters("map", ["activeDatasets"]),
  },
  methods: {},
};
</script>

<style lang="scss" scoped>
.custom-dataset-card {
  position: absolute;
  top: 30px;
  right: 50px;
  border-radius: 28px 28px 28px 28px;
}
.custom-tab {
  z-index: 5;
}
.selected-tab-style {
  background-color: rgb(var(--v-theme-primary));
  border: none;
  color: rgb(var(--v-theme-white100));
}

::v-deep .v-slide-group {
  height: auto;
}
</style>
