<template>
  <VNavigationDrawer
    permanent
    expand-on-hover
    rail
    width="180"
    rail-width="100"
    class="custom-navigation-drawer"
    :style="sidebarStyle"
  >
    <VListItem class="image-container">
      <custom-icon name="logo" class="coclico-image" />
    </VListItem>
    <VList nav>
      <VListItem
        class="list-item"
        @click="
          toggleLayersCard(theme.name);
          setTheme(theme.name);
        "
        v-for="theme in themes"
        :key="theme.name"
        color="primary"
        :value="theme.name"
      >
        <VListImg class="pa-2 list-item-img">
          <VBadge color="primary" v-if="theme.count" :content="theme.count">
            <custom-icon :name="theme.name" class="item-image" />
          </VBadge>

          <custom-icon v-else :name="theme.name" class="item-image" />
        </VListImg>
        <VListItemTitle class="list-item-title">
          {{ theme.name }}
        </VListItemTitle>
      </VListItem>
      <VDivider class="my-8" />
      <VListItem
        class="list-item"
        href="https://www.openearth.nl/coclico-workbench/"
        target="_blank"
      >
        <VListImg class="list-item-img">
          <VIcon color="black" size="1.5rem"
            >mdi-book-open-variant-outline</VIcon
          >
        </VListImg>
        <VListItemTitle class="list-item-title">Handbook</VListItemTitle>
      </VListItem>
      <VListItem
        class="list-item"
        href="https://coclicoservices.eu/"
        target="_blank"
      >
        <VListImg class="list-item-img">
          <VIcon color="black" size="1.5rem">mdi-web</VIcon>
        </VListImg>
        <VListItemTitle class="list-item-title">Website</VListItemTitle>
      </VListItem>
    </VList>
  </VNavigationDrawer>

  <VNavigationDrawer
    floating
    temporary
    class="custom-data-layers-card"
    :class="{ closed: !showLayersCard }"
    v-model="showLayersCard"
    width="400"
  >
    <VListItem>
      <VRow>
        <VCol cols="10">
          <VCardTitle class="dataset-card-theme-title">
            {{ activeTheme }}
          </VCardTitle>
        </VCol>
        <VCol class="column-right" cols="2">
          <VBtn icon @click="close" flat class="close-button">
            <VIcon>mdi-close</VIcon>
          </VBtn>
        </VCol>
      </VRow>
    </VListItem>
    <VList>
      <VListItem v-if="filteredDatasets.length">
        <VCardTitle class="layer-card-title"> User stories </VCardTitle>
        <VList class="layer-list">
          <VListItem
            v-for="dataset in filteredDatasets"
            :key="dataset.id"
            :title="dataset.title"
          >
            <template v-slot:prepend>
              <VSwitch
                v-model="dataset.active"
                hide-details
                class="mr-5"
                color="primary"
                @change="toggleDataset(dataset)"
              ></VSwitch>
            </template>
            <template v-slot:append>
              <VTooltip
                max-width="300px"
                location="bottom"
                :text="dataset.description"
              >
                <template v-slot:activator="{ props }">
                  <VIcon v-bind="props" small class="summary-info, ml-4">
                    mdi-information-outline
                  </VIcon>
                </template>
              </VTooltip>
            </template>
          </VListItem>
        </VList>
      </VListItem>
      <VListItem v-if="dataLayers">
        <VCardTitle class="layer-card-title"> Data layers</VCardTitle>
        <VList class="layer-list">
          <VListItem
            v-for="dataset in dataLayers"
            :key="dataset.id"
            :title="dataset.title"
          >
            <template v-slot:prepend>
              <VSwitch
                v-model="dataset.active"
                hide-details
                class="mr-5"
                color="primary"
                @change="toggleDataset(dataset)"
              ></VSwitch>
            </template>
            <template v-slot:append>
              <VTooltip
                max-width="300px"
                location="bottom"
                :text="dataset.description"
              >
                <template v-slot:activator="{ props }">
                  <VIcon v-bind="props" small class="summary-info, ml-4">
                    mdi-information-outline
                  </VIcon>
                </template>
              </VTooltip>
            </template>
          </VListItem>
        </VList>
      </VListItem>
    </VList>
  </VNavigationDrawer>
</template>

<script setup>
import CustomIcon from "@/components/CustomIcon.vue";
import { computed, ref } from "vue";
import { useStore } from "vuex";

