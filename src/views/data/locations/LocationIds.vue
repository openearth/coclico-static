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
          v-if="selectedDatasets[0]"
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
              {{ data.id }}
            </v-expansion-panel-header>
            <v-expansion-panel-content color="background">
              <v-container class="pa-0">
                <v-col
                  cols="12"
                  class="graph-line pa-0"
                >
                  <v-chart
                    :option="data"
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
  import getColors from '@/lib/styling/colors'

  // import ECharts modules manually to reduce bundle size
  import {
    SVGRenderer,
    CanvasRenderer
  } from 'echarts/renderers'

  import {
    LineChart,
    ScatterChart,
    LinesChart,
    BarChart
  } from 'echarts/charts'

  import {
    GridComponent,
    TooltipComponent,
    MarkLineComponent,
    MarkPointComponent,
    DataZoomComponent,
    TimelineComponent,
    LegendComponent,
    ToolboxComponent
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
    LinesChart,
    LegendComponent,
    ToolboxComponent,
    BarChart
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
    //toolbox: {
    //  show: true,
    //  feature: {
    //    dataZoom: {
    //      yAxisIndex: 'none'
    //    },
    //    dataView: { readOnly: false },
    //    magicType: { type: ['line', 'bar'] },
    //    restore: {},
    //    saveAsImage: {}
    //  }
    //},
    legend: {
      top: 'horizontal'
    },
    grid: {
      show: true,
      top: 30,
      bottom: 50,
      right: 20,
      left: 50
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
        show: true,
      },
      axisLabel: {
        fontSize: 14
      },
      nameLocation: 'center',
      nameGap: 20,
      name: "-",
      nameTextStyle: {
        color: 'white',
        fontSize: 14,
        fontFamily: 'Helvetica'
      }
    },
    yAxis: {
      type: 'value',
      axisLabel: {
        fontSize: 14
      },
      nameLocation: 'center',
      name: '-',
      nameGap: 30,
      nameTextStyle: {
        color: 'white',
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
      datasets (selectedPointData) {
        return this.selectedDatasets.map(set => {
          const theme = getStyle(getColors('coclico'))
          // does not seem a very neat way to do this. Is there a better way?
          baseOptions.xAxis.name = set.xAxis.title
          baseOptions.yAxis.name = set.yAxis.title
          return _.merge(set, baseOptions, theme)
        })
      }
    },
    data () {
      return {
        expandedDatasets: []
      }
    },
    mounted () {
      this.loadPointDataForLocation()
      this.expandedDatasets = [ ...Array(this.datasets.length).keys() ]
    },
    methods: {
      ...mapActions([ 'storeActiveDatasetIds', 'loadPointDataForLocation' ]),
      ...mapMutations([ 'setActiveDatasetIds' ]),
      close () {
        this.$router.push({
          path: `/data/${this.$route.params.datasetIds}`,
          params: { datasetIds: this.$route.params.datasetIds }
        })
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
