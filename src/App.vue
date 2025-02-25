<template>
  <VApp>
    <Toaster
      position="bottom-right"
      rich-colors
      close-button
      :toast-options="{
        class: 'py-4 px-2',
      }"
    />
    <router-view />
  </VApp>
</template>
<script setup lang="ts">
import { Toaster } from "vue-sonner";
</script>