const store = useStore();
const showLayersCard = ref(false);

const activeTheme = computed(() => store.getters["datasets/activeTheme"]);
const datasetsInActiveTheme = computed(
  () => store.getters["datasets/datasetsInActiveTheme"],
);
const themes = computed(() => store.getters["datasets/themes"]);
const sidebarStyle = computed(() => {
  return {
    borderRadius: showLayersCard.value
      ? "28px 0px 28px 28px"
      : "28px 28px 28px 28px",
    borderRight: showLayersCard.value ? "2px solid #e4e4e4" : "2px solid white",
  };
});
const filteredDatasets = computed(() => {
  return datasetsInActiveTheme.value.filter(
    (dataset) => dataset.id === "slp" || dataset.id === "cfhp",
  );
});
const dataLayers = computed(() =>
  datasetsInActiveTheme.value.filter(
    ({ id }) => id !== "slp" && id !== "cfhp" && id !== "cba",
  ),
);

function toggleLayersCard(theme) {
  showLayersCard.value =
    activeTheme.value === theme ? !showLayersCard.value : true;
}
function setTheme(theme) {
  store.dispatch("datasets/setActiveTheme", theme);
}
function close() {
  showLayersCard.value = false;
}
async function toggleDataset(dataset) {
  await store.dispatch("datasets/toggleActiveDataset", dataset.id);
  await store.dispatch("map/loadDatasetOnMap", dataset.id);
  await store.dispatch("datasets/updateThemeObject");
}
</script>

<style lang="scss" scoped>
.custom-navigation-drawer {
  display: flex;
  position: absolute;
  left: 0;
  flex-direction: column;
  align-items: center;
  height: max-content !important;
  max-height: calc(100% - var(--drawer-block-margin) * 2);
  margin-top: var(--drawer-block-margin);
  margin-left: var(--drawer-inline-margin);
  & :global(.v-navigation-drawer--rail .list-item-title) {
    opacity: 0;
  }
  &
    :global(
      .v-navigation-drawer--rail.v-navigation-drawer--is-hovering
        .list-item-title
    ) {
    opacity: 1;
  }
}

.image-container {
  margin-top: 20px;
  padding-inline: 1rem;
  display: flex;
  justify-content: center;
  align-items: center;
}

.coclico-image {
  height: 4rem;
  width: 4rem;
}

.list-item {
  display: flex;
  justify-content: center;
  margin: 20px auto auto;
  border-radius: 5px !important;
}

.list-item-img {
  display: flex;
  justify-content: center;
  margin-top: 6px;
}

.list-item-title {
  display: flex;
  justify-content: center;
  margin-top: 32px;
  white-space: nowrap;
  text-align: center;
  font-size: 14px;
  line-height: 20px;
  word-break: keep-all;
}

.item-image {
  width: 2.5rem;
  height: 1.5rem;
}

@keyframes delay-out {
  0% {
    opacity: 1;
  }
  75% {
    opacity: 1;
  }
  100% {
    opacity: 0;
  }
}
.custom-data-layers-card {
  display: flex;
  align-items: center;
  flex-direction: column;
  z-index: 5;
  height: max-content !important;
  max-height: calc(100% - var(--drawer-block-margin) * 2);
  margin-top: var(--drawer-block-margin);
  margin-left: var(--drawer-inline-margin);
  border-radius: 0 28px 28px 0;
  &.closed {
    opacity: 0;
    animation: forwards linear delay-out 0.2s;
  }
}

.close-button {
  margin-top: 10px;
  color: rgb(var(--v-theme-grey80));
}

.layer-card-title {
  margin-top: 10px;
  color: rgb(var(--v-theme-primary));
  font-family: "Inter", sans-serif;
  text-transform: uppercase;
  font-size: 12px;
  font-weight: 600;
}

.column-right {
  display: flex;
  justify-content: flex-end;
}

.layer-category-title {
  margin-top: 10px;
  color: rgb(var(--v-theme-primary));
  font-family: "Inter", sans-serif;
  text-transform: uppercase;
  font-size: 12px;
  font-weight: 600;
}

.layer-list {
  color: rgb(var(--v-theme-black80));
  font-family: "Inter", sans-serif;
  font-size: 12px;
  margin-top: -8px;
}

.dataset-card-theme-title {
  margin-top: 10px;
  color: black;
  font-family: "Inter", sans-serif;
  font-size: 20px;
  font-weight: 600;
}
</style>
