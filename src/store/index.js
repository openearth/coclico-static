import map from "./map";
import graphs from "./graphs";
import dashboard from "./dashboard";

import { createStore } from "vuex";

export default createStore({
  modules: {
    map,
    graphs,
    dashboard,
  },
});
