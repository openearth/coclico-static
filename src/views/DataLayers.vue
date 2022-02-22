<template>
  <div class='data-layers'>
    <data-layers-card/>
  </div>
</template>

<script>
import DataLayersCard from '@/components/DataLayersCard.vue'

export default {
  name:'DataLayers',
  components: {
    DataLayersCard,
  }
}
</script>

<style scoped>
.data-layers {
  width: 100%;
  height: 100%;
}
</style>
