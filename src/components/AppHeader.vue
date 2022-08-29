<template>
  <v-app-bar
    app
    height="57px"
    clipped-left
    color="background"
    flat
  >
    <v-spacer />
    
    <v-stepper
      class="pa-0"
      flat
      non-linear
      elevation="0"
      width="800px"
      height="57px" 
      dark
    >
      <v-stepper-header
        class="stepper-header"
        flat
      >
        <template
          v-for="(stepper, index) in steppers"
        >
          <v-stepper-step
            :color="stepper.color"
            complete
            editable
            :edit-icon="stepper.icon"
            :step="stepper.step"
            class="stepper-icon py-0"
            :key="stepper.name"
            @click="stepperAction(stepper.name)"
          >
            {{ stepper.name }}
          </v-stepper-step>
          <v-divider
            v-if="stepper.step !== steppers.length"
            :key="index"
          />
        </template>
      </v-stepper-header>
    </v-stepper>
    <v-spacer />
  </v-app-bar>
</template>
<script>
  import {mapGetters} from 'vuex'  
  export default { 
    computed: {
      ...mapGetters([ 'steppers' ])
    },
    methods: {
      stepperAction (name) {
        // For workbench in stepper, open workbench page in seperate panel
        if (name === 'Workbench') {
          window.open("https://github.com/openearth/coclico-workbench", "_blank");
        } else if (name === 'Stories') {
          this.$router.push({ name: 'stories' })
        } else if (name === 'Platform') {
          this.$router.push({ name: 'data' })
        } else if (name === 'Landing page') {
          window.open("https://coclicoservices.eu", "_blank");
        }
      }
    }
  }
</script>
<style>

.stepper-header {
  background-color: var(--v-background-base);
  padding: 0px 0px 16px 2px;
}

</style>
