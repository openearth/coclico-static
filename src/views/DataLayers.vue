<template>
  <div class='data-layers'>
    <data-layers-card :datasets="testDatasetsInActiveTheme"/>
  </div>
</template>

<script>
import DataLayersCard from '@/components/DataLayersCard.vue'
import {mapState} from "vuex"


export default {
  name:'DataLayers',
  components: {
    DataLayersCard,
  },
  computed: { 
    ...mapState('map', ['testDatasetsInActiveTheme'])
  }
}
</script>

<style scoped>
.data-layers {
  width: 100%;
  height: 100%;
}
</style>
