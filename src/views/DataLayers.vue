<template>
  <div class="data-layers">
    <data-layers-card :datasets="datasetsInActiveTheme" />
    <v-mapbox
      id="map"
      ref="map"
      :access-token="accessToken"
      :preserve-drawing-buffer="true"
      map-style="mapbox://styles/mapbox/light-v10"
    >
      <v-mapbox-layer
        v-if="activeLocationLayer"
        :key="activeLocationLayer.id"
        :options="activeLocationLayer"
        clickable
        @click="selectLocation"
      />
      <v-mapbox-layer
        v-if="activeRasterLayer"
        :key="activeRasterLayer.id"
        :options="activeRasterLayer"
      />
      <v-mapbox-layer
        :options="selectedPointLayer"
      />
      <v-mapbox-layer
        :options="selectedPolygonLayer"
      />
    </v-mapbox>
    <router-view />
  </div>
</template>

<script>
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
        type: 'circle',
        id: 'selected_point',
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
      selectedPolygonLayer: {
        type: 'line',
        id: 'selected_polygon',
        source: {
          type: 'geojson',
          data: {
            type: 'Point',
            coordinates: []
          }
        },
        paint: {
          'line-width': 8,
          'line-color': color.metallic100,
          'line-opacity': 0.8
        }
      },
      map: {},
      mapLoaded: true,
    }),
    components: {
      DataLayersCard
    },
    watch: {
      '$route.params.datasetIds': {
        handler (newValue, oldValue) {
          if (newValue !== oldValue) {
            this.clearSelection()
          }
        },
        deep: true
      }
    },
    computed: {
      ...mapGetters([ 'datasetsInActiveTheme', 'availableDatasets', 'activeLocationLayer', 'activeRasterLayer', 'selectedVectorData' ]),
    },
    mounted () {
      this.map = this.$refs.map.map
      this.map.on('load', () => {
        console.log('loaded')
        if (!this.$route.params.locationId) {
          this.map.flyTo({
            center: [ 5.2913, 48.1326 ],
            zoom: 4
          })
        }
        this.initializeMap()
      })
      console.log('loaded', this.map)
    },
    methods: {
      ...mapMutations([ 'setSelectedVectorData' ]),
      ...mapActions([ 'loadDatasets', 'loadPointDataForLocation' ]),
      initializeMap () {
        setTimeout(() => {
          const location = this.$route.params.locationId
          console.log(location)
          if (!location) {
            return
          }
          const features = this.map.queryRenderedFeatures()
          const feature = features.find(feat => { _.get(feat, 'properties.locationId', '').toString() === location.toString() })
          if (!feature) {
            return
          }
          let lng = feature.geometry.coordinates[0]
          let lat = feature.geometry.coordinates[1]
          if (feature.geometry.type !== 'Point') {
            lng = feature.geometry.coordinates[0][0][0]
            lat = feature.geometry.coordinates[0][0][1]
          }
          this.updateSelectedVector(feature.geometry)
          console.log(location, lng, lat, feature)
          this.map.panTo({
            lng,
            lat
          })
        }, 500)
      },
      isEmpty(obj) {
        return _.isEmpty(obj)
      },
      selectLocation(e) {
        this.showTimeseries(e)
        const {properties} = e.features[0]
        // TODO: all mapbox files should have a locationId
        let {locationId, id} = properties
        locationId = locationId || id
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
        this.setSelectedVectorData(features[0])
        this.clearSelection()
        this.updateSelectedVector(features[0].geometry)
        this.loadPointDataForLocation()
      },
      clearSelection() {
        const emptyGeometry = {
          type: 'Point',
          coordinates: []
        }
        this.map.getSource('selected_point').setData(emptyGeometry)
        this.map.getSource('selected_polygon').setData(emptyGeometry)
      },
      updateSelectedVector(geometry) {
        if (geometry.type === 'Point') {
          this.map.getSource('selected_point').setData(geometry)
        }
        if (geometry.type === 'Polygon' || geometry.type === 'MultiPolygon') {
          this.map.getSource('selected_polygon').setData(geometry)
        }
      }
    }
  }
</script>

<style scoped>
.data-layers {
  width: 100%;
  height: 100%;
}

#map {
  width: 100%;
  height: 100%;
}
</style>
