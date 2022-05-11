<template>
  <v-app>
    <app-header />
    <app-sidebar />
    <v-main>
      <router-view />
      <legal-dialog />
    </v-main>
  </v-app>
</template>

<script>
  import AppHeader from './components/AppHeader'
  import AppSidebar from './components/AppSidebar'
  import LegalDialog from './components/LegalDialog'
  import { mapActions } from 'vuex'

  export default {
  
    components: {
      AppHeader,
      AppSidebar,
      LegalDialog
    },
    methods: { 
      ...mapActions({ loadDatasets: 'loadDatasets' }),
    },
    mounted() { 
      this.loadDatasets()
    }
  };
</script>

