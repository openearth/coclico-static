<template>
  <MapboxLayer
    :id="layer.id"
    :options="layer"
    @mb-click="onLayerClicked"
    @mb-mouseenter="onMouseenter"
    @mb-mouseleave="onMouseleave"
  >
  </MapboxLayer>
</template>
<script setup>
import { MapboxLayer } from "@studiometa/vue-mapbox-gl";
import { inject, onBeforeUnmount, ref } from "vue";

const props = defineProps({
  layer: {
    type: Object,
    required: true,
  },
});
const id = ref(props.layer.id);
const emit = defineEmits(["click"]);
const map = inject("map");

onBeforeUnmount(async () => {
  await map.value.removeLayer(id.value);
});

function onLayerClicked(e) {
  emit("click", e.features[0]);
}
function onMouseenter() {
  map.value.getCanvas().style.cursor = "pointer";
}
function onMouseleave() {
  map.value.getCanvas().style.cursor = "";
}
</script>
