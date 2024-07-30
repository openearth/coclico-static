<template>
  <v-app>
    <mapbox-map
      id="map"
      ref="map"
      :access-token="accessToken"
      :preserve-drawing-buffer="true"
      :zoom="4"
      :center="[5.2913, 48.1326]"
      map-style="mapbox://styles/anoet/cljpm695q004t01qo5s7fhf7d"
      @mb-load="onMapLoad"
    >
      <MapboxNavigationControl :visualizePitch="true" />
      <MapboxLayer
        v-for="layer in mapboxLayers"
        :key="layer.id"
        :id="layer.id"
        :options="layer"
      />
      <MapboxPopup
        v-if="isOpen"
        :key="position.join('-')"
        :lng-lat="position"
        anchor="bottom"
        @mb-close="() => (isOpen = false)"
        style="width: fit-content"
      >
        <pre style="width: 450px; height: 350px; overflow: hidden">
          <div ref="chartContainer" style="width: 100%; height: 100%;"></div>
        </pre>
      </MapboxPopup>
      <dataset-card />
    </mapbox-map>
    <app-sidebar />
  </v-app>
</template>

<script>
import {
  MapboxMap,
  MapboxNavigationControl,
  MapboxLayer,
  MapboxPopup,
} from "@studiometa/vue-mapbox-gl";
import AppSidebar from "@/components/AppSidebar.vue";
import DatasetCard from "@/components/DatasetCard.vue";
import * as echarts from "echarts";
import { ref, nextTick } from "vue";

export default {
  data() {
    return {
      accessToken: process.env.VUE_APP_MAPBOX_TOKEN,
      isOpen: ref(false),
      position: ref([0, 0]),
      content: ref(),
      mapboxLayers: [
        {
          id: "example-layer",
          type: "symbol",
          source: {
            type: "geojson",
            data: {
              type: "FeatureCollection",
              features: [
                {
                  type: "Feature",
                  geometry: {
                    type: "Point",
                    coordinates: [4.9041, 52.3676], // Amsterdam
                  },
                  properties: {
                    title: "Amsterdam",
                    description: "Amsterdam, Netherlands",
                  },
                },
                {
                  type: "Feature",
                  geometry: {
                    type: "Point",
                    coordinates: [4.4777, 51.9244], // Rotterdam
                  },
                  properties: {
                    title: "Rotterdam",
                    description: "Rotterdam, Netherlands",
                  },
                },
              ],
            },
          },
          layout: {
            "icon-image": "marker-15",
            "icon-size": 1.5,
            "text-field": ["get", "title"],
            "text-offset": [0, 0.6],
            "text-anchor": "top",
          },
        },
      ],
    };
  },
  components: {
    MapboxMap,
    MapboxNavigationControl,
    MapboxLayer,
    MapboxPopup,
    AppSidebar,
    DatasetCard,
  },
  methods: {
    onMapLoad() {
      this.map = this.$refs.map.map;
      this.map.on("click", "example-layer", this.openPopup);
    },
    async openPopup(e) {
      const { features } = e;
      if (!features.length) return;

      const feature = features[0];
      const { geometry, properties } = feature;

      await nextTick();
      this.position = [...geometry.coordinates];
      this.isOpen = true;

      /**
       * Mapbox GL convert's properties values to JSON, so we need to parse them
       * to retrieve any complex data structure such as arrays and objects.
       */
      this.content = Object.fromEntries(
        Object.entries(properties).map(([key, value]) => {
          try {
            return [key, JSON.parse(value)];
          } catch (err) {
            // Silence is golden.
          }

          return [key, value];
        })
      );

      await nextTick();
      this.renderChart();
    },
    renderChart() {
      const chartDom = this.$refs.chartContainer;
      const myChart = echarts.init(chartDom);
      const option = {
        title: {
          text: "Traffic Sources",
          left: "center",
        },
        tooltip: {
          trigger: "item",
          formatter: "{a} <br/>{b} : {c} ({d}%)",
        },
        legend: {
          orient: "vertical",
          left: "left",
          data: [
            "Direct",
            "Email",
            "Ad Networks",
            "Video Ads",
            "Search Engines",
          ],
        },
        series: [
          {
            name: "Traffic Sources",
            type: "pie",
            radius: "55%",
            center: ["50%", "60%"],
            data: [
              { value: 335, name: "Direct" },
              { value: 310, name: "Email" },
              { value: 234, name: "Ad Networks" },
              { value: 135, name: "Video Ads" },
              { value: 1548, name: "Search Engines" },
            ],
            emphasis: {
              itemStyle: {
                shadowBlur: 10,
                shadowOffsetX: 0,
                shadowColor: "rgba(0, 0, 0, 0.5)",
              },
            },
          },
        ],
      };
      myChart.setOption(option);
    },
  },
};
</script>

<style>
#map {
  width: 100%;
  height: 100%;
}
</style>
