<template>
  <VRow>
    <VCol
      class="pb-0 pt-0"
      cols="6"
      v-for="property in properties"
      :key="property.id"
    >
      <VRow class="align-center">
        <VCol cols="9" class="mr-0">
          <span class="summary-info">{{ property.id }}</span>
        </VCol>
        <VCol v-if="property.description" cols="3" class="pa-4">
          <VTooltip
            location="bottom"
            max-width="450px"
            :text="property.description"
          >
            <template v-slot:activator="{ props }">
              <VIcon v-bind="props" small class="summary-info, ml-4"
                >mdi-information-outline</VIcon
              >
            </template>
          </VTooltip>
        </VCol>
      </VRow>
      <VSelect
        :value="property.value"
        :items="property.values"
        class="select"
        @update:modelValue="(value) => updateProperty(property.id, value)"
        variant="outlined"
      ></VSelect>
    </VCol>
  </VRow>
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
  store.getters["datasets/activeDatasetProperties"](props.datasetId)
);

const updateProperty = async (property, value) => {
  await store.dispatch("datasets/updateDatasetProperty", {
    dataset: props.datasetId,
    property,
    value,
  });
  await store.dispatch("map/loadDatasetOnMap", props.datasetId);
};
</script>

<style>
.summary-info {
  color: #a9b0b5;
}
</style>
