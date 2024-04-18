<template>
  <v-app>
    <v-main>
      <router-view />
    </v-main>
  </v-app>
</template>

<script>
import { mapActions } from "vuex";
export default {
  name: "App",
  methods: {
    ...mapActions("map", ["loadDatasets"]),
  },

  mounted() {
    console.log("app has been mounted");
    this.loadDatasets();
  },
};
</script>
