<template>
  <v-card flat>
    <v-container>
      <v-row>
        <v-col cols="6">
          <v-select label="Report" :items="['AR5']" outlined dense></v-select>
        </v-col>
        <v-col cols="6">
          <v-select
            label="Return Period"
            :items="['5']"
            outlined
            dense
          ></v-select>
        </v-col>
      </v-row>
      <v-row>
        <v-col cols="12">
          <v-select
            label="Scenarios"
            :items="['Historical']"
            outlined
            dense
          ></v-select>
        </v-col>
      </v-row>
      <v-row>
        <v-col cols="12">
          <p class="text-style">
            Select an element in the map for specific location analysis.
          </p>
        </v-col>
      </v-row>
    </v-container>
  </v-card>
</template>
<style>
.text-style {
  background: #f0f0f0;
}
</style>
