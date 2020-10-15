const fetch = require('node-fetch')
const { t: typy } = require('typy')
const { successResponse, errorResponse } = require('./shared/response')
const { sentryWrapper } = require('./shared/sentryWrapper')
const { normalize, deweyNormalize } = require('./callNumber')

module.exports.handler = sentryWrapper(async (event, context, callback) => {
  const params = typy(event, 'queryStringParameters').safeObject

  if (!params) {
    return errorResponse(callback, 'No query parameters provided.', 422)
  }

  // Make sure all required params were included in request
  const missingParams = [
    'call_number',
    'collection',
    'sublibrary',
  ].filter(paramName => !params[paramName])
  if (missingParams.length > 0) {
    return errorResponse(callback, `Missing query parameters: ${missingParams.join(', ')}`, 422)
  }

  const inCallNumber = params.call_number
  // Use Dewey for Holy Cross, LC for all other sublibraries
  const normalizedCallNumber = (params.sublibrary === 'HCC' ? deweyNormalize(inCallNumber) : normalize(inCallNumber))
  const collectionLibrary = `${params.collection}-${params.sublibrary}`

  const query = encodeURIComponent(`content_type=collectionCallRanges&fields.collectionSublibrary=${collectionLibrary}`)
  const url = `${process.env.DIRECT_ENDPOINT}/query?query=${query}` // QUERY? QUERY = QUERY! Query the query with query.

  const response = await fetch(url).then(async res => ({
    statusCode: res.status,
    data: res.ok ? await res.json() : null,
  }))
  if (!response.data) {
    return errorResponse(callback, 'API ERROR', response.statusCode)
  }

  // Filter results to those which fall inside the call number range specified.
  const matches = typy(response, 'data').safeArray.filter(record => {
    return record.fields &&
      (!record.fields.rangeStart || (normalizedCallNumber && record.fields.rangeStart <= normalizedCallNumber)) &&
      (!record.fields.rangeEnd || (normalizedCallNumber && record.fields.rangeEnd >= normalizedCallNumber))
  })

  // If we got a hit and it has a floor, we can get the map slug
  if (matches.length > 0 && typy(matches[0], 'fields.floor').isObject) {
    return successResponse(callback, {
      slug: typy(matches[0], 'fields.floor.fields.slug').safeString,
      servicePoint: typy(matches[0], 'fields.servicePoint.fields.slug').safeString || null, // Use null if not found/empty
    })
  }

  return errorResponse(callback, 'Map not found.', 404)
})
