export default {
  namespaced: true,
  state: {
    isOnTour: false,
    tourStep: undefined,
    tourSteps: [],
  },
  getters: {
    isOnTour: (state) => state.isOnTour,
    tourStepIndex: (state) => state.tourStep,
    tourStepId: (state) => state.tourSteps[state.tourStep]?.id,
    currentTourStep: (state) => state.tourSteps[state.tourStep],
    hasNextTourStep: (state) => state.tourStep < state.tourSteps.length - 1,
    hasPreviousTourStep: (state) => state.tourStep > 0,
  },
  mutations: {
    SET_TOUR_STEP(state, step) {
      state.tourStep = step;
    },
    SET_TOUR_STEPS(state, steps) {
      state.tourSteps = steps;
    },
    SET_TOUR(state, isOnTour) {
      state.isOnTour = isOnTour;
    },
  },
  actions: {
    addTourStep({ commit, state }, step) {
      const existingIndex = state.tourSteps.findIndex(
        ({ id }) => id === step.id,
      );

      if (!step?.index) {
        step.index = state.tourSteps.length;
      }

      let steps;
      if (existingIndex !== -1) {
        // Replace existing step
        steps = [
          ...state.tourSteps.slice(0, existingIndex),
          step,
          ...state.tourSteps.slice(existingIndex + 1),
        ];
      } else {
        // Add new step
        steps = [...state.tourSteps, step];
      }

      // Sort by index to ensure proper order
      steps = steps.sort((a, b) => a.index - b.index);

      commit("SET_TOUR_STEPS", steps);
    },
    setTourSteps({ commit }, steps) {
      commit("SET_TOUR_STEPS", steps);
    },
    startTour({ commit }) {
      commit("SET_TOUR", true);
      commit("SET_TOUR_STEP", 0);
    },
    stopTour({ commit }) {
      commit("SET_TOUR", false);
      commit("SET_TOUR_STEP", 0);
    },
    nextTourStep({ commit, state, getters, dispatch }) {
      if (getters.hasNextTourStep) {
        commit("SET_TOUR_STEP", state.tourStep + 1);
      } else {
        dispatch("stopTour");
      }
    },
    previousTourStep({ commit, state, getters }) {
      if (getters.hasPreviousTourStep) {
        commit("SET_TOUR_STEP", state.tourStep - 1);
      }
    },
  },
};
