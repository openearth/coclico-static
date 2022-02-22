<template>
  <v-app>
    <app-header/>
    <v-main>
      <slot name="map" />
      <router-view />
      <slot />
    
      
      <!--TODO: app-sidebar is not finished -->
      <app-sidebar/>
    </v-main>
  </v-app>
</template>
<script>
  import AppHeader from '@/components/AppHeader'
  import AppSidebar from '@/components/AppSidebar.vue'
  export default {
    components: {
      AppHeader,
      AppSidebar
    }
  }
</script>