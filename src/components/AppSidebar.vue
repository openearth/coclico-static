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
    <VListItem ref="counter">
      <span class="counter">
        <VChip prepend-icon="mdi-comment-account-outline">
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
        ref="handbook"
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
        ref="website"
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
    <div ref="layersPanel">
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
        <VListItem v-if="userStories?.length" ref="userStories">
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
        <VListItem v-if="dataLayers?.length" ref="dataLayers">
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
    </div>
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

useTour({
  id: "sidebar",
  refId: "tour",
  title: "02/11 - Themes",
  location: "end center",
  index: 2,
  description: `CoCliCo is divided into four themes: Sea Levels, Natural Hazards,  Exposure & Vulnerability and Risk & Adaptation. On each of these themes, a dedicated team of scientists worked hard to provide insights into the latest available information relevant for risk management and adaptation. Select a theme to view the available data and user stories.`,
  onTourStep: () => {
    showLayersCard.value = true;
    setTheme(themes.value[2].name);
  },
});

useTour({
  id: "user-stories",
  refId: "userStories",
  title: "03/11 - User stories",
  location: "bottom center",
  index: 3,
  description: `User stories represent post-processed information that comes from aggregating various datasets on a specific geospatial unit (country, regional or municipality level). These were carefully co-designed by our science teams and stakeholders. Toggle user stories on and off to display them on the map. A brief summary of information is again provided in the “i”-button.`,
  onTourStep: () => {
    showLayersCard.value = true;
    setTheme(themes.value[2].name);
  },
});

useTour({
  id: "data-layers",
  refId: "dataLayers",
  title: "04/11 - Data layers",
  location: "bottom center",
  index: 4,
  description: `Data layers represent the data directly available from the efforts by the science teams in CoCliCo. Toggle data layers on and off to display them on the map. A brief overview on the information related to the data layer could be retrieved by the “i”-button next to it. There is always more information available in the Handbook [https://www.openearth.nl/coclico-workbench/], explained later in this tour.`,
  onTourStep: () => {
    showLayersCard.value = true;
    setTheme(themes.value[2].name);
  },
  onAfterTourStep: () => {
    showLayersCard.value = false;
  },
});

useTour({
  id: "background-layers",
  refId: "layersPanel",
  title: "05/11 - Background layers",
  location: "bottom center",
  index: 5,
  description: `CoCliCo provides user story information on three geospatial units; country (NUTS0), regional (NUTS2) and municipality (LAU) level. These layers can be toggled on and off for navigational purposes. Only the “coastal” units are delimited, meaning area that could potentially be influenced by coastal hazards and sea level rise.`,
  onTourStep: () => {
    showLayersCard.value = true;
    setTheme(themes.value[themes.value.length - 1].name);
  },
  onAfterTourStep: () => {
    showLayersCard.value = false;
  },
});

useTour({
  id: "counter",
  refId: "counter",
  title: "06/11 - Limitations on visualizations",
  location: "bottom center",
  index: 6,
  description: `We have limited your visualization flexibility a bit by only allowing one user story to be toggled on at a time for clarity purposes. Besides this, you can at most toggle on three data layers simultaneously. Beyond this amount of layers visible on the platform, we feel the message of the user stories and data layers becomes blurred and difficult to interpret.`,
});

useTour({
  id: "handbook",
  refId: "handbook",
  title: "07/11 - Handbook",
  location: "end center",
  index: 7,
  description: `CoCliCo is more than only the web platform! It contains a passive data repository and a workbench as well. Regarding the former, there are 44 cloud-native datasets in the CoCliCo STAC catalog. Only the most relevant ones and most suitable for interaction are presented in the web platform but we encourage you to take a look at the others. The workbench allows you to interact directly with all the data in the catalog (and hence in the platform as well) through an (online or offline) coding environment. The handbook details how to use the repository and the workbench. It also elaborates on targeted users and provides more contextual information to understand the data layers and user stories.`,
});

useTour({
  id: "website",
  refId: "website",
  title: "08/11 - Project website",
  description: `To get more information on CoCliCo in general, please visit the website by clicking here. Among other things you will find the complete project description, a list of the involved partners and details about the work packages. Also the full publications, papers and policy briefs can be found here. There’s also a possibility to get in touch with the CoCliCo consortium through an online form.`,
  location: "end center",
  index: 8,
});
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
