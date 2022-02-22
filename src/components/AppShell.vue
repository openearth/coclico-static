<template>
  <v-app>
    <app-header/>
    <v-main>
      <router-view/>
      <slot name="map" />
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