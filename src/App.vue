<template>
  <app-shell>
    <mapbox-map
      slot="map"
      :access-token="accessToken"
      mapboxStyle="mapbox://styles/global-data-viewer/cjtss3jfb05w71fmra13u4qqm"
    >
      <v-mapbox-layer
          v-if="activeMapboxLayers && acceptedLegal"
          :options="activeMapboxLayers"
          :key="activeMapboxLayers.id"
        />
    </mapbox-map>
    <legal-dialog @accepted="onLegalAccepted" />
  </app-shell>
</template>

<script>
import { MapboxMap } from '@deltares/vue-components' 
import AppShell from  './components/AppShell'
import LegalDialog from "@/components/legal-dialog";

import { mapGetters, mapActions } from 'vuex'

export default {
  
  components: {
    AppShell,
    MapboxMap,
    LegalDialog,
  },
  data: () => ({
    accessToken: process.env.VUE_APP_MAPBOX_TOKEN,
    acceptedLegal: false,
  }),
  computed: {
    ...mapGetters(['activeMapboxLayers'])
  },
  methods: { 
    ...mapActions({ loadDatasets: 'loadDatasets' }),
    onLegalAccepted() {
      this.acceptedLegal = true;
    },
  },
  mounted() { 
    this.loadDatasets()
  }
};
</script>

