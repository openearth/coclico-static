import map from "./map";
import graphs from "./graphs";
import dashboard from "./dashboard";
import datasets from "./datasets";

import { createStore } from "vuex";

export default createStore({
  modules: {
    map,
    graphs,
    dashboard,
    datasets,
  },
});
