<template>
  <v-card color="background">
    <v-navigation-drawer
      v-model="drawer"
      :mini-variant.sync="mini"
      stateless
      fixed
      expand-on-hover
      color="background"
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
          <v-list-item-content>
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
            v-for="item in getThemes" 
            :key="item"
          >
            <v-list-item-icon class="mr-6">
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
        <div class="mb-4">
          <v-list
            dense
            class="pa-0"
            color="terciary"
          >
            <v-list-item @click="openLandingPage">
              <v-list-item-icon class="mr-6">
                <v-icon color="black">mdi-information-outline</v-icon>
              </v-list-item-icon>
              <v-list-item-content>
                <v-list-item-title>Landing page</v-list-item-title>
              </v-list-item-content>
            </v-list-item>
            <v-list-item-group active-class="active-theme">
            <v-list-item @click="openStoriesPage">
              <v-list-item-icon class="mr-6">
                <v-icon color="black">mdi-account-details</v-icon>
              </v-list-item-icon>
              <v-list-item-content>
                <v-list-item-title>Stories</v-list-item-title>
              </v-list-item-content>
            </v-list-item>
              <v-list-item @click="openPlatformPage">
                <v-list-item-icon class="mr-6">
                  <v-icon color="black"> mdi-database-search </v-icon>
                </v-list-item-icon>
                <v-list-item-content>
                  <v-list-item-title>Platform</v-list-item-title>
                </v-list-item-content>
              </v-list-item>
            </v-list-item-group>
              <v-list-item @click="openWorkbenchPage">
                <v-list-item-icon class="mr-6">
                  <v-icon color="black"> mdi-hammer </v-icon>
                </v-list-item-icon>
                <v-list-item-content>
                  <v-list-item-title data-v-step="6">Workbench</v-list-item-title>
                </v-list-item-content>
              </v-list-item>
          </v-list>
        </div>
        <div>
          <v-list
            dense
            class="pa-0"
            color="secondary"
          >
            <v-list-item @click="$emit('toggle-tour')">
              <v-list-item-icon class="mr-6">
                <v-icon color="black">mdi-flag-outline</v-icon>
              </v-list-item-icon>
              <v-list-item-content>
                <v-list-item-title>Tour</v-list-item-title>
              </v-list-item-content>
            </v-list-item>
            <v-list-item-group active-class="active-theme">
              <v-list-item @click="$emit('toggle-about')">
                <v-list-item-icon class="mr-6">
                  <custom-icon name="info" />
                </v-list-item-icon>
                <v-list-item-content>
                  <v-list-item-title>About</v-list-item-title>
                </v-list-item-content>
              </v-list-item>
              <v-list-item @click="$emit('toggle-account')">
                <v-list-item-icon class="mr-6">
                  <custom-icon name="account" />
                </v-list-item-icon>
                <v-list-item-content>
                  <v-list-item-title data-v-step="6">
                    Account
                  </v-list-item-title>
                </v-list-item-content>
              </v-list-item>
            </v-list-item-group>
          </v-list>
        </div>
      </template>
    </v-navigation-drawer>
  </v-card>
</template>
<script>
  import CustomIcon from '@/components/CustomIcon'
  import { mapGetters } from 'vuex'

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
      }
    }
  }
</script>

