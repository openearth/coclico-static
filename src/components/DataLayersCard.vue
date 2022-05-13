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
    <v-card-text class="scrollbar data-layers-card__text px-0 pb-0"> 
      <v-expansion-panels
        v-model="panel"
        multiple
        accordion
        flat
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
                    dense
                    flat
                    v-model="dataset.visible"
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
                    @change="toggleMapboxLayer(dataset)"
                  />          
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
  import { mapActions } from "vuex"
  import _ from 'lodash'

  export default {
    props: {
      datasets: {
        type: Object,
        default: () => {}
      }
    },
    components: {
      CustomIcon,
    },
    data () {
      return {
        panel: [],
      }
    },
    methods: {
      ...mapActions ([ 'loadLocationDataset','clearActiveDatasetIds' ]),
      toggleLocationDataset(dataset) {
        const { id } = dataset
        let oldParams = _.get(this.$route, 'params.datasetIds')
        const params = this.$route.params
        let newParams 

        if (!oldParams) {
          //if oldPrams is undefined, set newParams by id
          newParams = id
        }else {
          // Else check if new id should be removed or added to new route
          oldParams = oldParams.split(',')
          if (oldParams.includes(id)) {
            // if oldparams already includes id, remove from route
            newParams = oldParams.filter(param => param !== id)
            if (newParams.length === 0) {
              newParams = undefined
            } else {
              newParams = newParams.join(',')
            }
          } else {
            // else add id to route and zoomtobbox
            newParams = `${oldParams},${id}`
          }
        }
        params.datasetIds = newParams
        let path = `/data/${params.datasetIds}`
        if (_.has(params, 'locationId')) {
          path = `/data/${params.datasetIds}/${params.locationId}`
        }
        if (newParams) {
          this.$router.push({ path, params })
        } else {
          this.$router.push('/data')
        }

        //find the layer of the dataset to load on the map based on the chosen values only if the dataset is visible
        if (!dataset.visible) {
          this.clearActiveDatasetIds()
          return
        }
       
        
        this.loadLocationDataset(dataset)
      },

      data () {
        return {
          panel: [],
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
  right: var(--spacing-default);
  z-index: 5;
  width: 30vw;
  max-width: 400px;
  min-width: 250px;
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
  color: var(--v-textColor-base);
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
