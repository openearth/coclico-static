<template>
    <v-app-bar
       app
        height="57px"
        clipped-left
        color="#068B95"
        flat
      >
      <v-spacer/>
      <v-spacer>
         <v-stepper
          class="stepper pa-0"
          flat
          non-linear
          color="#068B95"
          elevation="0"
        >
          <v-stepper-header class="stepper-header" flat>
            <v-stepper-step
              color="#ffa827"
              complete
              editable
              edit-icon="mdi-information-outline"
              step="1"
              class="stepper-icon py-0"
            >
              Landing page
            </v-stepper-step>
            <v-divider/>
            <v-stepper-step
              color="#ffa827"
              complete
              editable
              edit-icon="mdi-account-details"
              step="2"
              class="stepper-icon py-0"
            >
              Stories
            </v-stepper-step>
            <v-divider/>
            <v-stepper-step
              color="#ffa827"
              complete
              editable
              edit-icon="mdi-database-search"
              step="3"
              class="stepper-icon py-0"
            >
              Platform
            </v-stepper-step>
            <v-divider/>
            <v-stepper-step
              class="py-0"
              color="#ffa827"
              complete
              editable
              edit-icon="mdi-hammer"
              step="4"
            >
              Workbench
            </v-stepper-step>
          </v-stepper-header>
        </v-stepper>     	
      </v-spacer>
    </v-app-bar>
</template>
<style lang="css" scoped>
.stepper {
  width: 800px;
  height: 57px;
  box-shadow: 0px 0px 0px;
}

.stepper-header {
  background-color: #068B95;
  padding: 0px 0px 16px 2px;
}
</style>
