const createFakeFetch = (createResponse) => {
  return (input, init) => Promise.resolve().then(() => {
    return createResponse(input, init)
  })
}

export default createFakeFetch
