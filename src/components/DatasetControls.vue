<template>
  <v-row>
    <v-col cols="12" sm="6">
      <v-select label="Report" :items="['AR5']" outlined dense></v-select>
    </v-col>
    <v-col cols="12" sm="6">
      <v-select label="Return Period" :items="['5']" outlined dense></v-select>
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
      <!-- Custom slider component -->
      <v-slider
        v-model="sliderValue"
        :min="0"
        :max="3"
        :step="0.1"
        thumb-label="always"
      ></v-slider>
    </v-col>
  </v-row>
  <v-row>
    <v-col cols="12">
      <v-btn color="primary" @click="selectMapElement">
        Select an element in the map for specific location analysis.
      </v-btn>
    </v-col>
  </v-row>
</template>
