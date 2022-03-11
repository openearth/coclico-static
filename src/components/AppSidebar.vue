<template>
    <v-navigation-drawer
      v-model="drawer"
      :mini-variant.sync="mini"
      stateless
      fixed
      light
      expand-on-hover
      color="#068B95"
    >
     <v-list dense class="pa-0">
        <v-list-item class="px-2">
          <v-list-item-avatar >
            <custom-icon name="coclico" />
          </v-list-item-avatar>
          <v-list-item-content>
            <v-list-item-title color="#068B95">CoCliCo</v-list-item-title>
          </v-list-item-content>
        </v-list-item>
        <v-divider></v-divider>
       <v-list-item-group color="#ffa827">
              <v-list-item-icon class="ml-4">
              <custom-icon name="Flooding" iconFolder="themes"/>
            </v-list-item-icon>
          </v-list-item>
        </v-list-item-group>
      </v-list>
      <template v-slot:append>
        <div>
          <v-list dense class="pa-0" color="#ffa827">
              <v-list-item-group color="#ffa827">
              <v-list-item>
                <v-list-item-icon class="mr-6" >
                  <custom-icon name="info"/>
                </v-list-item-icon>
                <v-list-item-content>
                  <v-list-item-title>About</v-list-item-title>
                </v-list-item-content>
              </v-list-item>
            </v-list-item-group>
          </v-list>
        </div>
      </template>
  </v-navigation-drawer>
</template>


<script>
import CustomIcon from '@/components/CustomIcon'

export default {
  components: {
    CustomIcon
  },
  data () {
    return {
      drawer: true,
      mini: true,
    }
  }
 }
</script>

<style>
.active-theme {
  color: var(--v-blue100-base) !important;
}
</style>
