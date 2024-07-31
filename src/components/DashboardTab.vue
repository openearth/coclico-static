<template>
  <v-card flat class="ma-3" style="height: 200px">
    <generic-graph v-if="graphInDashboard" />
  </v-card>
  <v-card flat>
    <v-card-text>
      Morbi nec metus. Suspendisse faucibus, nunc et pellentesque egestas, lacus
      ante convallis tellus, vitae iaculis lacus elit id tortor. Sed mollis,
      eros et ultrices tempus, mauris ipsum aliquam libero, non adipiscing dolor
      urna a orci. Curabitur ligula sapien, tincidunt non, euismod vitae,
      posuere imperdiet, leo. Nunc sed turpis.
    </v-card-text>
  </v-card>
</template>

<script>
import { mapGetters } from "vuex";
import GenericGraph from "@/components/GenericGraph.vue";

export default {
  components: {
    GenericGraph,
  },
  computed: {
    ...mapGetters("map", ["graphInDashboard"]),
  },
};
</script>
