import os
import sys
sys.path.append(os.path.dirname(os.path.realpath(__file__)))
from hesburgh import heslog, hesutil
import callnumber
import json
import urllib
import urllib2

missingQueryParams = { "statusCode": 422, "body": "Missing Query Parameters: expected call_number, collection, sublibrary." }
noQueryParams = { "statusCode": 422, "body": "No Query Parameters Provided." }
mapNotFound = { "statusCode": 404, "body": "Map not Found." }
apierror = { "statusCode": 500, "body": "API ERROR" }

heslog.setHubContext(id='contentful_maps')

def addHeaders(obj):
  obj["headers"] = obj.get("headers", {})
  obj["headers"]["x-nd-version"] = hesutil.getEnv("VERSION")
  obj["headers"]["Access-Control-Allow-Origin"] = "*"
  return obj


#called via AWS API
def handler(event, context):
  heslog.addLambdaContext(event, context)
  heslog.info("Received event %s" % event)

  # check that we have all needed query parameters
  params = event.get('queryStringParameters')

  if not params:
	  return addHeaders(noQueryParams)

  for param in ["call_number", "collection", "sublibrary"]:
	  if param not in params.keys():
		  return addHeaders(missingQueryParams)

  collection = params.get('collection')
  sublibrary = params.get('sublibrary')
  # Use Dewey for Holy Cross, LC for all other sublibraries DLTP-1422
  if sublibrary == "HCC":
  	call_number = callnumber.dewey_normalize(params.get('call_number'))
  else:
  	call_number = callnumber.normalize(params.get('call_number'))


  collectionLibrary = collection + '-' + sublibrary

  query = urllib.quote("content_type=collectionCallRanges&fields.collectionSublibrary=%s" % collectionLibrary)
  url = hesutil.getEnv("DIRECT_ENDPOINT") + '/query?query=' + query

  req = urllib2.Request(url)
  try:
    response = urllib2.urlopen(req)
    response = json.loads(response.read())
  except urllib2.HTTPError as e:
    heslog.error("%s" % e.code)
    heslog.error(e.read())
    return addHeaders(apierror)
  except urllib2.URLError as e:
    heslog.error(e.reason)
    return addHeaders(apierror)

  callmap = [ x.get("fields") for x in response ]

  # Search for a Map slug, given collection, sublibrary, call_number
  # The key 'collection-library' returns a list of call number ranges,
  # which we search.
  slugs = filter(lambda x: x['rangeStart'] <= call_number and x['rangeEnd'] >= call_number, callmap)

  if len(slugs) > 0:
    return addHeaders({ "statusCode": 200, "body": json.dumps({ "slug": slugs[0]['floorSlug']}) })

  return addHeaders(mapNotFound)

# just a simple test - requires env vars
#python -c 'import main; print main.handler({"queryStringParameters": { "collection": "GEN", "sublibrary": "HESB", "call_number": "RX 3333"}},{})'
