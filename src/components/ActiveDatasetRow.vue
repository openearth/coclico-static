<template>
  <VRow>
    <VCol
      v-for="property in properties"
      :key="property.id"
      class="pb-0 pt-0"
      cols="6"
    >
      <VRow class="align-center">
        <VCol class="mr-0" cols="9">
          <span class="summary-info">
            {{ property.id }}
          </span>
        </VCol>
        <VCol v-if="property.description" class="pa-4" cols="3">
          <VTooltip
            :text="property.description"
            location="bottom"
            max-width="450px"
          >
            <template v-slot:activator="{ props }">
              <VIcon class="summary-info, ml-4" small v-bind="props"
                >mdi-information-outline
              </VIcon>
            </template>
          </VTooltip>
        </VCol>
      </VRow>
      <VSelect
        :items="property.values"
        :value="property.value"
        class="select"
        variant="outlined"
        @update:modelValue="(value) => updateProperty(property.id, value)"
      />
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
  store.getters["datasets/activeDatasetProperties"](props.datasetId),
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
