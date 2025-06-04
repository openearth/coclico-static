export default {
  namespaced: true,
  state: {
    disclaimerAcknowledged: false
  },
  getters: {
    disclaimerAcknowledged(state) {
      return state.disclaimerAcknowledged
    }
  },
  mutations: {
    SET_DISCLAIMER_ACKNOWLEDGED(state, value) {
      state.disclaimerAcknowledged = value
    }
  },
  actions: {
    saveDisclaimerAcknowledgment({ commit }, value) {
      localStorage.setItem('disclaimerAcknowledged', value)
      commit('SET_DISCLAIMER_ACKNOWLEDGED', value)
    },
    loadDisclaimerAcknowledgment({ commit }) {
      const value = localStorage.getItem('disclaimerAcknowledged') === 'true'
      commit('SET_DISCLAIMER_ACKNOWLEDGED', value)
    }
  }
}
