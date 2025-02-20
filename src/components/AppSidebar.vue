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
        v-for="(theme, i) in themes"
        :key="i"
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
      <VList>
        <VListItem class="list-item" @click="openLayersCard()">
          <VListImg class="list-item-img">
            <custom-icon name="Search" class="item-image" />
          </VListImg>
          <VListItemTitle class="list-item-title">Search</VListItemTitle>
        </VListItem>
        <VListItem class="list-item-more">
          <VMenu>
            <template v-slot:activator="{ props: menu }">
              <VTooltip location="top">
                <template v-slot:activator="{ props: tooltip }">
                  <VBtn
                    v-bind="mergeProps(menu, tooltip)"
                    variant="plain"
                    class="list-item-img"
                  >
                    <custom-icon name="More" class="item-image-more" />
                  </VBtn>
                </template>
                <span>Extra tools</span>
              </VTooltip>
            </template>
            <VList class="pa-0">
              <VListItem @click="openLandingPage">
                <div class="extra-list-item">
                  <VIcon color="black" size="18px">
                    mdi-information-outline
                  </VIcon>
                  <VListItemSubtitle class="extra-list-item-text">
                    WEBSITE
                  </VListItemSubtitle>
                </div>
              </VListItem>
              <VListItem @click="openCatalogPage">
                <div class="extra-list-item">
                  <VIcon color="black" size="18px"> mdi-database-search</VIcon>
                  <VListItemSubtitle class="extra-list-item-text">
                    DATA CATALOG
                  </VListItemSubtitle>
                </div>
              </VListItem>
              <VListItem @click="openWorkbenchPage">
                <div class="extra-list-item-container">
                  <VIcon color="black" size="18px"> mdi-hammer</VIcon>
                  <VListItemSubtitle class="extra-list-item-text">
                    WORKBENCH
                  </VListItemSubtitle>
                </div>
              </VListItem>
            </VList>
          </VMenu>
          <VListItemTitle class="list-item-title"></VListItemTitle>
        </VListItem>
      </VList>
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
      <VListItem>
        <VCardTitle class="layer-card-title" v-if="filteredDatasets.length">
          User stories
        </VCardTitle>
        <VList class="layer-list" v-if="filteredDatasets.length">
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
      <VListItem>
        <VCardTitle class="layer-card-title"> Data layers</VCardTitle>
        <VList class="layer-list">
          <VListItem
            v-for="dataset in datasetsInActiveTheme.filter(
              ({ id }) => id !== 'slp' && id !== 'cfhp' && id !== 'cba',
            )"
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
import { computed, mergeProps, ref } from "vue";
import { useStore } from "vuex";

const store = useStore();
const showLayersCard = ref(false);

const activeTheme = computed(() => store.getters["themes/activeTheme"]);
const datasetsInActiveTheme = computed(
  () => store.getters["datasets/datasetsInActiveTheme"],
);
const themes = computed(() => store.getters["datasets/themes"]);
const sidebarStyle = computed(() => {
  return {
    borderRadius: showLayersCard.value
      ? "28px 0px 0px 28px"
      : "28px 28px 28px 28px",
    borderRight: showLayersCard.value ? "2px solid #e4e4e4" : "2px solid white",
  };
});
const filteredDatasets = computed(() => {
  return datasetsInActiveTheme.value.filter(
    (dataset) => dataset.id === "slp" || dataset.id === "cfhp",
  );
});

function openLayersCard() {
  showLayersCard.value = true;
}
function toggleLayersCard(theme) {
  showLayersCard.value = activeTheme === theme ? !showLayersCard.value : true;
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
function openLandingPage() {
  window.open("https://coclicoservices.eu", "_blank");
}
function openWorkbenchPage() {
  window.open("https://github.com/openearth/coclico-workbench", "_blank");
}
function openCatalogPage() {
  window.open(
    "https://radiantearth.github.io/stac-browser/#/external/storage.googleapis.com/coclico-data-public/coclico/coclico-stac-4oct/catalog.json?.language=en",
    "_blank",
  );
}
</script>

<style lang="scss" scoped>
.custom-navigation-drawer {
  display: flex;
  position: absolute;
  left: 0;
  flex-direction: column;
  align-items: center;
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

.list-item-more {
  display: flex;
  justify-content: center;
  margin: 100px auto auto;
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

.item-image-more {
  width: 1.5rem;
  height: 0.5rem;
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

.extra-list-item {
  display: grid;
  place-items: center;
  text-align: center;
  margin-top: 9px;
}

.extra-list-item-container {
  display: grid;
  place-items: center;
  text-align: center;
}

.extra-list-item-text {
  font-size: 8px !important;
  margin-top: 3px;
}

.dataset-card-theme-title {
  margin-top: 10px;
  color: black;
  font-family: "Inter", sans-serif;
  font-size: 20px;
  font-weight: 600;
}
</style>
