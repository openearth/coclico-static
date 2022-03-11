<template>
  <div class='data-layers'>
    <data-layers-card :datasets="availableDatasets"/>
  </div>
</template>

<script>
import DataLayersCard from '@/components/DataLayersCard.vue'
import { mapGetters } from 'vuex'

export default {
  name:'DataLayers',
  components: {
    DataLayersCard,
  },
  computed: {
    ...mapGetters(['availableDatasets'])
  }

}
</script>

<style scoped>
.data-layers {
  width: 100%;
  height: 100%;
}
</style>
