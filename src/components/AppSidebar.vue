<template>
  <VNavigationDrawer
    :style="sidebarStyle"
    class="custom-navigation-drawer"
    expand-on-hover
    permanent
    rail
    rail-width="100"
    width="185"
  >
    <VListItem class="image-container">
      <custom-icon class="coclico-image" name="logo" />
    </VListItem>
    <VListItem>
      <span class="counter">
        <VChip prepend-icon="mdi-chart-line">
          {{ activeUserStories.length }} / 1
        </VChip>
        <VChip prepend-icon="mdi-layers-triple-outline">
          {{ activeDatalayers.length }} / 3
        </VChip>
      </span>
    </VListItem>
    <VList ref="tour" nav>
      <VListItem
        v-for="theme in themes"
        :key="theme.name"
        :value="theme.name"
        :active="showLayersCard && activeTheme === theme.name"
        class="list-item"
        color="primary"
        @click="
          toggleLayersCard(theme.name);
          setTheme(theme.name);
        "
      >
        <VListImg class="pa-2 list-item-img">
          <VBadge
            v-if="store.getters['datasets/activeDatasetsInTheme'](theme.name)"
            :content="
              store.getters['datasets/activeDatasetsInTheme'](theme.name)
            "
            color="primary"
          >
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
      <VListItem v-if="userStories?.length">
        <VCardTitle class="layer-card-title"> User stories</VCardTitle>
        <VList class="layer-list">
          <VListItem
            v-for="dataset in userStories"
            :key="dataset.id"
            :aria-label="dataset.title"
          >
            <template v-slot:prepend>
              <VSwitch
                v-model="dataset.active"
                :label="dataset.title"
                class="layer-label"
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
                  <VIcon class="summary-info ml-4" small v-bind="props">
                    mdi-information-outline
                  </VIcon>
                </template>
                <template v-slot:default>
                  <VCard
                    class="tooltip py-2 px-8 rounded bg-grey-darken-3"
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
                class="layer-label"
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
                    class="tooltip py-2 px-8 rounded bg-grey-darken-3"
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
import { computed, ref, watch } from "vue";
import { useStore } from "vuex";
import { useTour } from "@/lib/useTour";
import { marked } from "marked";
import { toast } from "vue-sonner";

const store = useStore();
const showLayersCard = ref(false);
watch(showLayersCard, (show) => {
  if (!show) {
    setTimeout(() => setTheme(null), 100);
  }
});
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
const activeDatalayers = computed(
  () => store.getters["datasets/activeDatalayers"],
);
const activeUserStories = computed(
  () => store.getters["datasets/activeUserStories"],
);
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
const userStories = computed(() =>
  datasetsInActiveTheme.value.filter((dataset) => dataset.isUserStory),
);
const dataLayers = computed(() =>
  datasetsInActiveTheme.value.filter((dataset) => !dataset.isUserStory),
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
  if (
    !dataset.isUserStory &&
    activeDatalayers.value.length > 2 &&
    !activeDatalayers.value.some((layer) => layer.id === dataset.id)
  ) {
    toast.warning(
      "You can only show 3 data layers at a time. Please hide one before showing another.",
    );
    dataset.active = false;
    return;
  }
  if (dataset.isUserStory && activeUserStories.value.length > 0) {
    activeUserStories.value.forEach((story) => {
      if (story.id !== dataset.id) {
        story.active = false;
        store.dispatch("datasets/toggleActiveDataset", story.id);
      }
    });
  }
  await store.dispatch("datasets/toggleActiveDataset", dataset.id);
  await store.dispatch("map/loadDatasetOnMap", dataset.id);
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

  &
    :global(
      .v-navigation-drawer--rail.v-navigation-drawer--is-hovering
        + .custom-data-layers-card
    ) {
    transform: translateX(85px) !important;
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
  padding-inline: 0.5rem;
  display: flex;
  justify-content: center;
  align-items: center;
}

.counter {
  display: grid;
  grid-auto-flow: row;
  place-items: center;
  gap: 0.5rem;

  span {
    font-size: 0.8rem;
  }
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

.layer-label {
  width: 260px;
  white-space: normal !important;
  word-break: break-word;
}
</style>
