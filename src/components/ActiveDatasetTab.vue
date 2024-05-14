<template>
  <v-card flat>
    <v-container>
      <v-row>
        <v-col cols="6">
          <v-select
            v-model="varA"
            :items="['AR5']"
            variant="outlined"
          ></v-select>
        </v-col>
        <v-col cols="6">
          <v-select v-model="varB" :items="['5']" variant="outlined"></v-select>
        </v-col>
      </v-row>
      <v-row>
        <v-col cols="12">
          <v-select
            v-model="varC"
            :items="['Historical']"
            variant="outlined"
          ></v-select>
        </v-col>
      </v-row>
      <v-row>
        <v-col cols="12">
          <p class="text-style">
            Select an element in the map for specific location analysis.
          </p>
        </v-col>
      </v-row>
    </v-container>
  </v-card>
</template>
<script>
export default {
  props: {
    datasets: {
      type: Array,
      default: () => [],
    },
  },
  data() {
    return {
      varA: "AR5",
      varB: 5,
      varC: "Historical",
    };
  },
};
</script>
<style>
.text-style {
  background: #f0f0f0;
}
</style>
