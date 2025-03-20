<template>
  <VContainer class="ma-0 pa-0 root">
    <VRow justify="center">
      <VCol ref="gradientContainer" class="gradient" cols="11"></VCol>
    </VRow>
    <VRow justify="center">
      <VCol v-if="!editingRange" class="py-0" cols="1">
        <span>
          {{ minValue }}
        </span>
        <!--        <VBtn icon variant="plain" @click="editRange">-->
        <!--          {{ minValue }}-->
        <!--        </VBtn>-->
      </VCol>
      <VCol v-else class="ma-0 ml-1" cols="5">
        <VTextField
          id="range-min"
          v-model="minValue"
          :label="`Min (${unit})`"
          placeholder="Min value"
        />
      </VCol>
      <!--      <VCol v-if="!editingRange" class="pa-0" cols="1" offset="9">-->
      <!--        <VBtn icon small variant="plain" @click="editRange">-->
      <!--          {{ maxValue }}-->
      <!--        </VBtn>-->
      <!--      </VCol>-->
      <VCol v-else class="ma-0" cols="5" offset="1">
        <VTextField
          id="range-max"
          v-model="maxValue"
          :label="`Max (${unit})`"
          placeholder="Max value"
        />
      </VCol>
      <VCol class="my-auto pa-0 unit-text bodytext-s" offset="10" cols="1">
        <span> {{ maxValue }} </span>
        <span> [{{ unit }}] </span>
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
import { createValueDomain, legend } from "@/lib/legend";
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
        createValueDomain({
          stops: linearGradient.value,
          min: parseFloat(minValue.value),
          max: parseFloat(maxValue.value),
        }),
        linearGradient.value.map((stop) => {
          return stop.color;
        }),
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

<style scoped>
.root {
  width: 420px;
  margin-inline: auto;
}
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
