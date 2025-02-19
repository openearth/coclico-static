<template>
  <VApp>
    <VMain>
      <router-view />
    </VMain>
  </VApp>
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
