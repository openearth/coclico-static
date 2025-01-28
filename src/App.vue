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
    ...mapActions("datasets", ["loadDatasets"]),
  },

  mounted() {
    this.loadDatasets();
  },
};
</script>
