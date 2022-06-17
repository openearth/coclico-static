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
          this.storeactiveDatasetIds(this.$route.params.datasetIds)
        },
        deep: true
      }
    },
    mounted () {
      this.storeactiveDatasetIds(this.$route.params.datasetIds)
    },
    methods: {
      ...mapActions([ 'storeactiveDatasetIds' ])
    }
  }
</script>

<style lang="css" scoped></style>
