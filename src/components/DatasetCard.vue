<template>
  <v-card width="450px" height="397px" class="custom-dataset-card">
    <v-tabs v-model="tab" grow hide-slider class="pa-2" height="35px">
      <!-- set as color primary the correct colors see old coclico implementation -->
      <v-tab
        value="option-1"
        hide-slider
        rounded="lg"
        :ripple="false"
        selected-class="selected-tab-style"
        class="mr-2"
      >
        <v-icon start> mdi-lock </v-icon>Active Data Layers</v-tab
      >
      <v-tab
        value="option-2"
        hide-slider
        rounded="lg"
        :ripple="false"
        selected-class="test"
        class="mr-2"
      >
        <v-icon start> mdi-lock </v-icon>Dashboard</v-tab
      >
    </v-tabs>
    <v-window v-model="tab">
      <v-window-item value="option-1">
        <v-card flat>
          <v-card-text>
            <p>
              Sed aliquam ultrices mauris. Donec posuere vulputate arcu. Morbi
              ac felis. Etiam feugiat lorem non metus. Sed a libero.
            </p>
          </v-card-text>
        </v-card>
      </v-window-item>
      <v-window-item value="option-2">
        <v-card flat>
          <v-card-text>
            Morbi nec metus. Suspendisse faucibus, nunc et pellentesque egestas,
            lacus ante convallis tellus, vitae iaculis lacus elit id tortor. Sed
            mollis, eros et ultrices tempus, mauris ipsum aliquam libero, non
            adipiscing dolor urna a orci. Curabitur ligula sapien, tincidunt
            non, euismod vitae, posuere imperdiet, leo. Nunc sed turpis.
          </v-card-text>
        </v-card>
      </v-window-item>
    </v-window>
  </v-card>
</template>
<script>
export default {
  data() {
    return {
      tab: "option-1",
      sliderValue: 0,
    };
  },
  methods: {
    selectMapElement() {
      // Implement the functionality to select an element on the map
    },
  },
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
