// Vuex store getters

export function metadata (state) {
  return state.metadata
}

export function selectedSeason (state) {
  return state.selected.season
}

export function selectedRegion (state) {
  return state.selected.region
}

export function selectedWeekIdx (state) {
  return state.selected.week.idx
}

export function selectedWeekName (state) {
  if (state.selected.week.name) return state.selected.week.name
  else return 'NA'
}

export function seasons (state) {
  return state.data[selectedRegion(state)].seasons.map(s => s.id)
}

export function regions (state) {
  return state.data.map(d => d.subId)
}

/**
 * Return list of all models for current season
 */
export function models (state) {
  return state.data[selectedRegion(state)]
    .seasons[selectedSeason(state)]
    .models.map(m => m.id)
}

export function choroplethRelative (state) {
  return state.toggles.choroplethRelative
}

/**
 * Scale given (week, data) pairs using the baseline
 */
function baselineScale (values, baseline) {
  return values.map(d => {
    return {
      week: d.week,
      data: baseline ? ((d.data / baseline) - 1) * 100 : -1
    }
  })
}

/**
 * Return data for choropleth using actual values
 */
function actualChoroplethData (state) {
  let seasonId = selectedSeason(state)
  let relative = choroplethRelative(state)

  let output = {
    data: [],
    type: relative ? 'diverging' : 'sequential',
    decorator: relative ? x => x + ' % (baseline)' : x => x + ' %'
  }

  state.data.map(r => {
    let values = getMaxLagData(r.seasons[seasonId].actual)

    if (relative) values = baselineScale(values, r.seasons[seasonId].baseline)

    output.data.push({
      region: r.subId,
      states: r.states,
      value: values
    })
  })

  output.data = output.data.slice(1) // Remove national data

  return output
}

export function choropleths (state) {
  // TODO: Parse from data

  let actualChoropleths = [
    'Actual Weighted ILI (%)',
    'Relative Weighted ILI (%)'
  ]

  return actualChoropleths
}

export function timeChart (state) {
  return state.timeChart
}

export function choropleth (state) {
  return state.choropleth
}

/**
 * Get data with maximum lag
 * First element of the lag array
 */
function getMaxLagData (actual) {
  return actual.map(d => {
    let dataToReturn = -1
    // Handle zero length values
    if (d.data.length !== 0) {
      dataToReturn = d.data[0].value
    }
    return {
      week: d.week,
      data: dataToReturn
    }
  })
}

/**
 * Trim history data to fit in length 'numWeeks'
 */
function trimHistory (historyActual, numWeeks) {
  let historyTrimmed = historyActual.slice()

  if (numWeeks === 52) {
    // Clip everyone else to remove 53rd week
    historyTrimmed = historyTrimmed.filter(d => d.week % 100 !== 53)
  } else if (historyTrimmed.length === 52) {
    // Expand to add 53rd week
    // Adding a dummy year 1000, this will also help identify the adjustment
    historyTrimmed.splice(23, 0, {
      week: 100053,
      data: (historyTrimmed[22].data + historyTrimmed[23].data) / 2.0
    })
  }

  return historyTrimmed
}

/**
 * Return data subset for chart as specified in region/season selected
 */
export function timeChartData (state) {
  let regionSubset = state.data[selectedRegion(state)]
  let currentSeasonId = selectedSeason(state)
  let seasonSubset = regionSubset.seasons[currentSeasonId]

  let selectedWeeksCount = seasonSubset.actual.length

  let historicalData = []

  // Add data from history store
  for (let season of Object.keys(regionSubset.history)) {
    historicalData.push({
      id: season,
      actual: trimHistory(regionSubset.history[season], selectedWeeksCount)
    })
  }

  for (let i = 0; i < currentSeasonId; i++) {
    historicalData.push({
      id: regionSubset.seasons[i].id,
      actual: trimHistory(getMaxLagData(regionSubset.seasons[i].actual),
                          selectedWeeksCount)
    })
  }

  return {
    region: regionSubset.subId, // Submission ids are concise
    observed: seasonSubset.actual,
    actual: getMaxLagData(seasonSubset.actual), // Using this to avoid confusion
    baseline: seasonSubset.baseline,
    models: seasonSubset.models, // All model predictions
    history: historicalData
  }
}

/**
 * Return formatted next week data
 */
export function nextWeek (state) {
  return timeChart(state).getNextWeekData()
}

/**
 * Return formatted previous week data
 */
export function previousWeek (state) {
  return timeChart(state).getPreviousWeekData()
}

/**
 * Return range for choropleth color scale
 */
function choroplethDataRange (state) {
  let maxVals = []
  let minVals = []

  state.data.map(region => {
    region.seasons.map(season => {
      let actual = getMaxLagData(season.actual).map(d => d.data).filter(d => d !== -1)

      if (choroplethRelative(state)) {
        // Use baseline scaled data
        maxVals.push(Math.max(...actual.map(d => ((d / season.baseline) - 1) * 100)))
        minVals.push(Math.min(...actual.map(d => ((d / season.baseline) - 1) * 100)))
      } else {
        maxVals.push(Math.max(...actual))
        minVals.push(Math.min(...actual))
      }
    })
  })

  return [Math.min(...minVals), Math.max(...maxVals)]
}

/**
 * Return actual data for all regions for current selections
 */
export function choroplethData (state) {
  let output = actualChoroplethData(state)
  output.range = choroplethDataRange(state)
  return output
}

/**
 * Return stats related to models
 */
export function modelStats (state) {
  let models = models(state)
  console.log(state.data)

  return 'sdsd'
}

export function legendShow (state) {
  return state.toggles.legend
}

export function statsShow (state) {
  return state.toggles.stats
}

// Introduction getters
export function currentIntro (state) {
  return state.intro.data[introStep(state)]
}

export function introStep (state) {
  return state.intro.pointer
}

export function introLength (state) {
  return state.intro.data.length
}

export function introShow (state) {
  return state.toggles.intro
}

export function introAtFirst (state) {
  return introStep(state) === 0
}

export function introAtLast (state) {
  return introStep(state) === introLength(state) - 1
}
