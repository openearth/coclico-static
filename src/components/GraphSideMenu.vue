<template>
  <v-navigation-drawer
    class="pl-16"
    permanent
    absolute
    width="40vw"
    color="background"
  >
    <v-container class="account d-flex flex-column">
      <h2 class="h2">
        {{ locations }}
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
          v-if="hasSerieData"
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
              <graph-line
                :image-url="data.imageUrl"
                :category="data.category"
                :series="[data.serie]"
                theme="dark"
                :collapsible="true"
                :units="data.units"
                :type="data.type"
                :parameter-id="data.id"
                :title="data.datasetName"
                :set-mark-point="data.id === getActiveRasterLayer"
                :time-step="getTimeStep"
              />
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



