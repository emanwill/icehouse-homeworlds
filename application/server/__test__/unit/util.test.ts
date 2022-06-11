import { createId } from '../../src/util'

describe('util.ts', () => {
  describe('createId()', () => {
    it('should create an ID string with the given prefix', () => {
      const result = createId('foo', 4)

      expect(result).toMatch(/^foo/)
    })

    it('should create an ID string of the given byte length', () => {
      const result = createId('asdf', 3)

      expect(result).toMatch(/^asdf[0-9a-f]{6}$/)
    })

    it('should create a unique ID each time', () => {
      const id1 = createId('asdf', 6)
      const id2 = createId('asdf', 6)
      const id3 = createId('asdf', 6)
      const id4 = createId('asdf', 6)

      expect(id1).not.toEqual(id2)
      expect(id1).not.toEqual(id3)
      expect(id1).not.toEqual(id4)
    })
  })
})
