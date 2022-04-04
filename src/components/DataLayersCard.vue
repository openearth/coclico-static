<template>
<v-card light raised max-height="80vh" class="pa-0 data-layers-card"  data-v-step="3">
  <v-card-title class="h3">
    All datasets
  </v-card-title>
  <v-card-text class='scrollbar data-layers-card__text px-0 pb-0'> 
    <v-expansion-panels
    v-model="panel"
    multiple
    accordion
    flat
    color="background"
    >
      <v-radio-group class='data-layers-card__group ma-0'>
        <v-expansion-panel
          v-for="(dataset, index) in datasets"
          :key="index"
          :data-v-step="index === 1 ? '4' : false"
        >
          <v-expansion-panel-header
            hide-actions
            color="background"
            coclico
          > 
            <v-row>
              <v-col cols="1" class="ma-auto pa-0">
                <custom-icon name="cc" iconFolder="datasets"/>  
              </v-col>
              <v-col cols="7" class="ma-auto pa-0">
                <span class="ml-2 d-sm-none d-md-flex">{{ dataset.title }}</span> 
              </v-col>
              <v-col cols="2" class="ma-auto pa-0">
                <!-- TODO: refer to colors from CoCliCo theme, rather than hardcoding here (Ioanna) -->
                  <v-switch
                    class="my-auto switch"
                    dense
                    v-model="dataset.visible"
                    color="#ffa827"
                    @change="toggleVectorDataset(dataset.id)"
                  ></v-switch>
                </v-col>
                <v-col cols="1" class="ma-auto pa-0">
                  <v-radio
                    dense
                    class="ma-auto radio"
                    :value="dataset.id"
                    @click="setRasterLayer(dataset.id)"
                    color="#ffa827"
                  ></v-radio>
                  <v-progress-circular
                    dense
                    class="ma-auto"
                    v-show="false"
                    indeterminate
                    color="formActive"
                  ></v-progress-circular>
                </v-col>
                <v-col cols="1" class="ma-auto pa-0">
                   <v-btn icon class="my-auto" @click="onTooltipClick(dataset.id)" >
                    <custom-icon v-if="dataset.description" name="info" />
                  </v-btn>
                </v-col>
            </v-row>
           </v-expansion-panel-header>
          <v-expansion-panel-content>
            <v-row>
              <v-col cols="6" class="ma-auto pa-0">
                 <v-select
                  class="pa-2"
                  :items="returnPeriods"
                  :label="`Periods`"
                  flat
                  dense
                  @change="updateVectorLayer"
                />
              </v-col>
              <v-col cols="6" class="ma-auto pa-0">
                 <v-select
                  class="pa-2"
                  :items="scenarios"
                  :label="`Scenarios`"
                  flat
                  dense
                  @change="updateVectorLayer"
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
      returnPeriods: [5, 10],
      scenarios: [ "Historical",
                    "RCP45"],      
    }
  },
  methods: {
    toggleVectorDataset(id) {
      console.log('id', id)
    },
    setRasterLayer(id) {
      console.log('id', id)
    },
    onTooltipClick(id) {
      console.log('id', id)
    },
    updateVectorLayer() {
      console.log('update layer with selected values')
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
