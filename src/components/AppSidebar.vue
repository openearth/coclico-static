<template>
  <v-navigation-drawer
    permanent
    floating
    rounded="xl"
    width="200"
    class="custom-navigation-drawer"
  >
    <div class="image-container">
      <img :src="coclicoIcon" alt="Coclico Icon" class="coclico-image" />
    </div>
    <v-list>
      <v-list-item class="list-item">
        <v-list-img class="list-item-img">
          <img :src="sealevelsIcon" alt="Sea Levels Icon" class="item-image" />
        </v-list-img>
        <v-list-item-title class="list-item-title"
          >Sea Levels</v-list-item-title
        >
      </v-list-item>
      <v-list-item class="list-item">
        <v-list-img class="list-item-img">
          <img
            :src="naturalhazardsIcon"
            alt="Natural Hazards Icon"
            class="item-image"
          />
        </v-list-img>
        <v-list-item-title class="list-item-title"
          >Natural Hazards</v-list-item-title
        >
      </v-list-item>
      <v-list-item class="list-item">
        <v-list-img class="list-item-img">
          <img
            :src="exposurevulnerabilityIcon"
            alt="Exposure & Vulnerability Icon"
            class="item-image"
          />
        </v-list-img>
        <v-list-item-title class="list-item-title"
          >Exposure & Vulnerability</v-list-item-title
        >
      </v-list-item>
      <v-list-item class="list-item">
        <v-list-img class="list-item-img">
          <img
            :src="riskadaptationIcon"
            alt="Risk & Adaptation Icon"
            class="item-image"
          />
        </v-list-img>
        <v-list-item-title class="list-item-title"
          >Risk & Adaptation</v-list-item-title
        >
      </v-list-item>
    </v-list>
  </v-navigation-drawer>
</template>

<script>
export default {
  data() {
    return {
      coclicoIcon: require("@/assets/icons/icon-coclico-full.svg"),
      sealevelsIcon: require("@/assets/icons/themes/icon-Sea Levels.svg"),
      naturalhazardsIcon: require("@/assets/icons/themes/icon-Natural Hazards.svg"),
      exposurevulnerabilityIcon: require("@/assets/icons/themes/icon-Exposure & Vulnerability.svg"),
      riskadaptationIcon: require("@/assets/icons/themes/icon-Risk & Adaptation.svg"),
    };
  },
};
</script>

<style scoped>
.custom-navigation-drawer {
  margin-top: 50px;
  margin-left: 50px;
  max-height: calc(100% - 2 * (50px));
  display: flex;
  flex-direction: column;
  align-items: center;
}
.image-container {
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
  margin: 40px;
}
.list-item-img {
  display: flex;
  justify-content: center;
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
</style>
