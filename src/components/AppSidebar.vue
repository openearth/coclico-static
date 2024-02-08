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
      <v-list-item
        prepend-icon="mdi-view-dashboard"
        title="Dashboard"
      ></v-list-item>
      <v-list-item prepend-icon="mdi-account-box" title="Account"></v-list-item>
      <v-list-item prepend-icon="mdi-gavel" title="Admin"></v-list-item>
    </v-list>
  </v-navigation-drawer>
</template>

<script>
export default {
  data() {
    return {
      coclicoIcon: require("@/assets/icons/icon-coclico-full.svg"),
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
</style>
