import getCatalog from "@/lib/request/get-catalog";
import _ from "lodash";
export default {
  namespaced: true,
  state: {
    themes: [],
    datasets: [],
  },
  getters: {
    themes(state) {
      return state.themes;
    },
  },
  mutations: {
    ADD_THEME(state, theme) {
      state.themes = [...state.themes, theme];
    },
    ADD_DATASET(state, dataset) {
      state.datasets = [...state.datasets, dataset];
    },
  },
  actions: {
    //TODO:
    loadDatasets({ commit }) {
      //Get STAC collection
      getCatalog(process.env.VUE_APP_CATALOG_URL)
        //1. first  we get the parent catalog
        .then((catalog) => {
          console.log("catalog", catalog);
          //2. read themes from the main catalog
          const keywords = _.get(catalog, "summaries.keywords");
          keywords.forEach((keyword) => commit("ADD_THEME", keyword));
          //3. get collections of the catalog
          const collections = catalog.links.filter((el) => el.rel === "child");
          collections.forEach((collection) => {
            getCatalog(collection.href)
              //get collection information (let's name it dataset)
              .then((dataset) => {
                // 4. exlude dataset with id template
                if (dataset.id !== "template") {
                  // 4.a add summaries to the dataset
                  const summaries =
                    _.get(dataset, "summaries") || _.get(catalog, "summaries");
                  const mappedSummaries = Object.keys(summaries).map((id) => {
                    const summary = _.get(summaries, id);
                    return {
                      id: id,
                      allowedValues: summary,
                      chosenValue: summary[0],
                    };
                  });
                  _.set(dataset, "summaries", mappedSummaries);
                  // 4.b. add variables to the dataset
                  const variables = _.get(dataset, "cube:variables");

                  if (typeof variables !== "undefined") {
                    var mappedVariables = Object.keys(variables).map((id) => {
                      const variable = _.get(variables, id);
                      if (variable.type === "data") {
                        return {
                          id: id,
                        };
                      }
                    });
                    mappedVariables = _.compact(mappedVariables);

                    const mappedVariablesArray = mappedVariables.map(
                      (a) => a.id
                    );
                    if (mappedVariablesArray.length !== 0) {
                      _.set(dataset, "variables", mappedVariablesArray);
                    }
                  }
                  commit("ADD_DATASET", dataset);
                }
              });
          });
        });
    },
  },
};
