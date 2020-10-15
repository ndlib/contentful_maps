const { t: typy } = require('typy')

const joiner = ''
const topspace = ' '
const bottomspace = '~'
const topdigit = '0'
const bottomdigit = '9'
// Matches capital letter + number with 2 decimals (I.E. "  A 123.42.149")
const weirdRegex = /^\s*[A-Z]+\s*\d+\.\d+\.\d+/i

//  This regex isn't really legible so below is a slightly more legible but still insane format...
const libraryCongressRegex = new RegExp('^\\s*(?:VIDEO-D)?(?:DVD-ROM)?(?:CD-ROM)?(?:TAPE-C)?\\s*([A-Z]{1,3})\\s*(?:(\\d+)(?:\\s*?\\.\\s*?(\\d+))?)?\\s*(?:\\.?\\s*([A-Z])\\s*(\\d+|\\Z))?\\s*(?:\\.?\\s*([A-Z])\\s*(\\d+|\\Z))?\\s*(?:\\.?\\s*([A-Z])\\s*(\\d+|\\Z))?(\\s+.+?)?\\s*$', 'i')
/*
  ^\s*
  (?:VIDEO-D)? # for video stuff
  (?:DVD-ROM)? # DVDs, obviously
  (?:CD-ROM)?  # CDs
  (?:TAPE-C)?  # Tapes
  \s*
  ([A-Z]{1,3})  # alpha
  \s*
  (?:         # optional numbers with optional decimal point
    (\d+)
    (?:\s*?\.\s*?(\d+))?
  )?
  \s*
  (?:               # optional cutter
    \.? \s*
    ([A-Z])      # cutter letter
    \s*
    (\d+ | \Z)        # cutter numbers
  )?
  \s*
  (?:               # optional cutter
    \.? \s*
    ([A-Z])      # cutter letter
    \s*
    (\d+ | \Z)        # cutter numbers
  )?
  \s*
  (?:               # optional cutter
    \.? \s*
    ([A-Z])      # cutter letter
    \s*
    (\d+ | \Z)        # cutter numbers
  )?
  (\s+.+?)?        # everthing else
  \s*$
*/

module.exports.deweyNormalize = (callNumber) => {
  // remove Cutter Code and anything else following classification number
  // Use only first 3 digits
  const numberPrefix = callNumber.split(' ')[0]
  const deweyNumber = numberPrefix.split('.')[0]
  // Only continue if it is a number
  if (!deweyNumber.match(/^\d+$/)) {
    return null
  }
  // Contentful call_range field wants 9 characters- start with 'D ' and right justify the rest
  return `D ${deweyNumber.padStart(7, '0')}`
}

module.exports.normalize = (callNumber, bottomout) => {
  if (weirdRegex.exec(callNumber.toUpperCase())) {
    return null
  }

  const match = libraryCongressRegex.exec(callNumber.toUpperCase())
  if (!match) {
    return null
  }
  match.shift() // We don't need the first element which is the full match

  const matchGroups = match.slice(0, 10)
  const [alpha, num, dec, c1alpha, c1num, c2alpha, c2num, c3alpha, c3num, extra] = matchGroups

  if (alpha && !(num || dec || c1alpha || c1num || c2alpha || c2num || c3alpha || c3num)) {
    if (extra) {
      return null
    } else if (bottomout) {
      return alpha.padEnd(3, bottomspace)
    } else {
      return alpha
    }
  }

  const extraNorm = extra ? (' ' + extra.replace(/[^A-Z0-9]/, '')) : ''

  const topnorm = [
    typy(alpha).safeString.padEnd(3, topspace),
    typy(num).safeString.padStart(4, topdigit),
    typy(dec).safeString.padStart(2, topdigit),
    c1alpha || topspace,
    typy(c1num).safeString.padStart(3, topdigit),
    c2alpha || topspace,
    typy(c2num).safeString.padStart(3, topdigit),
    c3alpha || topspace,
    typy(c3num).safeString.padStart(3, topdigit),
    extraNorm,
  ]

  const bottomnorm = [
    typy(alpha).safeString.padEnd(3, bottomspace),
    num ? num.padStart(4, topdigit) : bottomdigit.repeat(4),
    dec ? dec.padStart(2, topdigit) : bottomdigit.repeat(2),
    c1alpha || bottomspace,
    c1num ? c1num.padStart(3, topdigit) : bottomdigit.repeat(3),
    c2alpha || bottomspace,
    c2num ? c2num.padStart(3, topdigit) : bottomdigit.repeat(3),
    c3alpha || bottomspace,
    c3num ? c3num.padStart(3, topdigit) : bottomdigit.repeat(3),
    extraNorm,
  ]

  if (bottomout) {
    return bottomnorm.join(joiner)
  }

  // Join up to the last element that had an actual match in the input
  for (let i = matchGroups.length - 1; i >= 0; i--) {
    if (matchGroups[i]) {
      // Found a value at this index the end. Break out and return!
      break
    } else {
      topnorm.pop()
    }
  }

  return topnorm.join(joiner).trim()
}
