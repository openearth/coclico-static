<template>
  <v-flex class="stories pl-15">
    <v-row>
      <v-col cols="8" class="pa-4">
        <v-container>
          <h2 class="h2">
            Stories
          </h2>
          <div v-for="theme in stories" :key="theme.id">
             <stories-layout :theme="theme.theme" :stories="theme.stories"/>
          </div>
        </v-container>
      </v-col>
      <v-col cols="4" class="pa-4">
         <v-container>
          <h2 class="h2">
            News
          </h2>
          <news-layout :feeds="news"/>
        </v-container>
      </v-col>
    </v-row>
    <v-img
      max-width="200px"
      contain
      class="background-logo"
      src="icon"
    />
  </v-flex>
</template>

<script>
  import { mapActions, mapGetters } from 'vuex'
  import StoriesLayout from '@/components/StoriesLayout.vue'
  import NewsLayout from '@/components/NewsLayout.vue'

  export default {
    name: 'StoriesMenu',
    components: {
      StoriesLayout,
      NewsLayout
    },
    mounted () {
      this.loadNews()
      this.loadStories()
    },
    computed: {
      ...mapGetters(['stories', 'news']),
      icon () {
        return require('../assets/icons/icon-coclico.svg')
      }
    },
    methods: {
      ...mapActions(['loadNews', 'loadStories'])
    }
  }
  </script>

  <style scoped>
  .stories {
    width: 100%;
    height: 100%;
    background-size: cover;
    background-color: rgb(240,240,240);
  }

  .background-logo {
    position: absolute;
    bottom: var(--spacing-default);
    right: var(--spacing-default);
  }

</style>
