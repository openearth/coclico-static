<template>
  <app-shell>
    <mapbox-map
      slot="map"
      :access-token="accessToken"
      mapboxStyle="mapbox://styles/global-data-viewer/cjtslsula05as1fppvrh7n4rv"
    >
      <v-mapbox-layer
          :options="testLayer"
        />
    </mapbox-map>
  </app-shell>
</template>

<script>
import { MapboxMap } from '@deltares/vue-components' 
import AppShell from  './components/AppShell'

import { mapState, mapActions } from 'vuex'

export default {
  
  components: {
    AppShell,
    MapboxMap,
  },
  data: () => ({
    accessToken: process.env.VUE_APP_MAPBOX_TOKEN,
  }),
  computed: { 
    ...mapState('map', ['testLayer'])
  },
  methods: { 
    ...mapActions('map', ['loadDatasets'])
  },
  mounted() { 
    this.loadDatasets()
  }
};
</script>

