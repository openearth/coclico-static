<template>
  <MapboxLayer
    v-if="layer"
    :id="layer.id"
    :options="layer"
    @mb-click="onLayerClicked"
    @mb-mouseenter="onMouseenter"
    @mb-mouseleave="onMouseleave"
  >
  </MapboxLayer>
</template>
<script>
import { MapboxLayer } from "@studiometa/vue-mapbox-gl";
import { useMap } from "@studiometa/vue-mapbox-gl";
import { unref } from "vue";

export default {
  mounted() {
    const { map } = useMap();
    this.map = map;
  },
  props: {
    layer: {
      type: Object,
      default: () => {},
    },
  },
  components: {
    MapboxLayer,
  },
  methods: {
    onLayerClicked(e) {
      console.log("e", e.features[0]);
    },
    onMouseenter() {
      unref(this.map).getCanvas().style.cursor = "pointer";
    },
    onMouseleave() {
      unref(this.map).getCanvas().style.cursor = "";
    },
  },
};
</script>
