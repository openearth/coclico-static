<template>
  <aside v-if="isOnTour">
    <svg>
      <defs>
        <mask id="mask">
          <rect fill="white" height="100%" width="100%" x="0" y="0"></rect>
          <rect
            :height="current?.bounds?.height || 0"
            :width="current?.bounds?.width || 0"
            :x="current?.bounds?.x || 0"
            :y="current?.bounds?.y || 0"
            rx="28px"
            ry="28px"
          ></rect>
        </mask>
      </defs>
      <rect
        class="backdrop"
        height="100%"
        mask="url(#mask)"
        width="100%"
        x="0"
        y="0"
      />
    </svg>
    <v-menu
      v-model="isOnTour"
      :close-on-content-click="false"
      :location="current?.location"
    >
      <template v-slot:activator="{ props }">
        <div :style="cutout" class="cutout" v-bind="props" />
      </template>

      <v-card :title="current?.title" max-width="500px">
        <v-card-text v-html="current?.description" />
        <VCardActions class="flex justify-space-around">
          <VBtn
            :disabled="!hasPreviousTourStep"
            prepend-icon="mdi-chevron-left"
            @click="previous"
          >
            Previous
          </VBtn>
          <VBtn append-icon="mdi-fast-forward" variant="text" @click="stop">
            Skip Tour
          </VBtn>
          <VBtn
            :append-icon="hasNextTourStep ? 'mdi-chevron-right' : 'mdi-check'"
            @click="next"
          >
            {{ hasNextTourStep ? "Next" : "Finish" }}
          </VBtn>
        </VCardActions>
      </v-card>
    </v-menu>
  </aside>
  <VFab
    v-tooltip:top-center="'Start a tutorial tour'"
    app
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
import { computed, watch } from "vue";

const store = useStore();
const isOnTour = computed(() => store.getters["tour/isOnTour"]);
const current = computed(() => store.getters["tour/currentTourStep"]);

const hasPreviousTourStep = computed(
  () => store.getters["tour/hasPreviousTourStep"],
);
const hasNextTourStep = computed(() => store.getters["tour/hasNextTourStep"]);

const cutout = computed(() => {
  if (current.value?.location === 'center') {
    const vw = window.innerWidth;
    const vh = window.innerHeight;
    const width = 10;
    const height = 10;
    return {
      top: `${vh / 2 - height / 2}px`,
      left: `${vw / 2 - width / 2}px`,
      width: `${width}px`,
      height: `${height}px`,
    };
  }
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
