export default class NestedPrintout {
  parent?: NestedPrintout
  children: NestedPrintout[]
  lines: string[]

  constructor(parent?: NestedPrintout) {
    this.parent = parent
    this.children = []
    this.lines = []
  }

  addLine(str: string) {
    this.lines.push(str)
    return this
  }

  addNestedLevel() {
    const child = new NestedPrintout(this)
    this.children.push(child)
    return child
  }

  returnToParent() {
    return this.parent ?? this
  }

  toLines(): string[] {
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

      return prefixedLines
    })

    return this.lines.concat(childLines)
  }

  toString() {
    return this.toLines().join('\n')
  }
}
