<template>
    <v-dialog v-model="dialog" persistent max-width="800px">
      <v-card>
        <v-card-text>
          <h1 class="mt-4">CoCliCo</h1>
          <p>
            Welcome to the CoCliCo web platform: an application co-designed by all 
            <a href="https://coclicoservices.eu/partners/" target="_blank">CoCliCo partners</a> and stakeholders 
            to inform users on present-day and future coastal risks, with the goal to improve decision-making on 
            risk management and adaptation.
          </p>
          <p>
            If you have any questions about the CoCliCo web platform, please fill in the form on 
            <a href="https://coclicoservices.eu/contact/" target="_blank">https://coclicoservices.eu/contact/</a>.
          </p>

          <h3 class="mt-4 font-italic">Terms of Use</h3>
          <p>
            The CoCliCo web platform (available at 
            <a href="https://platform.coclicoservices.eu/" target="_blank">https://platform.coclicoservices.eu/</a>) 
            was built and is currently managed by Stichting Deltares. The use of the platform is subject to the 
            terms and conditions as described in 
            <a href="https://www.deltares.nl/en/disclaimer" target="_blank">https://www.deltares.nl/en/disclaimer</a>. 
            By visiting and using the CoCliCo web platform you acknowledge that you have read and agreed to these terms.
          </p>
          <p>
            All datasets within CoCliCo are licensed with Creative Commons Attribution 4.0 International (CC-BY-4.0), 
            unless stated differently. Reuse of the information presented on this website is only permitted with 
            proper source attribution.
          </p>
          <p>
            Special attention needs to be paid to the results presented in the platform. These reflect policy-based
            protection standards aggregated at the provincial (NUTS2) level, based on the coastal defence database
            developed within the project. In some regions, such as the North-sea coastline in Germany, no precise
            value of protection standard was found and only the flood map without explicitly incorporating defenses
            has been computed. Further research may update coastal flooding scenarios using updated protection standards.
          </p>

          <h3 class="mt-4 font-italic">Privacy</h3>
          <p>
            Using this website does not require Deltares to process users’ personal data. When you contact CoCliCo, 
            it will process your personal data to handle your question or request. All personal data you provide to 
            CoCliCo will be processed in accordance with the General Data Protection Regulation (EU) 2016/679 and the 
            Dutch GDPR implementation act ('Uitvoeringswet Algemene verordening gegevensbescherming' - Stb 2018, 145). 
            Our Privacy Statement explains when and why we collect data, what data we collect, how it will be processed, 
            and most importantly, how it will be protected. Please read the statement carefully, available on our website.
          </p>

          <h3 class="mt-4 font-italic">Cookies</h3>
          <p>
            This website uses only non-functional cookies.
          </p>
        </v-card-text>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn color="primary" @click="acknowledgeDisclaimer">I accept the terms and conditions</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </template>

<script>
import { mapState, mapActions } from 'vuex'

export default {
  name: 'Disclaimer',
  data () {
    return {
      dialog: !this.disclaimerAcknowledged
    }
  },
  computed: {
    ...mapState(['disclaimerAcknowledged'])
  },
  watch: {
    disclaimerAcknowledged (value) {
      if (value) {
        this.dialog = false
      }
    }
  },
  methods: {
    ...mapActions('disclaimer', ['saveDisclaimerAcknowledgment', 'loadDisclaimerAcknowledgment']),
    acknowledgeDisclaimer () {
      this.saveDisclaimerAcknowledgment(true)
      this.$router.push('/')
    }
  }
}
</script>
