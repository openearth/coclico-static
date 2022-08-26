<template>
  <v-navigation-drawer
    class="pl-16"
    permanent
    absolute
    width="40vw"
    color="background"
  >
    <v-container class="graph-menu d-flex flex-column">
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
            :value="true"
          >
            <v-expansion-panel-header
              class="h4"
              color="background"
              dark
            >
              <h3 class="h3">
                Location id: {{ $route.params.locationId }}
              </h3>
              Data set: {{ data.id }}
              <v-tooltip
                bottom
                v-if="openToLock"
              >
                <template #activator="{ on, attrs }">
                  <v-btn
                    icon
                    @click.stop="lockDataset({location: $route.params.locationId, dataset: data.id, option: data, id: Date.now().toString()}); openToLock = false"
                    v-bind="attrs"
                    v-on="on"
                  >
                    <v-icon>mdi-lock-open</v-icon>
                  </v-btn>
                </template>
                <span>Lock this dataset and make it visible in the locked dataset list below.</span>
              </v-tooltip>
              <v-tooltip
                bottom
                v-else
              >
                <template #activator="{ on, attrs }">
                  <v-icon
                    v-bind="attrs"
                    v-on="on"
                  >
                    mdi-lock
                  </v-icon>
                </template>
                <span>This dataset is already locked in the list below.</span>
              </v-tooltip>
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
          <h2 class="h2">
            Locked datasets
          </h2>
          <v-expansion-panel
            v-for="data in lockedDatasets"
            :key="data.id"
            :value="true"
          >
            <v-expansion-panel-header
              class="h4"
              color="background"
              dark
            >
              <h3 class="h3">
                Location id: {{ data.location }}
              </h3>
              Data set: {{ data.dataset }}
              <v-tooltip bottom>
                <template #activator="{ on, attrs }">
                  <v-btn
                    icon
                    @click.stop="removeLockedDataset(data.id)"
                    v-bind="attrs"
                    v-on="on"
                  >
                    <v-icon>mdi-delete</v-icon>
                  </v-btn>
                </template>
                <span>Remove dataset from locked dataset list.</span>
              </v-tooltip>
            </v-expansion-panel-header>
            <v-expansion-panel-content color="background">
              <v-container class="pa-0">
                <v-col
                  cols="12"
                  class="graph-line pa-0"
                >
                  <v-chart
                    :option="data.option"
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


  export default {
    name:'LocationIds',
    components: {
      VChart
    },
    watch: {
      '$route.params.datasetIds': {
        handler () {
          this.storeactiveDatasetIds(this.$route.params.datasetIds)
        },
        deep: true
      },
      // Update figure when different summary is selected
      '$store.state.map.activeSummary': {
        handler () {
          this.updateTimeseries()
        },
        deep: true
      },
      // Update figure when different variable is selected
      '$store.state.map.activeVariableId': function() {
        this.updateTimeseries()
      }
    },
    computed: {
      ...mapGetters([ 'selectedVectorData', 'selectedDatasets', 'lockedDatasets']),
      datasets () {
        return this.selectedDatasets.map(set => {
          const theme = getStyle(getColors('coclico'))
          // // does not seem a very neat way to do this. Is there a better way?
          // _.set(this.baseOptions, 'xAxis.name', _.get(set, 'xAxis.title'))
          // _.set(this.baseOptions, 'yAxis.name', _.get(set, 'yAxis.title'))
          return _.merge(set, this.baseOptions, theme)
        })
      }
    },
    data () {
      return {
        expandedDatasets: [],
        openToLock: true
      }
    },
    mounted () {
      this.loadPointDataForLocation()
      // Added +1 to ensure that this also opens when length = 0
      this.expandedDatasets = [ ...Array(this.datasets.length+1).keys() ]
      this.getBaseOption(this.$route.params.datasetIds)
    },
    methods: {
      ...mapActions([ 'storeactiveDatasetIds', 'loadPointDataForLocation' ]),
      ...mapMutations([ 'setActiveDatasetIds', 'lockDataset', 'removeLockedDataset']),
      close () {
        this.$router.push({
          path: `/data/${this.$route.params.datasetIds}`,
          params: { datasetIds: this.$route.params.datasetIds }
        })
      },
      getBaseOption (datasetId) {
        try {
          this.baseOptions = require(`@/assets/echart-templates/${datasetId}.js`).default
          console.log(this.baseOptions)
        } catch {
          this.baseOptions = require('@/assets/echart-templates/default.js').default
        }
      },
      randomId () {
        const dateId = Date.now()
        return dateId.toString()
      },
      updateTimeseries () {
        this.loadPointDataForLocation()
      },
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
