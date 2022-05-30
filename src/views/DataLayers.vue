<template>
  <div class="data-layers">
    <data-layers-card :datasets="availableDatasets" />
    <mapbox-map
      slot="map"
      :access-token="accessToken"
      :center="[5.2913, 48.1326]"
      :zoom="4"
      mapbox-style="mapbox://styles/global-data-viewer/cjtslsula05as1fppvrh7n4rv"
      @load="initializeMap"
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
        key="selectedPointLayer.id"
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
          'circle-opacity': 0,
          'circle-stroke-color': color.metallic100,
          'circle-stroke-opacity': 0.8
        }
      },
      map: {},
      mapLoaded: true,
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
      initializeMap (evt) {
        this.map = evt.target
        setTimeout(() => {
          const location = this.$route.params.locationId
          if (!location) {
            return
          }
          const features = this.map.queryRenderedFeatures()
          const feature = features.find(feat => toString(feat.properties.locationId) === toString(location))
          if (!feature) {
            return
          }
          this.updateSelectedPoint(feature.geometry)
          this.map.panTo({
            lng: feature.geometry.coordinates[0],
            lat: feature.geometry.coordinates[1]
          })
        }, 500)
      },
      isEmpty(obj) {
        return _.isEmpty(obj)
      },
      selectLocation(e) {
        this.showTimeseries(e)
        const {properties} = e.features[0]
        const {locationId} = properties
        if (locationId) {
          const params = this.$route.params
          params.locationId = locationId
          this.$router.push({ path: `/data/${params.datasetIds}/${params.locationId}`, params })
        }
      },
      mapPanTo (event, duration) {
        const { clientWidth } = this.map.getCanvas()

        // the timeseries panel is max 600px wide otherwise the half of the screen
        const visibleMapWidth =
          clientWidth > 1200 ? (clientWidth - 600) * 0.25 : (clientWidth / 2) * 0.5
        const targetLocation = this.map.unproject({
          x: event.point.x - visibleMapWidth,
          y: event.point.y
        })
        this.map.panTo(targetLocation, { duration })
      },
      showTimeseries (event) {
        this.mapPanTo(event, 500)

        const features = this.map.queryRenderedFeatures(event.point)
        this.setSelectedPointData(features[0])
        this.updateSelectedPoint(features[0].geometry)
        this.loadPointDataForLocation()
      },
      updateSelectedPoint(geometry) {
        const selectedPoint = this.map.getSource('selected_point')
        selectedPoint.setData(geometry)
      }
    }
  }
</script>

<style scoped>
.data-layers {
  width: 100%;
  height: 100%;
}
</style>
