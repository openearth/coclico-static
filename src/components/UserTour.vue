<template>
  <aside v-if="isOnTour">
    <svg>
      <defs>
        <mask id="mask">
          <rect x="0" y="0" width="100%" height="100%" fill="white"></rect>
          <rect
            rx="28px"
            ry="28px"
            :x="current?.bounds?.x || 0"
            :y="current?.bounds?.y || 0"
            :width="current?.bounds?.width || 0"
            :height="current?.bounds?.height || 0"
          ></rect>
        </mask>
      </defs>
      <rect
        mask="url(#mask)"
        class="backdrop"
        x="0"
        y="0"
        width="100%"
        height="100%"
      />
    </svg>
    <v-menu
      v-model="isOnTour"
      :close-on-content-click="false"
      :location="current?.location"
    >
      <template v-slot:activator="{ props }">
        <div class="cutout" :style="cutout" v-bind="props" />
      </template>

      <v-card
        max-width="500px"
        :title="current?.title"
        :text="current?.description"
      >
        <VCardActions class="flex justify-space-around">
          <VBtn
            @click="previous"
            :disabled="!hasPreviousTourStep"
            prepend-icon="mdi-chevron-left"
          >
            Previous
          </VBtn>
          <VBtn @click="stop" append-icon="mdi-fast-forward" variant="text">
            Skip Tour
          </VBtn>
          <VBtn
            @click="next"
            :append-icon="hasNextTourStep ? 'mdi-chevron-right' : 'mdi-check'"
          >
            {{ hasNextTourStep ? "Next" : "Finish" }}
          </VBtn>
        </VCardActions>
      </v-card>
    </v-menu>
  </aside>
  <VFab
    app
    v-tooltip:top-center="'Start a tutorial tour'"
    class="mb-7"
    icon="mdi-help"
    location="bottom center"
    size="small"
    @click="start"
  />
  <slot></slot>
</template>

<script setup>
import { useStore } from "vuex";
import { computed } from "vue";

const store = useStore();
const isOnTour = computed(() => store.getters["tour/isOnTour"]);
const current = computed(() => store.getters["tour/currentTourStep"]);
const hasPreviousTourStep = computed(
  () => store.getters["tour/hasPreviousTourStep"],
);
const hasNextTourStep = computed(() => store.getters["tour/hasNextTourStep"]);
const cutout = computed(() => {
  return {
    top: `${current.value?.bounds?.y}px`,
    left: `${current.value?.bounds?.x}px`,
    width: `${current.value?.bounds?.width}px`,
    height: `${current.value?.bounds?.height}px`,
  };
});
function start() {
  store.dispatch("tour/startTour");
}
function stop() {
  store.dispatch("tour/stopTour");
}
function next() {
  store.dispatch("tour/nextTourStep");
}
function previous() {
  store.dispatch("tour/previousTourStep");
}
</script>

<style scoped>
@keyframes fadein {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}
aside {
  position: fixed;
  width: 100vw;
  height: 100vh;
  z-index: 999;
}
svg {
  animation: fadeIn 1s forwards;
  width: 100%;
  height: 100%;
}

.cutout {
  position: fixed;
  z-index: 1000;
}

.backdrop {
  fill: hsla(0, 0%, 10%, 0.5);
}
</style>
