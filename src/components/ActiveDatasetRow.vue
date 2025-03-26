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
        <VCol v-if="property.description" cols="3" class="pa-4">
          <VMenu
            open-on-hover
            open-delay="100"
            close-delay="100"
            max-width="450px"
            location="bottom center"
          >
            <template v-slot:activator="{ props }">
              <VIcon v-bind="props" small class="summary-info, ml-4">
                mdi-information-outline
              </VIcon>
            </template>
            <template v-slot:default>
              <VCard
                class="tooltip py-2 px-4 rounded bg-grey-darken-3"
                v-html="marked.parse(property.description)"
              />
            </template>
          </VMenu>
        </VCol>
      </VRow>
      <VSelect
        :items="property.values"
        :value="property.value"
        variant="outlined"
        @update:modelValue="(value) => updateProperty(property.id, value)"
      />
    </VCol>
  </VRow>
</template>

<script setup>
import { useStore } from "vuex";
import { computed } from "vue";
import { marked } from "marked";

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

<style scoped>
.summary-info {
  color: #a9b0b5;
}

:deep(.v-select__menu-icon) {
  background: radial-gradient(
    circle,
    hsla(0 0% 100% / 100%) 30%,
    hsla(0 0% 100% / 0%) 100%
  );
  opacity: 1;
  border-radius: 50%;
}
</style>
