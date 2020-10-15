const nock = require('nock')
const index = require('../src/index')

const successResponse = {
  sys: {
    id: 'itemId333',
  },
  fields: {
    rangeStart: 'C 5555555',
    rangeEnd: 'Z 9999999',
    floor: {
      fields: {
        slug: 'floorSlug',
      },
    },
    servicePoint: {
      fields: {
        slug: 'servicePointSlug',
      },
    },
  },
}
const invalidResponse = {
  sys: {
    id: 'itemId333',
  },
  fields: {
    foo: 'bar',
  },
}
const emptyResponse = {}

describe('index', () => {
  let testNock

  describe('with success response', () => {
    beforeEach(() => {
      testNock = nock(process.env.DIRECT_ENDPOINT)
        .get('/query')
        .query(true)
        .reply(200, successResponse)
    })

    it('should return 200 if API call succeeds but no result returned', async () => {
      const testEvent = {
        queryStringParameters: {
          collection: 'GEN',
          sublibrary: 'HESB',
          call_number: 'RX 3333',
        },
      }

      const callback = (ignore, response) => {
        expect(testNock.isDone()).toBe(true)
        expect(response.statusCode).toEqual(200)
        expect(response.body).toEqual(JSON.stringify({
          slug: 'floorSlug',
          servicePoint: 'servicePointSlug',
        }))
      }

      await index.handler(testEvent, null, callback)
    })

    it('should return 404 if call number outside accepted range', async () => {
      const testEvent = {
        queryStringParameters: {
          collection: 'GEN',
          sublibrary: 'HESB',
          call_number: 'A 0000123',
        },
      }

      const callback = (ignore, response) => {
        expect(testNock.isDone()).toBe(true)
        expect(response.statusCode).toEqual(404)
      }

      await index.handler(testEvent, null, callback)
    })
  })

  describe('with empty response', () => {
    beforeEach(() => {
      testNock = nock(process.env.DIRECT_ENDPOINT)
        .get('/query')
        .query(true)
        .reply(200, emptyResponse)
    })

    it('should return 404', async () => {
      const testEvent = {
        queryStringParameters: {
          collection: 'GEN',
          sublibrary: 'HESB',
          call_number: 'A 0000123',
        },
      }

      const callback = (ignore, response) => {
        expect(testNock.isDone()).toBe(true)
        expect(response.statusCode).toEqual(404)
      }

      await index.handler(testEvent, null, callback)
    })
  })

  describe('with invalid response', () => {
    beforeEach(() => {
      testNock = nock(process.env.DIRECT_ENDPOINT)
        .get('/query')
        .query(true)
        .reply(200, invalidResponse)
    })

    it('should return 404 if API call succeeds but no result returned', async () => {
      const testEvent = {
        queryStringParameters: {
          collection: 'GEN',
          sublibrary: 'HESB',
          call_number: 'RX 3333',
        },
      }

      const callback = (ignore, response) => {
        expect(testNock.isDone()).toBe(true)
        expect(response.statusCode).toEqual(404)
      }

      await index.handler(testEvent, null, callback)
    })

    it('should return status code from API response when fetch fails', async () => {
      nock.cleanAll()
      testNock = nock(process.env.DIRECT_ENDPOINT)
        .get('/query')
        .query(true)
        .reply(377, null)

      const testEvent = {
        queryStringParameters: {
          collection: 'MICRO',
          sublibrary: 'NDU',
          call_number: 'Microfilm+N13+reel+214',
        },
      }

      const callback = (ignore, response) => {
        expect(testNock.isDone()).toBe(true)
        expect(response.statusCode).toEqual(377)
      }

      await index.handler(testEvent, null, callback)
    })

    it('should return 422 when no query string parameters provided', async () => {
      const testEvent = {}

      const callback = (ignore, response) => {
        expect(testNock.isDone()).toBe(false)
        expect(response.statusCode).toEqual(422)
      }

      await index.handler(testEvent, null, callback)
    })

    it('should return 422 when one of required parameters not provided', async () => {
      const testEvent = {
        queryStringParameters: {
          collection: 'abc',
          sublibrary: '123',
          // call_number omitted
        },
      }

      const callback = (ignore, response) => {
        expect(testNock.isDone()).toBe(false)
        expect(response.statusCode).toEqual(422)
      }

      await index.handler(testEvent, null, callback)
    })
  })
})
