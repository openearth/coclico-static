<template>
  <app-shell>
    <mapbox-map
      slot="map"
      :access-token="accessToken"
      mapboxStyle="mapbox://styles/global-data-viewer/cjtss3jfb05w71fmra13u4qqm"
    >
    </mapbox-map>
  </app-shell>
</template>

<script>
import { MapboxMap } from '@deltares/vue-components' 
import AppShell from  './components/AppShell'

export default {
  
  components: {
    AppShell,
    MapboxMap
  },
  data: () => ({
    accessToken: process.env.VUE_APP_MAPBOX_TOKEN,
  }),
};
</script>

