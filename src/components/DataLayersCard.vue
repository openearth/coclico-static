<template>
  <v-card
    raised
    class="pa-0 data-layers-card"
    data-v-step="3"
  >
    <v-card-title class="h3">
      {{ themeName }}
    </v-card-title>
    <v-card-text
      class="scrollbar data-layers-card__text
      px-0
      pb-0"
    >
      <v-expansion-panels
        accordion
        flat
        tile
        :value="activePanels"
        multiple
        readonly
        color="background"
      >
        <v-radio-group
          v-model="activeRasterDatasetId"
          class="data-layers-card__group ma-0"
        >
          <v-expansion-panel
            v-for="(dataset, index) in datasets"
            :key="index"
          >
            <v-expansion-panel-header
              hide-actions
              color="white100"
              dark
            >
              <v-row>
                <v-col
                  cols="1"
                  class="ma-auto pa-0"
                >
                  <custom-icon
                    :name="dataset.id"
                    icon-folder="datasets"
                  />
                </v-col>
                <v-col
                  cols="7"
                  class="ma-auto pa-0"
                >
                  <span class="ml-2 d-sm-none d-md-flex">{{ dataset.title }}</span>
                </v-col>
                <v-col
                  cols="2"
                  class="ma-auto pa-0"
                >
                  <v-switch
                    class="my-auto switch"
                    v-if="checkLayerType(dataset) === 'vector'"
                    dense
                    flat
                    v-model="activeLocationDatasetId"
                    :value="dataset.id"
                    color="formActive"
                    @change="toggleLocationDataset(dataset)"
                  />
                </v-col>
                <v-col
                  cols="1"
                  class="ma-auto pa-0"
                >
                  <!-- TODO: to be added functionality to radio button -->
                  <v-radio
                    v-show="checkLayerType(dataset) === 'raster'"
                    dense
                    class="ma-auto radio"
                    :value="dataset.id"
                    @click.stop="toggleRasterDataset(dataset)"
                    color="formActive"
                  />
                  <v-progress-circular
                    dense
                    class="ma-auto"
                    v-show="false"
                    indeterminate
                    color="formActive"
                  />
                </v-col>
                <v-col
                  cols="1"
                  class="ma-auto pa-0"
                >
                  <v-btn
                    icon
                    class="my-auto"
                    @click="onTooltipClick(dataset.id)"
                  >
                    <custom-icon
                      v-if="dataset.description"
                      name="info"
                    />
                  </v-btn>
                </v-col>
              </v-row>
            </v-expansion-panel-header>
            <v-expansion-panel-content>
              <v-row>
                <div
                  v-if="dataset.description && hoverId === dataset.id"
                  class="data-layers-card__tooltip"
                >
                  <div
                    v-html="markedTooltip(dataset.description)"
                    class="data-layers-card__tooltip-text markdown pa-2"
                    :anchor-attributes="{ target: '_blank' }"
                    :watches="['source']"
                  />
                </div>
              </v-row>
              <v-row v-if="hasVariables(dataset)">
                <v-select
                  class="pa-2"
                  v-model="selectedVariable"
                  :items="dataset.variables"
                  :label="`Select variable`"
                  flat
                  dense
                  @change="updateVariable(dataset)"
                />
              </v-row>
              <v-row v-if="checkLayerType(dataset) === 'vector'">
                <v-col
                  cols="6"
                  class="ma-auto pa-0"
                  v-for="summary in dataset.summaries"
                  :key="summary.id"
                >
                  <v-select
                    class="pa-2"
                    v-model="summary.chosenValue"
                    :items="summary.allowedValues"
                    :label="summary.id"
                    flat
                    dense
                    @change="toggleLocationDataset(dataset)"
                  />
                </v-col>
              </v-row>
              <v-row v-if="checkLayerType(dataset) === 'vector' && dataset.id === activeLocationDatasetId && activeLegend(dataset)">
                <v-col>
                  <layer-legend :dataset="dataset" />
                </v-col>
              </v-row>
              <v-row v-if="checkLayerType(dataset) === 'raster'">
                <v-col
                  cols="6"
                  class="ma-auto pa-0"
                  v-for="summary in dataset.summaries"
                  :key="summary.id"
                >
                  <v-select
                    class="pa-2"
                    v-model="summary.chosenValue"
                    :items="summary.allowedValues"
                    :label="summary.id"
                    flat
                    dense
                    @change="toggleRasterDataset(dataset)"
                  />
                </v-col>
              </v-row>
              <v-row v-if="checkLayerType(dataset) === 'raster' && dataset.id === activeRasterDatasetId && activeLegend(dataset)">
                <v-col>
                  <layer-legend :dataset="dataset" />
                </v-col>
              </v-row>
            </v-expansion-panel-content>
          </v-expansion-panel>
        </v-radio-group>
      </v-expansion-panels>
    </v-card-text>
  </v-card>
