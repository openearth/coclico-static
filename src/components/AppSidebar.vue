<template>
    <v-navigation-drawer
      v-model="drawer"
      mini-variant
      mini-variant-width="200"
      stateless
      fixed
      color="white"
      floating
      class="app-sidebar"
      style="border-right: 1px solid rgba(0, 0, 0, 0.12) !important"
      v-show="!shouldHideDrawer"
    >
      <v-list 
        dense
        class="pa-0"
        dark
      >
        <v-list-item
          class="px-2"
          @click="$router.push({ name: 'home' })"
          data-v-step="1"
        >
          <!-- TODO: add routing -->
          <custom-icon name="coclico-full" class="icon--large" />
          <v-list-item-content
            style="color: black"
          >
            <v-list-item-title>
              CoCliCo
            </v-list-item-title>
          </v-list-item-content>
        </v-list-item>
        <v-divider />
        <v-list-item-group
          color="secondary"
          active-class="active-theme"
        >
          <v-list-item
            class="list-elements"
            style="color: black"
            v-for="item in getThemes" 
            :key="item"
            @click="toggleTheme(item); openLayersCard()" 
            :active="isActive(item)"
          >
          <div class="list-item">
            <v-list-item-icon>
              <custom-icon
                class="ml-8"
                :name="item"
                icon-folder="themes"
              />
            </v-list-item-icon>
            <v-list-item-title>{{ item }}</v-list-item-title>
          </div>
            <v-list-item-content>
              <v-list-item-title>{{ item }}</v-list-item-title>
            </v-list-item-content>
          </v-list-item>
        </v-list-item-group>
      </v-list>
      <v-row
        class="mt-10"
        :align="align"
        no-gutters
      >
        <v-col>
          <div class="list-item">
            <v-btn
              icon
              color="black"
            >
              <v-icon>mdi-magnify</v-icon>
            </v-btn>
            <v-subtitle
              class="text-caption"
            > Search </v-subtitle>
          </div>
        </v-col>
        <v-col>
          <div class="list-item">
            <v-btn
              icon
              color="black"
              @click="expandMenu = !expandMenu"
            >
              <v-icon>mdi-dots-horizontal</v-icon>
            </v-btn>
            <v-subtitle
              v-show="expandMenu"
              class="text-caption"
            > Less </v-subtitle>
            <v-subtitle
              v-show="!expandMenu"
              class="text-caption"
            > More </v-subtitle>
          </div>
        </v-col>
      </v-row>
      <template #append>
        <div v-show="expandMenu">
          <v-list
            dense
            class="pa-0"
            color="terciary"
          >
            <v-list-item @click="openLandingPage">
              <div class="extra-list-item">
                  <v-icon color="black" size="18px">mdi-information-outline</v-icon>
                  <v-list-item-subtitle class="extra-list-item-text">LANDING PAGE</v-list-item-subtitle>
              </div>
              <v-list-item-content>
                <v-list-item-title>Landing page</v-list-item-title>
              </v-list-item-content>
            </v-list-item>
            <v-list-item @click="openStoriesPage">
              <div class="extra-list-item">
                <v-icon color="black" size="18px">mdi-account-details</v-icon>
                <v-list-item-subtitle class="extra-list-item-text">STORIES</v-list-item-subtitle>
              </div>
              <v-list-item-content>
                <v-list-item-title>Stories</v-list-item-title>
              </v-list-item-content>
            </v-list-item>
              <v-list-item @click="openPlatformPage">
                <div class="extra-list-item">
                  <v-icon color="black" size="18px"> mdi-database-search </v-icon>
                  <v-list-item-subtitle class="extra-list-item-text">PLATFORM</v-list-item-subtitle>
                </div>
                <v-list-item-content>
                  <v-list-item-title>Platform</v-list-item-title>
                </v-list-item-content>
              </v-list-item>
              <v-list-item @click="openWorkbenchPage">
                <div class="extra-list-item-container">
                  <v-icon color="black" size="18px"> mdi-hammer </v-icon>
                  <v-list-item-subtitle class="extra-list-item-text">WORKBENCH</v-list-item-subtitle>
                </div>
                <v-list-item-content>
                  <v-list-item-title>Workbench</v-list-item-title>
                </v-list-item-content>
              </v-list-item>
          </v-list>
        </div>
      </template>
    </v-navigation-drawer>
</template>
<script>
  import CustomIcon from '@/components/CustomIcon'
  import { mapGetters, mapMutations } from 'vuex'

  export default {
    components: {
      CustomIcon
    },
    computed: {
      ...mapGetters([ 'getThemes', 'getActiveTheme' ]),
    },
    data() { 
      return { 
        drawer: true,
        mini: true,
        activeTheme: null,
        expandMenu: false,
        shouldHideDrawer: false
      }
    },
    methods: {
      ...mapMutations(['toggleActiveTheme', 'setShowLayersCardOpen' ]),
      openLayersCard (event) {
        this.setShowLayersCardOpen()
      },
      openLandingPage() {
        window.open('https://coclicoservices.eu', '_blank')
      },
      openWorkbenchPage() {
        window.open('https://github.com/openearth/coclico-workbench', '_blank')
      },
      openStoriesPage() {
        window.open(this.$router.resolve({ name: 'stories' }).href, '_blank');
      },
      openPlatformPage() {
        this.$router.push({ name: 'data' })
      },
      toggleTheme (id) {
        this.toggleActiveTheme(id)

        if (this.activeTheme === id) {
          this.activeTheme = null
        } else {
          this.activeTheme = id
        }

        this.$emit('change-theme')
      },
      isActive (id) {
        return this.activeTheme === id
      },
      checkRoute() {
        this.shouldHideDrawer = this.$route.path.endsWith('/stories');
      },
    },
    created() {
      this.checkRoute();
    },
    watch: {
      $route(to) {
        this.checkRoute();
      },
    }
  }
</script>

<style>
.app-sidebar {
  margin-top: var(--spacing-default);
  margin-left: var(--spacing-default);
  height: 100%;
  max-height: calc(100% - 2*(var(--spacing-default)));
}

.list-elements {
  margin-top: 20px;
}

.list-item {
  display: grid;
  place-items: center;
  text-align: center;
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
</style>
