<template>
  <v-app>
    <app-header />
    <app-sidebar />
    <v-main>
      <router-view />
    </v-main>
  </v-app>
</template>

<script>
  import AppHeader from './components/AppHeader'
  import AppSidebar from './components/AppSidebar'

  import { mapActions } from 'vuex'

  export default {
  
    components: {
      AppHeader,
      AppSidebar
    },
    methods: { 
      ...mapActions({ loadDatasets: 'loadDatasets' }),
    },
    mounted() { 
      this.loadDatasets()
    }
  };
</script>