</template>
<script>
  import CustomIcon from "./CustomIcon.vue"
  import LayerLegend from "./LayerLegend.vue"

  import { mapGetters, mapActions, mapMutations } from "vuex"
  import _ from 'lodash'
  import { marked } from 'marked'

  const renderer = new marked.Renderer()
  renderer.link = function (href, title, text) {
    return `<a target="_blank" href="${href}" title="${title}">${text}</a>`
  }

  export default {
    props: {
      datasets: {
        type: Object,
        default: () => {}
      }
    },
    components: {
      CustomIcon,
      LayerLegend
    },
    computed: {
      ...mapGetters([ 'activeDatasetId', 'activeRasterLayer', 'activeVariableId', 'getActiveVectorDataIds', 'getActiveTheme' ]),
      ...mapMutations('setActiveVectorDataIds'),
      themeName () {
        return this.getActiveTheme || 'All Datasets'
      },
      activeLocationDatasetId: {
        get() {
          return this.activeDatasetId
        },
        set(val) {
          this.setActiveDatasetId(val)
        }
      },
      activePanels () {
        // map which panel is showing the legend layer or the information layer)
        const active = _.values(this.datasets).flatMap((dataset, index) => {
          const activeDataset = this.hoverId === dataset.id || this.activeLocationDatasetId === dataset.id || this.activeRasterDatasetId === dataset.id
          return activeDataset ? index : []
        })
        return active
      },
      selectedVariable: {
        get () {
          return this.activeVariableId
        },
        set (val) {
          this.setActiveVariableId(val)
        }
      }
    },
    data () {
      return {
        hoverId: null,
        activeRasterDatasetId: null
      }
    },
    mounted () {
      const dataset = this.datasets[this.$route.params.datasetIds]
      if (dataset) {
        this.toggleLocationDataset(dataset)
      }
    },
    methods: {
      ...mapMutations([ 'setActiveSummary', 'setActiveVectorDataIds' ]),
      ...mapActions ([ 'loadLocationDataset', 'loadRasterDataset','clearActiveDatasetIds', 'resetActiveLocationLayer', 'resetActiveRasterLayer','setActiveDatasetId' ,'setActiveVariableId', 'clearActiveVariableId' ]),
      toggleLocationDataset(dataset) {
        const { id } = dataset
        const summ = _.get(dataset, 'summaries[0]', [])
        if (!_.get(summ, 'chosenValue')) {
          // If there are no chosenValues, use the first one of the list of allowed values
          summ.chosenValue = _.get(summ, 'allowedValues[0]')
        }

        if (!this.selectedVariable) {
          // If there is no selectedvariable yet, set the selectedvariable with the new id
          this.selectedVariable = dataset.variables[0]
          this.setActiveVariableId(dataset.variables[0])
        }
        this.setActiveSummary(dataset.summaries)
        if (id !== this.activeLocationDatasetId ) {
          // If another value is selected, deselect the previous
          this.clearActiveDatasetIds()
          this.clearActiveVariableId()
          this.$router.push('/data')
          this.resetActiveLocationLayer()
          return
        }

        const params = this.$route.params
        params.datasetIds = id
        let path = `/data/${params.datasetIds}`
        // plot is updated because of change in route
        this.$router.push({ path, params })
        this.setActiveVariableId(dataset.variables[0])
        this.loadLocationDataset(dataset)
      },
      toggleRasterDataset(dataset) {
        const layerId = _.get(this.activeRasterLayer, 'layerId')
        if (dataset.id === layerId && layerId) {
          this.resetActiveRasterLayer()
          this.activeRasterDatasetId = null
        } else {
          this.activeRasterDatasetId = dataset.id
          this.loadRasterDataset(dataset)
        }
      },
      updateVariable(dataset) {
        this.loadLocationDataset(dataset)
      },
      markedTooltip (text) {
        return marked(text, { renderer: renderer })
      },
      onTooltipClick(id) {
        this.hoverId ? (this.hoverId = null) : (this.hoverId = id)
      },
      checkLayerType(dataset) {
        //Assumption: if layer has cube:dimensions then it is a vector
        //TODO: add in the stacCatalogue structure a file format parameter somehow better so
        return _.has(dataset, 'cube:dimensions') ? 'vector' : 'raster'
      },
      activeLegend (dataset) {
        // Check if linearGradient is defined. If so, assume that legend has to be shown
        return _.has(dataset, 'deltares:linearGradient')
      },
      hasVariables (dataset) {
        // Check if there is more than one Variable
        // - If only one variable, no selection box
        // - If multiple variables, add selection box
        if (typeof dataset.variables !== 'undefined') {
          return _.gt(dataset.variables.length, 1)
        }
      },
    }
  }
</script>
<style scoped>
.data-layers-card {
  position: absolute;
  display: flex;
  flex-direction: column;
  top: var(--spacing-default);
  left: calc(var(--spacing-default) + 200px);
  z-index: 5;
  width: 30vw;
  max-width: 400px;
  min-width: 250px;
  background-color: var(--v-textColor-base);
  border-radius: 0px 28px 28px 0px !important;
  box-shadow: none !important;
  height: 100%;
  max-height: calc(100% - 2*(var(--spacing-default)));
}
.data-layers-card__text{
  height: 90%;
  overflow-y: auto;
}
.data-layers-card__group {
  height: 100%;
  width: 100%;
}
.data-layers-card__tooltip, .data-layers-card__tooltip {
  position: relative;
  width: 100%;
  height: 100%;
}
.data-layers-card__tooltip-text::before {
  content: '';
  position: absolute;
  top: -8px;
  right: 4px;
  width: 0;
  height: 0;
  border-right: 8px solid transparent;
  border-bottom: 8px solid var(--v-quietHover-base);
  border-left: 8px solid transparent;
}
.data-layers-card__tooltip-text {
  position: relative;
  border-radius: 5px;
  background-color: var(--v-quietHover-base);
  box-shadow: 4px 6px 20px -4px rgba(0, 0, 0, 0.5);
  color: var(--v-textInverted-base);
}
.switch {
  top: 8px;
  position: relative;
}
.v-expansion-panel {
  border-color: var(--v-background-base);
}
.v-input--selection-controls__input .v-icon {
  color: var(--v-primary-darken2);
}

</style>
