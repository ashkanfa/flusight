import * as types from '../mutation-types'

const state = {
  region: 0,
  season: 0,
  choroplethRelative: false,
  timeChart: false,
  distributionChart: false,
  score: 0,
  scoresPanel: false
}

// getters
const getters = {
  selectedSeason: state => state.season,
  selectedRegion: state => state.region,
  selectedScore: state => state.score,
  choroplethRelative: state => state.choroplethRelative,
  showTimeChart: state => state.timeChart,
  showDistributionChart: state => state.distributionChart,
  showScoresPanel: state => state.scoresPanel
}

// actions
const actions = {
  updateSelectedSeason ({ commit }, val) {
    commit(types.UPDATE_SELECTED_SEASON, val)
  },

  updateSelectedRegion ({ commit, getters }, val) {
    // Trigger deselection
    if (getters.selectedRegion === val) commit(types.UPDATE_SELECTED_REGION, 0)
    else commit(types.UPDATE_SELECTED_REGION, val)
  },

  updateSelectedScore ({ commit }, val) {
    commit(types.UPDATE_SELECTED_SCORE, val)
  },

  toggleRelative ({ commit }) {
    commit(types.TOGGLE_CHOROPLETH_RELATIVE)
  },

  displayTimeChart ({ commit }) {
    commit(types.DISPLAY_TIMECHART)
  },

  displayDistributionChart ({ commit }) {
    commit(types.DISPLAY_DISTRIBUTIONCHART)
  },

  displayScoresPanel ({ commit }) {
    commit(types.DISPLAY_SCORESPANEL)
  }
}

// mutations
const mutations = {
  [types.UPDATE_SELECTED_REGION] (state, val) {
    state.region = val
  },

  [types.UPDATE_SELECTED_SEASON] (state, val) {
    state.season = val
  },

  [types.UPDATE_SELECTED_SCORE] (state, val) {
    state.score = val
  },

  [types.TOGGLE_CHOROPLETH_RELATIVE] (state) {
    state.choroplethRelative = !state.choroplethRelative
  },

  [types.DISPLAY_TIMECHART] (state) {
    state.distributionChart = false
    state.scoresPanel = false
    state.timeChart = true
  },

  [types.DISPLAY_DISTRIBUTIONCHART] (state) {
    state.timeChart = false
    state.scoresPanel = false
    state.distributionChart = true
  },

  [types.DISPLAY_SCORESPANEL] (state) {
    state.timeChart = false
    state.distributionChart = false
    state.scoresPanel = true
  }
}

export default {
  namespaced: true,
  state,
  getters,
  actions,
  mutations
}
