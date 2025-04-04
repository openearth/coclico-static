<template>
  <VNavigationDrawer
    :style="sidebarStyle"
    class="custom-navigation-drawer"
    expand-on-hover
    permanent
    rail
    rail-width="100"
    width="180"
  >
    <VListItem class="image-container">
      <custom-icon class="coclico-image" name="logo" />
    </VListItem>
    <VList ref="tour" nav>
      <VListItem
        v-for="theme in themes"
        :key="theme.name"
        :value="theme.name"
        class="list-item"
        color="primary"
        @click="
          toggleLayersCard(theme.name);
          setTheme(theme.name);
        "
      >
        <VListImg class="pa-2 list-item-img">
          <VBadge v-if="theme.count" :content="theme.count" color="primary">
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
          <VIcon color="black" size="1.5rem">
            mdi-book-open-variant-outline
          </VIcon>
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
    v-model="showLayersCard"
    :class="{ closed: !showLayersCard }"
    class="custom-data-layers-card"
    floating
    temporary
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
          <VBtn class="close-button" flat icon @click="close">
            <VIcon>mdi-close</VIcon>
          </VBtn>
        </VCol>
      </VRow>
    </VListItem>
    <VList>
      <VListItem v-if="filteredDatasets?.length">
        <VCardTitle class="layer-card-title"> User stories</VCardTitle>
        <VList class="layer-list">
          <VListItem
            v-for="dataset in filteredDatasets"
            :key="dataset.id"
            :aria-label="dataset.title"
          >
            <template v-slot:prepend>
              <VSwitch
                v-model="dataset.active"
                :label="dataset.title"
                class="wrap-text"
                color="primary"
                hide-details
                @change="toggleDataset(dataset)"
              />
            </template>
            <template v-slot:append>
              <VMenu
                open-on-hover
                open-delay="100"
                close-delay="100"
                max-width="300px"
                location="bottom center"
              >
                <template v-slot:activator="{ props }">
                  <VIcon class="summary-info, ml-4" small v-bind="props">
                    mdi-information-outline
                  </VIcon>
                </template>
                <template v-slot:default>
                  <VCard
                    class="tooltip py-2 px-4 rounded bg-grey-darken-3"
                    v-html="marked.parse(dataset.description)"
                  />
                </template>
              </VMenu>
            </template>
          </VListItem>
        </VList>
      </VListItem>
      <VListItem v-if="dataLayers?.length">
        <VCardTitle class="layer-card-title"> Data layers</VCardTitle>
        <VList class="layer-list">
          <VListItem
            v-for="dataset in dataLayers"
            :key="dataset.id"
            :aria-label="dataset.title"
          >
            <template v-slot:prepend>
              <VSwitch
                v-model="dataset.active"
                :label="dataset.title"
                class = "wrap-text"
                color="primary"
                hide-details
                @change="toggleDataset(dataset)"
              ></VSwitch>
            </template>
            <template v-slot:append>
              <VMenu
                open-on-hover
                open-delay="100"
                close-delay="100"
                max-width="300px"
                location="bottom center"
              >
                <template v-slot:activator="{ props }">
                  <VIcon class="summary-info, ml-4" small v-bind="props">
                    mdi-information-outline
                  </VIcon>
                </template>
                <template v-slot:default>
                  <VCard
                    class="tooltip py-2 px-4 rounded bg-grey-darken-3"
                    v-html="marked.parse(dataset.description)"
                  />
                </template>
              </VMenu>
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
import { useTour } from "@/lib/useTour";
import { marked } from "marked";

const store = useStore();
const showLayersCard = ref(false);
useTour({
  id: "sidebar",
  refId: "tour",
  title: "Themes",
  location: "end center",
  index: 0,
  description: `Select a theme to view the available datasets.
   Toggle user stories and data layers on and off to display them on the map.
   Click on the layer to view spatial data.`,
  onTourStep: () => {
    showLayersCard.value = true;
  },
  onAfterTourStep: () => {
    showLayersCard.value = false;
  },
});

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
    (dataset) =>
      dataset.id === "slp" ||
      dataset.id === "cfhp" ||
      dataset.id === "cba" ||
      dataset.id === "pp_maps" ||
      dataset.id === "be_maps" ||
      dataset.id === "cfhp_all_maps" ||
      dataset.id === "bc_maps",
  );
});
const dataLayers = computed(() =>
  datasetsInActiveTheme.value.filter(
    ({ id }) =>
      id !== "slp" &&
      id !== "cfhp" &&
      id !== "cba" &&
      id !== "pp_maps" &&
      id !== "be_maps" &&
      id !== "cfhp_all_maps" &&
      id !== "bc_maps",
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
  overflow: hidden;

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

  & :global(.v-navigation-drawer__content) {
    scrollbar-width: thin;
  }
}

.tooltip :deep(a) {
  color: white;
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

.wrap-text{
  width: 260px;
  white-space: normal !important;
  word-break: break-word;
}
</style>
