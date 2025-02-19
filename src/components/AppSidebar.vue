<template>
  <VNavigationDrawer
    permanent
    floating
    width="200"
    class="custom-navigation-drawer"
    :style="sidebarStyle"
  >
    <div class="image-container">
      <custom-icon name="coclico-full" class="coclico-image" />
    </div>
    <VList>
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
                  <VIcon color="black" size="18px"> mdi-database-search </VIcon>
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

  <VCard raised class="pa-0 custom-data-layers-card" v-if="showLayersCard">
    <VRow style="width: 100%; max-height: 60px">
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

    <VRow style="width: 100%">
      <VCol>
        <VRow>
          <VCol style="min-width: 80%">
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
            <VCardTitle class="layer-card-title"> Data layers</VCardTitle>
            <VList class="layer-list">
              <VListItem
                v-for="dataset in this.datasetsInActiveTheme.filter(
                  ({ id }) => id !== 'slp' && id !== 'cfhp'
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
          </VCol>
        </VRow>
      </VCol>
    </VRow>
  </VCard>
</template>

<script>
import { mapActions, mapGetters } from "vuex";
import CustomIcon from "@/components/CustomIcon.vue";
import { mergeProps } from "vue";

export default {
  components: {
    CustomIcon,
  },
  data() {
    return {
      showLayersCard: false,
      expandMenu: false,
    };
  },
  methods: {
    mergeProps,
    ...mapActions("datasets", [
      "setActiveTheme",
      "toggleActiveDataset",
      "updateThemeObject",
    ]),
    ...mapActions("map", ["loadDatasetOnMap"]),
    openLayersCard() {
      this.showLayersCard = true;
    },
    toggleLayersCard(theme) {
      this.showLayersCard =
        this.activeTheme === theme ? !this.showLayersCard : true;
    },
    setTheme(theme) {
      this.setActiveTheme(theme);
    },
    close() {
      this.showLayersCard = false;
    },
    async toggleDataset(dataset) {
      this.toggleActiveDataset(dataset.id);
      await this.loadDatasetOnMap(dataset.id);
      this.updateThemeObject();
    },
    openLandingPage() {
      window.open("https://coclicoservices.eu", "_blank");
    },
    openWorkbenchPage() {
      window.open("https://github.com/openearth/coclico-workbench", "_blank");
    },
    openCatalogPage() {
      window.open(
        "https://radiantearth.github.io/stac-browser/#/external/storage.googleapis.com/coclico-data-public/coclico/coclico-stac-4oct/catalog.json?.language=en",
        "_blank"
      );
    },
  },
  computed: {
    ...mapGetters("datasets", [
      "themes",
      "datasetsInActiveTheme",
      "activeTheme",
    ]),
    sidebarStyle() {
      return {
        borderRadius: this.showLayersCard
          ? "28px 0px 0px 28px"
          : "28px 28px 28px 28px",
        borderRight: this.showLayersCard
          ? "2px solid #e4e4e4"
          : "2px solid white",
      };
    },
    numberOfDatasetsInTheme() {
      return this.datasetsInActiveTheme.length;
    },
    filteredDatasets() {
      return this.datasetsInActiveTheme.filter(
        (dataset) => dataset.id === "slp" || dataset.id === "cfhp"
      );
    },
  },
};
</script>

<style scoped>
.custom-navigation-drawer {
  margin-top: 25px;
  margin-left: 25px;
  max-height: calc(100% - 2 * (25px));
  display: flex;
  flex-direction: column;
  align-items: center;
}

.image-container {
  margin-top: 20px;
  display: flex;
  justify-content: center;
  align-items: center;
}

.coclico-image {
  width: 8rem;
  height: 4rem;
}

.list-item {
  display: flex;
  justify-content: center;
  margin: auto;
  margin-top: 20px;
  border-radius: 5px !important;
}

.list-item-more {
  display: flex;
  justify-content: center;
  margin: auto;
  margin-top: 100px;
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
  white-space: normal;
  text-align: center;
  font-size: 14px;
  line-height: 20px;
}

.item-image {
  width: 2.5rem;
  height: 1.5rem;
}

.item-image-more {
  width: 1.5rem;
  height: 0.5rem;
}

.custom-data-layers-card {
  position: absolute;
  display: flex;
  align-items: center;
  flex-direction: column;
  top: 25px;
  left: 225px;
  z-index: 5;
  width: 40vw;
  max-width: 500px;
  min-width: 250px;
  border-radius: 0px 28px 28px 0px;
  box-shadow: none;
  height: 100%;
  max-height: calc(100% - 2 * (25px));
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
