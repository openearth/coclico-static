<template>
  <app-shell>
    <mapbox-map
      slot="map"
      :access-token="accessToken"
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

