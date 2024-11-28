<template>
  <v-navigation-drawer
    permanent
    floating
    width="200"
    class="custom-navigation-drawer"
    :style="sidebarStyle"
  >
    <div class="image-container">
      <custom-icon name="coclico-full" class="coclico-image" />
    </div>
    <v-list>
      <v-list-item
        class="list-item"
        @click="
          openLayersCard();
          setTheme(theme.name);
        "
        v-for="(theme, i) in themes"
        :key="i"
        color="primary"
        :value="theme.name"
      >
        <v-list-img class="pa-2 list-item-img">
          <v-badge color="primary" v-if="theme.count" :content="theme.count">
            <custom-icon
              :name="theme.name"
              icon-folder="themes"
              class="item-image"
            />
          </v-badge>

          <custom-icon
            v-else
            :name="theme.name"
            icon-folder="themes"
            class="item-image"
          />
        </v-list-img>
        <v-list-item-title class="list-item-title">{{
          theme.name
        }}</v-list-item-title>
      </v-list-item>
      <v-list>
        <v-list-item class="list-item" @click="openLayersCard()">
          <v-list-img class="list-item-img">
            <custom-icon
              name="Search"
              icon-folder="themes"
              class="item-image"
            />
          </v-list-img>
          <v-list-item-title class="list-item-title">Search</v-list-item-title>
        </v-list-item>
        <v-list-item class="list-item-more" @click="expandMenu = !expandMenu">
          <v-list-img class="list-item-img">
            <custom-icon
              name="More"
              icon-folder="themes"
              class="item-image-more"
            />
          </v-list-img>
          <v-list-item-title class="list-item-title"></v-list-item-title>
        </v-list-item>
      </v-list>
    </v-list>
    <template #append>
      <div v-show="expandMenu">
        <v-list dense class="pa-0">
          <v-list-item @click="openLandingPage">
            <div class="extra-list-item">
              <v-icon color="black" size="18px">
                mdi-information-outline
              </v-icon>
              <v-list-item-subtitle class="extra-list-item-text">
                WEBSITE
              </v-list-item-subtitle>
            </div>
          </v-list-item>
          <v-list-item @click="openCatalogPage">
            <div class="extra-list-item">
              <v-icon color="black" size="18px"> mdi-database-search </v-icon>
              <v-list-item-subtitle class="extra-list-item-text">
                DATA CATALOG
              </v-list-item-subtitle>
            </div>
          </v-list-item>
          <v-list-item @click="openWorkbenchPage">
            <div class="extra-list-item-container">
              <v-icon color="black" size="18px"> mdi-hammer </v-icon>
              <v-list-item-subtitle class="extra-list-item-text">
                WORKBENCH
              </v-list-item-subtitle>
            </div>
          </v-list-item>
        </v-list>
      </div>
    </template>
  </v-navigation-drawer>

  <v-card raised class="pa-0 custom-data-layers-card" v-if="showLayersCard">
    <v-row style="width: 100%; max-height: 60px">
      <v-col>
        <v-card-title class="dataset-card-theme-title">
          {{ activeTheme }}
        </v-card-title>
      </v-col>
      <v-col class="column-right">
        <v-btn icon @click="close" flat class="close-button">
          <v-icon>mdi-close</v-icon>
        </v-btn>
      </v-col>
    </v-row>

    <v-row style="width: 100%">
      <v-col>
        <v-row>
          <v-col style="min-width: 80%">
            <v-card-title
              class="layer-card-title"
              v-if="filteredDatasets.length"
            >
              User stories
            </v-card-title>
            <v-list class="layer-list" v-if="filteredDatasets.length">
              <v-list-item
                v-for="dataset in filteredDatasets"
                :key="dataset.id"
                :title="dataset.title"
              >
                <template v-slot:prepend>
                  <v-switch
                    v-model="dataset.active"
                    hide-details
                    class="mr-5"
                    color="primary"
                    @change="toggleDataset(dataset)"
                  ></v-switch>
                </template>
              </v-list-item>
            </v-list>

            <v-card-title class="layer-card-title"> Data layers </v-card-title>
            <v-list class="layer-list">
              <v-list-item
                v-for="dataset in datasetsInActiveTheme.filter(
                  (dataset) =>
                    dataset.id !== 'slp' &&
                    dataset.id !== 'cfhp' &&
                    dataset.id !== 'cba'
                )"
                :key="dataset.id"
                :title="dataset.title"
              >
                <template v-slot:prepend>
                  <v-switch
                    v-model="dataset.active"
                    hide-details
                    class="mr-5"
                    color="primary"
                    @change="toggleDataset(dataset)"
                  ></v-switch>
                </template>
              </v-list-item>
            </v-list>
          </v-col>
        </v-row>
      </v-col>
    </v-row>
  </v-card>
</template>

<script>
import { mapGetters, mapActions } from "vuex";
import CustomIcon from "@/components/CustomIcon.vue";
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
    ...mapActions("map", [
      "setActiveTheme",
      "updateActiveDatasetsArray",
      "updateThemeObject",
    ]),
    openLayersCard() {
      this.showLayersCard = true;
    },
    setTheme(theme) {
      this.setActiveTheme(theme);
    },
    close() {
      this.showLayersCard = false;
    },
    toggleDataset(dataset) {
      this.updateActiveDatasetsArray(dataset);
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
    ...mapGetters("map", ["themes", "datasetsInActiveTheme", "activeTheme"]),

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
        (dataset) =>
          dataset.id === "slp" || dataset.id === "cfhp" || dataset.id === "cba"
      );
    },
  },
};
</script>

<style scoped>
.custom-navigation-drawer {
  margin-top: 30px;
  margin-left: 50px;
  max-height: calc(100% - 2 * (30px));
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
  top: 30px;
  left: 250px;
  z-index: 5;
  width: 40vw;
  max-width: 500px;
  min-width: 250px;
  border-radius: 0px 28px 28px 0px;
  box-shadow: none;
  height: 100%;
  max-height: calc(100% - 2 * (30px));
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
  margin-top: -15px;
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
  margin-top: 9px;
  margin-bottom: 9px;
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
