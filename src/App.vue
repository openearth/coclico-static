<template>
  <VApp>
    <UserTour>
      <Toaster
        position="bottom-right"
        rich-colors
        close-button
        :toast-options="{
          class: 'py-4 px-2',
        }"
      />
      <router-view />
    </UserTour>
  </VApp>
</template>
<script setup lang="ts">
import { Toaster } from "vue-sonner";
import UserTour from "@/components/UserTour.vue";
</script>
