<template>
  <v-dialog
    scrollable
    persistent
    v-model="show"
    :fullscreen="$vuetify.breakpoint.xsOnly"
    :max-width="640"
  >
    <v-card class="d-flex flex-column" style="max-height: 100%;overflow:hidden">
      <v-card-title class="pa-5">
        <v-toolbar-title>CoCliCo Platform (beta) User Agreement</v-toolbar-title>
      </v-card-title>

      <div class="px-5 flex-grow-1 overflow-y-auto" v-html="content" />

      <v-card-actions>
        <div class="pa-2" style="width:100%">
          <form action="" submit.prevent>
            <v-checkbox
              label="I agree with the Conditions of Use"
              class="ma-0"
              v-model="acceptedConditions"
              hide-details
            />
            <v-checkbox
              label="I consent with the use of cookies"
              class="ma-0"
              v-model="acceptedCookies"
              hide-details
            />
          </form>
          <div class="mt-2 d-flex">
            <v-spacer></v-spacer>
            <v-btn
              color="primary"
              :disabled="!allAccepted"
              @click="onStartClick"
            >
              I agree
            </v-btn>
          </div>
        </div>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script>
import { importConfig } from "@/lib/config-utils"

export default {
	data: () => ({
		show: true,
		acceptedConditions: false,
		acceptedCookies: false,
	}),
	computed: {
		allAccepted() {
			return this.acceptedConditions && this.acceptedCookies
		},
		content() {
			return importConfig("assets/legal/user-agreements.md")
		},
	},
	methods: {
		onStartClick() {
			this.show = false
			this.$emit("accepted")
		},
	},
}
</script>
