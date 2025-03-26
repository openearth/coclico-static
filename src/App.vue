<template>
  <VApp>
    <UserTour>
      <Toaster
        :toast-options="{
          class: 'py-4 px-2',
        }"
        close-button
        position="bottom-right"
        rich-colors
      />
      <router-view />
    </UserTour>
  </VApp>
</template>
<script lang="ts" setup>
import { Toaster } from "vue-sonner";
import UserTour from "@/components/UserTour.vue";
</script>
