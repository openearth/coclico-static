<template>
  <v-row>
    <v-col cols="6" v-for="property in properties" :key="property.id">
      <v-row class="align-center">
        <v-col cols="9" class="mr-0">
          <span class="summary-info">{{ property.id }}</span>
        </v-col>
        <v-col v-if="property.description" cols="3" class="pa-4">
          <v-tooltip
            location="bottom"
            max-width="450px"
            :text="property.description"
          >
            <template v-slot:activator="{ props }">
              <v-icon v-bind="props" small class="summary-info, ml-4"
                >mdi-information-outline</v-icon
              >
            </template>
          </v-tooltip>
        </v-col>
      </v-row>
      <v-select
        :value="property.value"
        :items="property.values"
        @update:modelValue="(value) => updateProperty(property.id, value)"
        variant="outlined"
      ></v-select>
    </v-col>
  </v-row>
</template>

<script setup>
import { useStore } from "vuex";
import { computed } from "vue";

const props = defineProps({
  datasetId: {
    type: String,
    required: true,
  },
});
const store = useStore();

const properties = computed(() =>
  store.getters["map/activeDatasetProperties"](props.datasetId)
);

const updateProperty = (property, value) => {
  store.dispatch("map/updateDatasetProperty", {
    dataset: props.datasetId,
    property,
    value,
  });
};
</script>

<style>
.summary-info {
  color: #a9b0b5;
}
</style>
