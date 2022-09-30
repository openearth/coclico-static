<template>
  <v-app>
    <app-header />
    <app-sidebar @toggle-about="togglePanel('about')" />
    <v-main>
      <router-view />
      <about-panel
        v-if="panel === 'about'"
        @close-about="panel = false"
      />
      <legal-dialog />
    </v-main>
  </v-app>
</template>

<script>
  import AppHeader from './components/AppHeader'
  import AboutPanel from '@/components/AboutPanel.vue'
  import AppSidebar from './components/AppSidebar'
  import LegalDialog from './components/LegalDialog'
  import { mapActions } from 'vuex'

  export default {
  
    components: {
      AppHeader,
      AboutPanel,
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

