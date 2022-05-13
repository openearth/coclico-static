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
            v-for="data in selectedDatasets"
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
  import { mapGetters, mapActions, mapMutations } from 'vuex'
  import moment from 'moment'
  import _ from 'lodash'
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

  const getStyle = (colors = {}) => ({
    backgroundColor: colors.background,
    textStyle: {
      color: colors.textColor
    },
    xAxis: {
      axisLine: {
        lineStyle: {
          color: colors.textColor
        }
      }
    },
    yAxis: {
      axisLine: {
        lineStyle: {
          color: colors.textColor
        }
      },
      splitLine: {
        lineStyle: {
          color: colors.formBase
        }
      }
    }
  })

  const baseOptions = {
    tooltip: {
      trigger: 'axis',
      axisPointer: {
        type: 'shadow'
      },
      backgroundColor: 'rgba(50,50,50,0.7)',
      textStyle: {
        color: '#fff'
      }
    },
    grid: {
      show: true,
      top: 30,
      bottom: 50,
      right: 20,
      left: 90
    },
    dataZoom: [
      {
        type: 'inside',
        realtime: true
      }
    ],
    textStyle: {
      fontFamily: 'Helvetica'
    },
    xAxis: {
      splitLine: {
        show: true
      }
    },
    yAxis: {
      type: 'value',
      axisLabel: {
        fontSize: 14
      },
      nameLocation: 'middle',
      nameGap: 55,
      nameTextStyle: {
        fontSize: 14,
        fontFamily: 'Helvetica'
      }
    }
  }

  export default {
    name:'LocationIds',
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
      ...mapGetters([ 'selectedPointData', 'selectedDatasets' ]),
      option () {
        //   const option = {
        //     xAxis: {
        //       type: 'category',
        //       data: _.get(this.selectedPointData, 'data.category')
        //     },
        //     yAxis: {
        //       type: 'value'
        //     },
        //     series: _.get(this.selectedPointData, 'data.series')
        //   }
        //   console.log(option)
        //   return option
        // }
        console.log(this.selectedPointData, _.get(this.selectedPointData, 'data.series'))
        // console.log(this.selectedPointData.data.series)
        const dataOptions = {
          series: _.get(this.selectedPointData, 'data.series'),
          yAxis: {
            name: 'test'
          },
          xAxis: {
            type: 'category',
            data: _.get(this.selectedPointData, 'data.category')
          },
        }
        const theme = getStyle(this.colors)
        const result = _.merge(dataOptions, baseOptions)
        return result
      }
    },
    data () {
      return {
        expandedDatasets: []
      }
    },
    mounted () {
      this.updateLocationPanel()
      this.expandedDatasets = [...Array(this.selectedDatasets.length).keys()]
    },
    methods: {
      ...mapActions([ 'storeActiveDatasetIds', 'loadPointDataForLocation' ]),
      ...mapMutations([ 'setActiveDatasetIds' ]),
      updateLocationPanel () {
        this.loadPointDataForLocation()
      },
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
