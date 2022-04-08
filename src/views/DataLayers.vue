<template>
  <div class="data-layers">
    <data-layers-card :datasets="availableDatasets" />
    <mapbox-map
      slot="map"
      :access-token="accessToken"
      mapbox-style="mapbox://styles/global-data-viewer/cjtslsula05as1fppvrh7n4rv"
    >
      <v-mapbox-layer
        v-if="activeMapboxLayers"
        :options="activeMapboxLayers"
        :key="activeMapboxLayers.id"
      />
    </mapbox-map>
    <router-view />
  </div>
</template>

<script>
  import { MapboxMap } from '@deltares/vue-components'
  import DataLayersCard from '@/components/DataLayersCard.vue'
  import { mapGetters } from 'vuex'

  export default {
    name:'DataLayers',
    data: () => ({
      accessToken: process.env.VUE_APP_MAPBOX_TOKEN,
    }),
    components: {
      DataLayersCard,
      MapboxMap,
    },
    computed: {
      ...mapGetters([ 'availableDatasets', 'activeMapboxLayers' ])
    }

  }
</script>

<style scoped>
.data-layers {
  width: 100%;
  height: 100%;
}
</style>
