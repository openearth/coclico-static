<template>
  <v-navigation-drawer
    permanent
    floating
    width="200"
    class="custom-navigation-drawer"
    :style="sidebarStyle"
  >
    <div class="image-container">
      <custom-icon name="coclico-full" />
    </div>
    <v-list>
      <v-list-item class="list-item" @click="openLayersCard()">
        <v-list-img class="list-item-img">
          <img :src="sealevelsIcon" alt="Sea Levels Icon" class="item-image" />
        </v-list-img>
        <v-list-item-title class="list-item-title"
          >Sea Levels</v-list-item-title
        >
      </v-list-item>

      <v-list-item class="list-item" @click="openLayersCard()">
        <v-list-img class="list-item-img">
          <img :src="searchIcon" alt="Search Icon" class="item-image" />
        </v-list-img>
        <v-list-item-title class="list-item-title">Search</v-list-item-title>
      </v-list-item>
      <v-list-item class="list-item-more" @click="openLayersCard()">
        <v-list-img class="list-item-img">
          <img :src="moreIcon" alt="More Icon" class="item-image-more" />
        </v-list-img>
        <v-list-item-title class="list-item-title"></v-list-item-title>
      </v-list-item>
    </v-list>
  </v-navigation-drawer>

  <v-card raised class="pa-0 custom-data-layers-card" v-if="showLayersCard">
    <v-row style="width: 100%; max-height: 60px">
      <v-col>
        <v-card-title class="layer-card-title"> 9 data layers </v-card-title>
      </v-col>
      <v-col class="column-right">
        <v-btn icon @click="close" flat class="close-button">
          <v-icon>mdi-close</v-icon>
        </v-btn>
      </v-col>
    </v-row>
    <v-row style="width: 100%">
      <v-col>
        <v-card-title class="layer-category-title"> Category 1 </v-card-title>
        <v-row>
          <v-col style="min-width: 80%">
            <v-list :items="category1Items" class="layer-list">
              <template v-slot:prepend>
                <v-switch hide-details class="mr-5" color="#068b95"></v-switch>
              </template>
            </v-list>
          </v-col>
          <v-col> </v-col>
        </v-row>
      </v-col>
    </v-row>
    <v-row style="width: 100%">
      <v-col>
        <v-card-title class="layer-category-title"> Category 2 </v-card-title>
        <v-row>
          <v-col style="min-width: 80%">
            <v-list :items="category2Items" class="layer-list">
              <template v-slot:prepend>
                <v-switch hide-details class="mr-5" color="#068b95"></v-switch>
              </template>
            </v-list>
          </v-col>
          <v-col> </v-col>
        </v-row>
      </v-col>
    </v-row>
  </v-card>
</template>

<script>
import CustomIcon from "@/components/CustomIcon.vue";
export default {
  components: {
    CustomIcon,
  },
  data() {
    return {
      /*   sealevelsIcon: require("@/assets/icons/themes/icon-Sea Levels.svg"),
      naturalhazardsIcon: require("@/assets/icons/themes/icon-Natural Hazards.svg"),
      exposurevulnerabilityIcon: require("@/assets/icons/themes/icon-Exposure & Vulnerability.svg"),
      riskadaptationIcon: require("@/assets/icons/themes/icon-Risk & Adaptation.svg"),
      searchIcon: require("@/assets/icons/themes/icon-Search.svg"),
      moreIcon: require("@/assets/icons/themes/icon-More.svg"), */
      showLayersCard: false,
      category1Items: [
        {
          title: "Sea level projections",
        },
        {
          title: "Vertical land motions (subsidence)",
        },
        {
          title: "Wave projections",
        },
        {
          title: "IBI-CSS-SL",
        },
      ],
      category2Items: [
        {
          title: "Storm surge and wave climate",
        },
        {
          title: "Total water level",
        },
        {
          title: "Extreme storm surge levels",
        },
        {
          title: "Extreme wave energy flux",
        },
        {
          title: "Extreme sea level",
        },
      ],
    };
  },
  methods: {
    openLayersCard() {
      this.showLayersCard = true;
    },
    close() {
      this.showLayersCard = false;
    },
  },
  computed: {
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
  color: #a9b0b5;
}
.layer-card-title {
  margin-top: 10px;
  color: #a9b0b5;
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
  color: #068b95;
  font-family: "Inter", sans-serif;
  text-transform: uppercase;
  font-size: 12px;
  font-weight: 600;
}
.layer-list {
  color: #293a45;
  font-family: "Inter", sans-serif;
  font-size: 12px;
}
</style>
