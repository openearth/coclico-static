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
import { computed, inject, onBeforeUnmount, onMounted, ref } from "vue";
import { useStore } from "vuex";
import { setHighlight } from "@/lib/layers";

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
const clickableDatasetsIds = computed(
  () => store.getters["map/clickableDatasetsIds"],
);
const clickable = computed(() =>
  clickableDatasetsIds.value.some((id) =>
    props.layer.id.toLowerCase().startsWith(id),
  ),
);
const highlightedId = computed(() => store.getters["map/highlightedId"]);

onMounted(() => {
  if (!props.layer.id.endsWith("_geoserver_link")) return;
  map.value.on("mousemove", props.layer.id, (e) => {
    if (Boolean(highlightedId.value)) return;
    setHighlight({
      map: map.value,
      queriedFeatures: e.features,
      clickableDatasetsIds: clickableDatasetsIds.value,
      event: "hover",
    });
  });
});

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
