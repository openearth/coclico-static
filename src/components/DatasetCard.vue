<template>
  <!-- TODO:
        * Add custom icon compponent 
        * Load correct icons
        * Add colors based on the color library
        * Replace option-1 or 2 in values
 -->
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
        <v-icon start> mdi-lock </v-icon>Active Data Layers</v-tab
      >
      <v-tab
        value="option-2"
        hide-slider
        rounded="xl"
        :ripple="false"
        selected-class="selected-tab-style"
        class="mr-2"
      >
        <v-icon start> mdi-lock </v-icon>Dashboard</v-tab
      >
    </v-tabs>
    <v-window v-model="tab">
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

export default {
  components: {
    ActiveDatasetTab,
    DashboardTab,
  },

  data() {
    return {
      tab: "option-1",
      sliderValue: 0,
    };
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
  background-color: #068b95;
  border: none;
  color: white;
}

::v-deep .v-slide-group {
  height: 80px;
}
</style>
