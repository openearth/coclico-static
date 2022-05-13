<template>
  <div>
    <router-view />
  </div>
</template>

<script>
  import { mapActions } from 'vuex'

  export default {
    watch: {
      '$route.params.datasetIds': {
        handler () {
          this.storeActiveDatasetIds(this.$route.params.datasetIds)
        },
        deep: true
      }
    },
    mounted () {
      this.storeActiveDatasetIds(this.$route.params.datasetIds)
    },
    methods: {
      ...mapActions([ 'storeActiveDatasetIds' ])
    }
  }
</script>

<style lang="css" scoped></style>
