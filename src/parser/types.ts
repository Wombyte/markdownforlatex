export type LmdSegment = {
	type: LmdSegmentType
	text: {
		main: string
		additions: string
	}
	depth: number
	parent: LmdSegment | undefined
	children: LmdSegment[]
}

export type LmdSegmentType = 'root' | 'block' | 'line'

export type LmdLexerResult = {
	preamble: string
	root: LmdSegment
	commands: string[]
}
