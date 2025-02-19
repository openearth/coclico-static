<template>
  <span
    class="icon"
    v-if="icon"
    :class="{ 'icon--large': size === 'large' }"
    role="presentation"
  >
    <span>
      <component :is="icon" />
    </span>
  </span>
</template>

<script setup>
import fallback from "@/assets/icons/icon-placeholder.svg";
import { computed, defineAsyncComponent } from "vue";

const props = defineProps({
  name: {
    type: String,
    default: "",
  },
  iconFolder: {
    type: String,
    default: null,
  },
  size: {
    type: String,
    default: null,
  },
});
const icon = computed(() => {
  try {
    return defineAsyncComponent(() =>
      import(`@/assets/icons/icon-${props.name}.svg?skipsvgo`)
    );
  } catch (e) {
    console.error(e);
    return fallback;
  }
});
</script>

<style>
.icon {
  display: inline-block;
  width: 24px;
  height: 24px;
}

.icon--large {
  width: 8rem;
  height: 4rem;
}

.icon span {
  display: block;
  width: 100%;
  height: 100%;
}

.icon svg {
  display: block;
  width: 100%;
  height: 100%;
  fill: currentColor;
}
</style>
