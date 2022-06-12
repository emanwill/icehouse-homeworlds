class NestedPrintout {
  /**
   *
   * @param {NestedPrintout} [parent]
   */
  constructor(parent) {
    this.parent = parent
    /** @type {NestedPrintout[]} */
    this.children = []
    /** @type {string[]} */
    this.lines = []
  }

  /**
   *
   * @param {string} str
   */
  addLine(str) {
    this.lines.push(str)
    return this
  }

  addNestedLevel() {
    const child = new NestedPrintout(this)
    this.children.push(child)
    return child
  }

  returnToParent() {
    return this.parent
  }

  /**
   * @returns {string[]}
   */
  toLines() {
    /*
    Strategy:
    own lines don't get indented, don't get branch prefixing
    first line of each child gets a branch prefix
    subsequent lines of a child don't get the branch, but get the branch's continuation
    */
    const childLines = this.children.flatMap((child, idx, arr) => {
      const isLastChild = idx === arr.length - 1
      const firstLinePrefix = isLastChild ? '└─ ' : '├─ '
      const otherLinePrefix = isLastChild ? '   ' : '│  '
      const prefixedLines = child.toLines().map((str, cIdx) => {
        if (cIdx === 0) return firstLinePrefix + str
        else return otherLinePrefix + str
      })

      // if (idx < arr.length - 1) prefixedLines.push(otherLinePrefix)

      return prefixedLines
    })

    // if (this.children.length > 0) this.addLine('│ ')

    return this.lines.concat(childLines)
  }

  toString() {
    return this.toLines().join('\n')
  }
}

module.exports = NestedPrintout
