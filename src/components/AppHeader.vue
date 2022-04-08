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
      class="stepper pa-0"
      flat
      non-linear
      elevation="0"
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
    }
  }
</script>
<style>
.stepper {
  width: 800px;
  height: 57px;
  box-shadow: 0px 0px 0px;
}

.stepper-header {
  background-color: var(--v-background-base);
  padding: 0px 0px 16px 2px;
}

</style>
