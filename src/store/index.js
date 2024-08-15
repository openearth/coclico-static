import map from "./map";
import graphs from "./graphs";

import { createStore } from "vuex";

export default createStore({
  modules: {
    map,
    graphs,
  },
});
