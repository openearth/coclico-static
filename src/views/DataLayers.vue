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
        clickable
        @click="showTimeseries"
      />
    </mapbox-map>
    <router-view />
  </div>
</template>

<script>
  import { MapboxMap } from '@deltares/vue-components'
  import DataLayersCard from '@/components/DataLayersCard.vue'
  import { mapGetters, mapActions } from 'vuex'

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
    },
    methods: {
      ...mapActions([ 'loadDatasets', 'loadPointDataForLocation' ]),
      mapPanTo (event, duration) {
        const { clientWidth } = event.target.getCanvas()

        // the timeseries panel is max 600px wide otherwise the half of the screen
        const visibleMapWidth =
          clientWidth > 1200 ? (clientWidth - 600) * 0.25 : (clientWidth / 2) * 0.5
        const targetLocation = event.target.unproject({
          x: event.point.x - visibleMapWidth,
          y: event.point.y
        })
        event.target.panTo(targetLocation, { duration })
      },
      showTimeseries (event) {
        this.mapPanTo(event, 500)

        const features = event.target.queryRenderedFeatures(event.point)
        console.log(features, event)
        this.loadPointDataForLocation()
      },
    }
  }
</script>

<style scoped>
.data-layers {
  width: 100%;
  height: 100%;
}
</style>
