import Utils, { Partial } from './utils'

describe('getMostRecent', () => {
  let a: string
  let b: string

  beforeAll(() => {
    a = '2017-05-22T12:20:28.540Z'
    b = '2017-05-21T12:20:28.540Z'
  })

  it('returns the first argument', () => {
    expect(Utils.getMostRecent(a, b)).toBe(a)
  })

  it('returns the second argument', () => {
    expect(Utils.getMostRecent(b, a)).toBe(a)
  })
})
