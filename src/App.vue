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
    <disclaimer v-if="showDisclaimer"/> 
    </UserTour>
  </VApp>
</template>
<script lang="ts" setup>
import { computed, onMounted } from 'vue'
import { useStore } from 'vuex'
import { useRoute } from 'vue-router'

import { Toaster } from "vue-sonner";
import UserTour from "@/components/UserTour.vue";
import Disclaimer from '@/components/Disclaimer.vue';

const store = useStore()
const route = useRoute()

onMounted(() => {
  store.dispatch('disclaimer/loadDisclaimerAcknowledgment')
})

const showDisclaimer = computed(() => {
  return !store.getters['disclaimer/disclaimerAcknowledged'] || route.name === 'disclaimer'
})

</script>
