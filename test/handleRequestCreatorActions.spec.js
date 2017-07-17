import handleRequestCreatorActions, { DEFAULT_HANDLER, makeRequest } from '../src/handleRequestCreatorActions'
import 'fetch-everywhere'

describe('handleRequestCreatorActions', () => {
  const type = 'TEST_ACTION'
  const payload = { hello: true }
  const action = { type, payload }

  const testHandler = action => {
    return new Request('http://test')
  }

  let handler
  beforeEach(() => {
    handler = handleRequestCreatorActions({
      [type]: testHandler,
      [DEFAULT_HANDLER]: () => new Request('http://default')
    })
  })

  it('throws on missing map', () => {
    expect(
      () => handleRequestCreatorActions()(action)
    ).toThrow(
      undefined
    )
  })

  it('throws on missing action type', () => {
    const action = {}
    expect(
      () => handler(action)
    ).toThrow()
  })

  it('warns on missing handler', () => {
    global.console = { error: jest.fn() }
    const action = { type: 'missing' }
    const handler = handleRequestCreatorActions({ noMatch: action => new Request('http://no-match') })
    expect(
      handler(action)
    ).toEqual(
      new Request('')
    )
    expect(console.error).toBeCalled()
  })

  it('returns a function from a map', () => {
    expect(
      typeof handler
    ).toEqual(
      'function'
    )
  })

  it('returns a new request', () => {
    expect(
      handler(action).url
    ).toEqual(
      'http://test'
    )
  })

  it('uses default handler on unknown action', () => {
    const action = { type: 'other' }
    expect(
      handler(action).url
    ).toEqual(
      'http://default'
    )
  })

  describe('makeRequest', () => {
    it('resolves promises that return requests', () => {
      expect.assertions(1)
      const promise = Promise.resolve(new Request('http://promise'))
      return makeRequest(promise).then(request => {
        expect(
          request.url
        ).toEqual(
          'http://promise'
        )
      })
    })

    it('returns requests untouched', () => {
      const request = new Request('http://pass-thru')
      expect(
        makeRequest(request)
      ).toEqual(
        request
      )
    })

    it('returns request from array of args', () => {
      const body = JSON.stringify({ data: true })
      const request = makeRequest([
        'http://array', { body }
      ])
      expect(
        request.url
      ).toEqual(
        'http://array'
      )
      expect(
        request.body
      ).toEqual(
        body
      )
    })

    it('returns string as request', () => {
      const request = 'http://string'
      expect(
        makeRequest(request).url
      ).toEqual(
        'http://string'
      )
    })
  })
})
