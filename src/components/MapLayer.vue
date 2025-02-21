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
import { computed, inject, onBeforeUnmount, ref } from "vue";
import { useStore } from "vuex";

const props = defineProps({
  layer: {
    type: Object,
    required: true,
  },
});
const store = useStore();
const id = ref(props.layer.id);
const emit = defineEmits(["click"]);
const map = inject("map");
const clickableDatasetIds = computed(
  () => store.getters["map/clickableDatasetsIds"],
);
const clickable = computed(() =>
  clickableDatasetIds.value.some((id) =>
    props.layer.id.toLowerCase().startsWith(id),
  ),
);

onBeforeUnmount(async () => {
  await map.value.removeLayer(id.value);
});

function onLayerClicked(e) {
  emit("click", e.features[0]);
}
function onMouseenter() {
  if (clickable.value) {
    map.value.getCanvas().style.cursor = "pointer";
  }
}
function onMouseleave() {
  map.value.getCanvas().style.cursor = "";
}
</script>
