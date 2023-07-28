<template>
    <v-navigation-drawer
      v-model="drawer"
      mini-variant
      mini-variant-width="100"
      expand-on-hover
      stateless
      fixed
      color="white"
      floating
      class="app-sidebar"
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
          <v-list-item-avatar>
            <custom-icon name="coclico" />
          </v-list-item-avatar>
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
            @click="toggleTheme(item)"
            :active="isActive(item)"
          >
            <v-list-item-icon>
              <custom-icon
                :name="item"
                icon-folder="themes"
              />
            </v-list-item-icon>
            <v-list-item-content>
              <v-list-item-title>{{ item }}</v-list-item-title>
            </v-list-item-content>
          </v-list-item>
        </v-list-item-group>
      </v-list>
      <template #append>
        <div>
          <v-list
            dense
            class="pa-0"
            color="terciary"
          >
            <v-list-item @click="openLandingPage">
              <div class="extra-list-item">
                  <v-icon color="black">mdi-information-outline</v-icon>
                  <v-list-item-subtitle class="extra-list-item-text">LANDING PAGE</v-list-item-subtitle>
              </div>
              <v-list-item-content>
                <v-list-item-title>Landing page</v-list-item-title>
              </v-list-item-content>
            </v-list-item>
            <v-list-item @click="openStoriesPage">
              <div class="extra-list-item">
                <v-icon color="black">mdi-account-details</v-icon>
                <v-list-item-subtitle class="extra-list-item-text">STORIES</v-list-item-subtitle>
              </div>
              <v-list-item-content>
                <v-list-item-title>Stories</v-list-item-title>
              </v-list-item-content>
            </v-list-item>
              <v-list-item @click="openPlatformPage">
                <div class="extra-list-item">
                  <v-icon color="black"> mdi-database-search </v-icon>
                  <v-list-item-subtitle class="extra-list-item-text">PLATFORM</v-list-item-subtitle>
                </div>
                <v-list-item-content>
                  <v-list-item-title>Platform</v-list-item-title>
                </v-list-item-content>
              </v-list-item>
              <v-list-item @click="openWorkbenchPage">
                <div class="extra-list-item-container">
                  <v-icon color="black"> mdi-hammer </v-icon>
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
        activeTheme: null
      }
    },
    methods: {
      ...mapMutations(['toggleActiveTheme']),
      openLandingPage() {
        window.open('https://coclicoservices.eu', '_blank')
      },
      openWorkbenchPage() {
        window.open('https://github.com/openearth/coclico-workbench', '_blank')
      },
      openStoriesPage() {
        this.$router.push({ name: 'stories' })
      },
      openPlatformPage() {
        this.$router.push({ name: 'data' })
      },
      toggleTheme (id) {
        console.log('try change theme')
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
  margin-top: 45px;
}

.extra-list-item {
  display: grid;
  place-items: center;
  text-align: center;
  margin-top: 20px;
}

.extra-list-item-container {
  display: grid;
  place-items: center;
  text-align: center;
  margin-top: 20px;
  margin-bottom: 20px;
}

.extra-list-item-text {
  font-size: 10x !important;
  margin-top: 4px;
}
</style>
