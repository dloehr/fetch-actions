import 'cross-fetch/polyfill'

import { createFetchAction } from '../src/createFetchAction'
import { createFakeFetch } from './helpers/createFakeFetch'

const realConsole = console

describe('createFetchAction', () => {
  const type = 'TEST_ACTION'
  const action = { type }
  const data = true
  const request = new Request('http://test')
  const createResponse = () => new Response(JSON.stringify({ data }))

  let fetch
  let requestCreator
  let responder
  let responseHandler
  let transformer
  let fetchAction

  beforeEach(() => {
    global.console = { warn: jest.fn(), log: realConsole.log }
    fetch = jest.fn(createFakeFetch(createResponse))
    requestCreator = jest.fn(() => request)
    responder = jest.fn(() => false)
    responseHandler = jest.fn((response) => response)
    transformer = jest.fn((json) => json)

    fetchAction = createFetchAction({
      fetch,
      requestCreator,
      responder,
      responseHandler,
      transformer,
    })
  })
  afterEach(() => {
    if (global.console !== realConsole) {
      global.console = realConsole
    }
  })

  it('returns a function', () => {
    const fetchAction = createFetchAction()
    expect(typeof fetchAction).toEqual('function')
  })

  it('throws on empty handlers', () => {
    const fetchAction = createFetchAction()
    expect.assertions(1)
    return fetchAction(action)
      .then((response) => realConsole.log(response))
      .catch((e) => {
        expect(true).toEqual(true)
      })
  })

  it('throws on action missing type', async () => {
    expect.assertions(1)
    const action = { noType: true }
    try {
      await fetchAction(action)
    } catch (error) {
      expect(error).toBeDefined()
    }
  })

  // NOTE: this is double-testing the identityRequestCreator
  it('warns on missing requestCreator', async () => {
    const fetchAction = createFetchAction({ fetch })
    expect.assertions(1)
    try {
      await fetchAction(action)
    } catch (e) {}
    expect(console.warn).toBeCalled()
  })

  it('throws on bad fetch function', () => {
    const fetchAction = createFetchAction({ fetch: 'bad' })
    expect.assertions(1)
    return fetchAction(action)
      .then((response) => realConsole.log(response))
      .catch((e) => {
        expect(true).toEqual(true)
      })
  })

  it('throws on bad fetch function, even with good responder', () => {
    const fetchAction = createFetchAction({
      fetch: 'bad',
      responder: createResponse,
    })
    expect.assertions(1)
    return fetchAction(action)
      .then((response) => realConsole.log(response))
      .catch((e) => {
        expect(true).toEqual(true)
      })
  })

  it('throws on bad responder function', () => {
    const fetchAction = createFetchAction({ responder: 'bad' })
    expect.assertions(1)
    return fetchAction(action)
      .then((response) => realConsole.log(response))
      .catch((e) => {
        expect(true).toEqual(true)
      })
  })

  it('throws on bad responder function, even with good fetch', () => {
    const fetchAction = createFetchAction({ responder: 'bad', fetch })
    expect.assertions(1)
    return fetchAction(action)
      .then((response) => realConsole.log(response))
      .catch((e) => {
        expect(true).toEqual(true)
      })
  })

  it('throws on good responder function when fetch is missing and responder returns false', () => {
    const fetchAction = createFetchAction({ responder })
    expect.assertions(1)
    return fetchAction(action)
      .then((response) => realConsole.log(response))
      .catch((e) => {
        expect(true).toEqual(true)
      })
  })

  it('throws on bad response in responder, missing json method', () => {
    const fetchAction = createFetchAction({ responder: () => ({ bad: true }) })
    expect.assertions(1)
    return fetchAction(action)
      .then((response) => realConsole.log(response))
      .catch((e) => {
        expect(true).toEqual(true)
      })
  })

  it('throws on bad response in responseHandler, missing json method', () => {
    const fetchAction = createFetchAction({
      fetch,
      responseHandler: () => ({ bad: true }),
    })
    expect.assertions(1)
    return fetchAction(action)
      .then((response) => realConsole.log(response))
      .catch((e) => {
        expect(true).toEqual(true)
      })
  })

  it('calls all handlers', async () => {
    expect.assertions(5)
    await fetchAction(action)
    expect(fetch).toBeCalled()
    expect(requestCreator).toBeCalled()
    expect(responder).toBeCalled()
    expect(responseHandler).toBeCalled()
    expect(transformer).toBeCalled()
  })
})
