<template>
  <app-shell>
    <mapbox-map
      slot="map"
      :access-token="accessToken"
      mapboxStyle="mapbox://styles/global-data-viewer/cjtss3jfb05w71fmra13u4qqm"
    >
      <v-mapbox-layer
          v-if="activeMapboxLayers"
          :options="activeMapboxLayers"
          :key="activeMapboxLayers.id"
        />
    </mapbox-map>
  </app-shell>
</template>

<script>
import { MapboxMap } from '@deltares/vue-components' 
import AppShell from  './components/AppShell'

import { mapGetters, mapActions } from 'vuex'

export default {
  
  components: {
    AppShell,
    MapboxMap,
  },
  data: () => ({
    accessToken: process.env.VUE_APP_MAPBOX_TOKEN,
  }),
  computed: {
    ...mapGetters(['activeMapboxLayers'])
  },
  methods: { 
    ...mapActions({ loadDatasets: 'loadDatasets' }),
  },
  mounted() { 
    this.loadDatasets()
  }
};
</script>

