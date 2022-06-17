<template>
  <v-card
    raised
    max-height="80vh"
    class="pa-0 data-layers-card"
    data-v-step="3"
  >
    <v-card-title class="h3">
      All datasets
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
        <v-radio-group class="data-layers-card__group ma-0">
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
                    name="cc"
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
                    v-if="checkLayerType(dataset) === 'raster'"
                    dense
                    class="ma-auto radio"
                    :value="dataset.id"
                    @click="setRasterLayer(dataset.id)"
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
             
              <v-row>
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
              <v-row v-if="dataset.id === activeLocationDatasetId"> 
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

  import { mapGetters, mapActions } from "vuex"
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
      ...mapGetters([ 'activeDatasetId' ]),
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
          const activeDataset = this.hoverId === dataset.id || this.activeLocationDatasetId === dataset.id
          return activeDataset ? index : []
        })
        return active
      },
    },
    data () {
      return {
        hoverId: null
      }
    },
    methods: {
      ...mapActions ([ 'loadLocationDataset','clearActiveDatasetIds', 'resetActiveLocationLayer', 'setActiveDatasetId' ]),
      toggleLocationDataset(dataset) {
        const { id } = dataset
        if (id !== this.activeLocationDatasetId ) {
          this.clearActiveDatasetIds()
          this.$router.push('/data')
          this.resetActiveLocationLayer()
          return
        }
     
        const params = this.$route.params
        
        params.datasetIds = id
        let path = `/data/${params.datasetIds}`
        
        this.$router.push({ path, params })
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
        //TODO: add in the stacCatalogue structure a format parameter somehow
        return _.has(dataset, 'cube:dimensions') ? 'vector' : 'raster'
      }
    }
  }
</script>
<style scoped>
.data-layers-card {
  position: absolute;
  display: flex;
  flex-direction: column;
  top: var(--spacing-default);
  right: var(--spacing-default);
  z-index: 5;
  width: 30vw;
  max-width: 400px;
  min-width: 250px;
  background-color: var(--v-textColor-base);
}
.data-layers-card__text {
  height: 90%;
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
