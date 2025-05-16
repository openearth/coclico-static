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
import { computed, inject, onBeforeUnmount, onMounted, ref, watch } from "vue";
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
const minzoom = ref();
const emit = defineEmits(["click"]);
const map = inject("map");
const clickableDatasetsIds = computed(
  () => store.getters["map/clickableDatasetsIds"],
);
const clickable = computed(() =>
  clickableDatasetsIds.value.some((id) =>
    id.value.toLowerCase().startsWith(id.toLowerCase()),
  ),
);
const highlightedId = computed(() => store.getters["map/highlightedId"]);

watch(minzoom, () => {
  map.value.zoomTo(minzoom.value + 0.1);
});
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

  if (props.layer?.source?.url?.startsWith("mapbox")) {
    map.value.on("data", getMinZoom);
  }
  if (!id.value.endsWith("_geoserver_link")) return;
  map.value.on("mousemove", id.value, onMouseMove);

});

onBeforeUnmount(async () => {
  map.value.off("mousemove", id.value, onMouseMove);
  map.value.off("data", getMinZoom);
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

const onMouseMove = (e) => {
  if (Boolean(highlightedId.value) || clickableDatasetsIds.value[0] === "cba")
    return;
  setHighlight({
    map: map.value,
    queriedFeatures: e.features,
    clickableDatasetsIds: clickableDatasetsIds.value,
    event: "hover",
  });
};
const getMinZoom = (e) => {
  if (
    !minzoom.value &&
    e.sourceDataType === "metadata" &&
    e.sourceId === id.value &&
    e.isSourceLoaded
  ) {
    minzoom.value = map.value.getSource(id.value).minzoom;
    map.value.off("data", getMinZoom);
  }
};
</script>
