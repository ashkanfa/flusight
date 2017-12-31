/**
 * Module for handling `yarn run parse`
 * Generate following data files in ./src/assets/data/
 * - history.json :: historical data for regions
 * - metadata.json :: metadata for regions with season prediction availability
 * - season-XXXX.json :: main data for season XXXX
 */

const region = require('./modules/region')
const utils = require('./utils')
const fs = require('fs-extra')
const path = require('path')
const moment = require('moment')
const { exec } = require('child_process')

// Setup variables
const dataDir = './data' // Place with the CSVs
const actualDataDir = './scripts/assets'
const historyInFile = './scripts/assets/history.json'
const historyOutFile = './src/assets/data/history.json'
const metaOutFile = './src/assets/data/metadata.json'

console.log('\n ----------------------------------')
console.log(' Generating data files for flusight')
console.log(' ----------------------------------\n')
console.log(' Messages overlap due to concurrency. Don\'t read too much.\n')

// H I S T O R Y . J S O N
if (!fs.existsSync(historyInFile)) {
  // TODO: A-U-T-O-M-A-T-E
  console.log(' ✕ History file not found. Run `yarn run get-history` to fetch it')
  process.exit(1)
} else {
  fs.copySync(historyInFile, historyOutFile)
  console.log(' ✓ Wrote history.json\n')
}

// Look for seasons in the data directory
let seasons = utils.getSubDirectories(dataDir)

// M E T A D A T A . J S O N
fs.writeFileSync(metaOutFile, JSON.stringify({
  regionData: region.regionData,
  seasonIds: seasons, // NOTE: These seasonIds are full xxxx-yyyy type ids
  updateTime: moment.utc(new Date()).format('MMMM Do YYYY, hh:mm:ss')
}))
console.log(' ✓ Wrote metadata.json')

// S E A S O N files
// - season-*.json
// - distributions/season-*-*.json
// - scores-season-*.json

/**
 * Run node subprocesses to parse seasons
 */
function parseSeasons (seasons) {
  if (seasons.length === 0) {
    console.log('All done')
  } else {
    console.log(` Running parse-season for ${seasons[0]}`)
    let seasonActualFile = path.join(actualDataDir, `${seasons[0]}-actual.json`)
    exec(`node scripts/parse-season.js ${seasonActualFile}`, err => {
      if (err) throw err
      parseSeasons(seasons.slice(1))
    })
  }
}

parseSeasons(seasons)
