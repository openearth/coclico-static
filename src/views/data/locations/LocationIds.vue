<template>
  <v-navigation-drawer
    class="pl-16"
    permanent
    absolute
    width="40vw"
    color="background"
  >
    <v-container class="graph-menu d-flex flex-column">
      <h2 class="h2">
        Location id: {{ $route.params.locationId }}
      </h2>
      <v-btn
        icon
        class="close-button"
        @click="close"
      >
        <v-icon>mdi-close</v-icon>
      </v-btn>
      <div
        class="flex-grow-1 py-3 scrollbar"
        align-space-between
      >
        <v-expansion-panels
          v-if="true"
          flat
          accordion
          multiple
          v-model="expandedDatasets"
          color="background"
        >
          <v-expansion-panel
            v-for="data in datasets"
            :key="data.id"
          >
            <v-expansion-panel-header
              class="h4"
              color="background"
              dark
            >
              {{ data.datasetName }}
            </v-expansion-panel-header>
            <v-expansion-panel-content color="background">
              <v-container class="pa-0">
                <v-col
                  cols="12"
                  class="graph-line pa-0"
                >
                  <v-chart
                    :ref="title"
                    :option="option"
                    :autoresize="true"
                    class="graph-line__chart"
                  />
                </v-col>
              </v-container>
            </v-expansion-panel-content>
          </v-expansion-panel>
        </v-expansion-panels>
        <template v-else>
          <p>No data available.</p>
        </template>
      </div>
      <div class="flex-shrink-1 bodytext-xs disclaimer">
        Global datasets are generated with great care but may locally contain inaccuracies. See the
        dataset descriptions for more information.
      </div>
    </v-container>
  </v-navigation-drawer>
</template>

<script>
  import VChart from 'vue-echarts'
  import { mapGetters, mapActions } from 'vuex'
  import moment from 'moment'
  // import ECharts modules manually to reduce bundle size
  import {
    SVGRenderer,
    CanvasRenderer
  } from 'echarts/renderers'

  import {
    LineChart,
    ScatterChart,
    LinesChart
  } from 'echarts/charts'

  import {
    GridComponent,
    TooltipComponent,
    MarkLineComponent,
    MarkPointComponent,
    DataZoomComponent,
    TimelineComponent
  } from 'echarts/components'

  import { use } from 'echarts/core'

  use([
    ScatterChart,
    CanvasRenderer,
    LineChart,
    GridComponent,
    TooltipComponent,
    MarkLineComponent,
    MarkPointComponent,
    DataZoomComponent,
    TimelineComponent,
    LinesChart
  ])

  use([ CanvasRenderer ])
  use([ SVGRenderer ])
  export default {
    name:'GraphSideMenu',
    components: {
      VChart
    },
    watch: {
      '$route.params.datasetIds': {
        handler () {
          this.storeActiveDatasetIds(this.$route.params.datasetIds)
        },
        deep: true
      }
    },
    computed: {
      ...mapGetters([ 'selectedPointData', 'datasets' ]),
      locations () {
        // TODO: is it always locationId?
        return `Location id: ${this.selectedPointData.properties.locationId}`
      },
      option () {
        return {
          xAxis: {
            type: 'category',
            data: this.selectedPointData.data.category
          },
          yAxis: {
            type: 'value'
          },
          series: this.selectedPointData.data.series
        }
      }
    },
    data () {
      return {
        expandedDatasets: []
      }
    },
    methods: {
      ...mapActions([ 'storeActiveDatasetIds' ]),
      close () {
        this.$router.push({
          path: `/data/${this.$route.params.datasetIds}`,
          params: { datasetIds: this.$route.params.datasetIds }
        })
      },
      addLineToGraph (graphSerie) {
        console.log(graphSerie)
        let data = graphSerie.map((col, i) => [ this.category[i], col ])
        // Make sure that all data is in chronological order to plot it correctly
        data = data.sort((colA, colB) => {
          return moment(colA[0]) - moment(colB[0])
        })

        return {
          type: 'line',
          showAllSymbol: true,
          data,
          itemStyle: {
            normal: {
              borderWidth: 1
            }
          }
        }
      },
      addAreaToGraph (serie, label, color = null, legend = false) {
        let data = serie.map((col, i) => [ this.category[i], col ])
        // Make sure that all data is in chronological order to plot it correctly
        data = data.sort((colA, colB) => {
          return moment(colA[0]) - moment(colB[0])
        })

        const series = {
          name: label,
          data: data,
          type: 'line',
          symbol: 'none',
          lineStyle: {
            opacity: 0
          },
          z: -1,
          color: color
        }
        if (color) {
          series.areaStyle = {
            color: color,
            origin: 'start',
            opacity: 0.3
          }
        } else {
          series.areaStyle = {
            color: '#202020', // TODO: get from custom style
            opacity: 1,
            origin: 'start'
          }
        }
        return series
      }
    }
  }
</script>

<style>
.graph-menu {
  height: 100%;
}

.graph-line__aspect-ratio--image {
  height: 1200px;
}

.graph-line__image {
  height: 1200px;
  max-width: 100%;
  background-repeat: no-repeat;
  background-size: 50% 100%;
}

.graph-line {
  position: relative;
  min-height: 400px;
}

.graph-line__chart {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 85%;
}

.disclaimer {
  text-align: center;
}
</style>
