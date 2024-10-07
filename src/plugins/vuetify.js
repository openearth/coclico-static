// Styles
import "@mdi/font/css/materialdesignicons.css";
import "vuetify/styles";

// Vuetify
import { createVuetify } from "vuetify";

export default createVuetify({
  theme: {
    defaultTheme: "rwsTheme",
    themes: {
      rwsTheme: {
        dark: false,
        colors: {
          primary: "#068b95",
          terciary: "#b8e5f0",
          black100: "#000000",
          black80: "#293a45",
          white100: "#ffffff",
          grey80: "#a9b0b5",
        },
      },
    },
  },
});
// https://vuetifyjs.com/en/introduction/why-vuetify/#feature-guides
