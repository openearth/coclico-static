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
          setTheme(theme);
        "
        v-for="(theme, i) in themes"
        :key="i"
        :value="theme"
        color="primary"
      >
        <v-list-img class="pa-2 list-item-img">
          <v-badge color="#068B95" v-if="false">
            <custom-icon
              :name="theme"
              icon-folder="themes"
              class="item-image"
            />
          </v-badge>

          <custom-icon
            v-else
            :name="theme"
            icon-folder="themes"
            class="item-image"
          />
        </v-list-img>
        <v-list-item-title class="list-item-title">{{
          theme
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
        <v-list-item class="list-item-more" @click="openLayersCard()">
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
  </v-navigation-drawer>

  <v-card raised class="pa-0 custom-data-layers-card" v-if="showLayersCard">
    <v-row style="width: 100%; max-height: 60px">
      <v-col>
        <v-card-title class="layer-card-title">
          {{ numberOfDatasetsInTheme }} data layers
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
            <v-list class="layer-list">
              <v-list-item
                v-for="dataset in datasetsInActiveTheme"
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
    };
  },
  methods: {
    ...mapActions("map", ["setActiveTheme", "updateActiveDatasetsArray"]),
    openLayersCard() {
      this.showLayersCard = true;
    },
    setTheme(theme) {
      this.setActiveTheme(theme);
    },
    close() {
      this.showLayersCard = false;
    },
    /* TODO activate and deactivate the layer */
    toggleDataset(dataset) {
      this.updateActiveDatasetsArray(dataset);
    },
  },
  computed: {
    ...mapGetters("map", ["themes", "datasetsInActiveTheme"]),

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
  color: rgb(var(--v-theme-grey80));
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
}
</style>
