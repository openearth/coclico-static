<template>
  <VContainer class="ma-0 pa-0">
    <VRow justify="center">
      <VCol ref="gradientContainer" class="pl-3 gradient" cols="12"></VCol>
    </VRow>
    <VRow style="margin-top: 0px">
      <VCol v-if="!editingRange" class="ma-0 pa-0" cols="1">
        <VBtn icon variant="plain" @click="editRange">
          {{ minValue }}
        </VBtn>
      </VCol>
      <VCol v-else class="ma-0 ml-1" cols="5">
        <VTextField
          id="range-min"
          v-model="minValue"
          :label="`Min (${unit})`"
          placeholder="Min value"
        />
      </VCol>
      <VCol v-if="!editingRange" class="pa-0 pl-4" cols="1" offset="9">
        <VBtn icon small variant="plain" @click="editRange">
          {{ maxValue }}
        </VBtn>
      </VCol>
      <VCol v-else class="ma-0" cols="5" offset="1">
        <VTextField
          id="range-max"
          v-model="maxValue"
          :label="`Max (${unit})`"
          placeholder="Max value"
        />
      </VCol>
      <VCol class="my-auto pa-0 unit-text bodytext-s" cols="1">
        [{{ unit }}]
      </VCol>
    </VRow>
    <VRow v-if="editingRange" justify="space-between">
      <VCol>
        <VBtn dense @click="cancelEditRange"> Cancel</VBtn>
      </VCol>
      <VCol>
        <VBtn dense @click="resetRange"> Reset</VBtn>
      </VCol>
      <VCol>
        <VBtn dense @click="saveRange"> Save</VBtn>
      </VCol>
    </VRow>
  </VContainer>
</template>

<script setup>
import { set } from "lodash-es";
import { legend } from "@/lib/legend";
import { computed, onMounted, ref, watch } from "vue";

const props = defineProps({
  dataset: {
    type: Object,
    required: true,
  },
});
const gradientContainer = ref();
const editingRange = ref(false);
const defaultMinValue = computed(() =>
  (props.dataset?.["deltares:min"] || 0).toString(),
);
const defaultMaxValue = computed(() =>
  (props.dataset?.["deltares:max"] || 1).toString(),
);
const minValue = ref(defaultMinValue.value);
const maxValue = ref(defaultMaxValue.value);
const unit = computed(() => props.dataset?.["deltares:units"]);
const linearGradient = computed(
  () => props.dataset?.["deltares:linearGradient"],
);
watch([linearGradient, minValue, maxValue], () => {
  renderGradient();
});
onMounted(() => {
  updateMinMax();
  renderGradient();
});

function renderGradient() {
  if (linearGradient.value) {
    gradientContainer.value?.$el.replaceChildren(
      legend(
        [Number(minValue.value), Number(maxValue.value)],
        linearGradient.value.map((stop) => {
          return stop.color;
        }),
        {
          title: "Laagste punt (provincie)",
        },
      ),
    );
  }
}

function cancelEditRange() {
  minValue.value = defaultMinValue.value;
  maxValue.value = defaultMaxValue.value;
  editingRange.value = false;
}

function editRange() {
  editingRange.value = true;
}

function updateMinMax() {
  minValue.value = defaultMinValue.value;
  maxValue.value = defaultMaxValue.value;
}

function saveRange() {
  editingRange.value = false;
  set(props.dataset, "deltares:min", minValue.value);
  set(props.dataset, "deltares:max", maxValue.value);
  // reclassifyMapboxLayer(this.dataset);
}

function resetRange() {
  minValue.value = defaultMinValue.value;
  maxValue.value = defaultMaxValue.value;
}
</script>

<style>
.unit-text {
  text-align: center;
}

.gradient {
  flex-grow: 1;
  padding: 0;
  display: grid;
  place-items: center start;
}
</style>
