<template>
  <v-app>
    <!-- <app-header /> -->
    <app-sidebar @toggle-about="togglePanel('about')" style="border-radius: 28px" />
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
    data: () => ({
      panel: false,
      page: 2
    }),
    methods: { 
      ...mapActions({ loadDatasets: 'loadDatasets' }),
      togglePanel (name) {
        if (this.panel === name) {
          this.panel = false
        } else {
          this.panel = name
        }
      }
    },
    mounted() { 
      this.loadDatasets()
    }
  };
</script>

