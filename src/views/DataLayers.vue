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
        @click="selectLocation"
      />
      <v-mapbox-layer
        :options="selectedPointLayer"
        key="selectedPoint"
      />
    </mapbox-map>
    <router-view />
  </div>
</template>

<script>
  import { MapboxMap } from '@deltares/vue-components'
  import DataLayersCard from '@/components/DataLayersCard.vue'
  import { mapGetters, mapActions, mapMutations } from 'vuex'
  import _ from 'lodash'

  import getColors from '@/lib/styling/colors'
  const color = getColors('coclico')
  export default {
    name:'DataLayers',
    data: () => ({
      accessToken: process.env.VUE_APP_MAPBOX_TOKEN,
      selectedPointLayer: {
        id: 'selected_point',
        type: 'circle',
        source: {
          type: 'geojson',
          data: {
            type: 'Point',
            coordinates: []
          }
        },
        paint: {
          'circle-stroke-width': 8,
          'circle-color': color.white100,
          'circle-stroke-color': color.blue60,
          'circle-stroke-opacity': 0.6
        }
      }
    }),
    components: {
      DataLayersCard,
      MapboxMap
    },
    computed: {
      ...mapGetters([ 'availableDatasets', 'activeMapboxLayers', 'selectedPointData' ]),
    },
    methods: {
      ...mapMutations([ 'setSelectedPointData' ]),
      ...mapActions([ 'loadDatasets', 'loadPointDataForLocation' ]),
      isEmpty(obj) {
        return _.isEmpty(obj)
      },
      selectLocation(e) {
        this.showTimeseries(e)
        const {properties} = e.features[0]
        const {locationId} = properties
        console.log(properties, locationId)
        if (locationId) {
          const params = this.$route.params
          params.locationId = locationId
          this.$router.push({ path: `/data/${params.datasetIds}/${params.locationId}`, params })
        }
      },
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
        this.setSelectedPointData(features[0])
        const selectedPoint = event.target.getSource('selected_point')
        selectedPoint.setData(features[0]._geometry)
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
