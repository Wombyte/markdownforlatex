export type LmdNode = {
	type: LmdNodeType

	// for note types, the second item is always the bold one
	content: string[]

	comments: string[]
	depth: number
	parent: LmdNode | undefined
	children: LmdNode[]
}

export type LmdNodeTypeNote = 'note' | 'definition'

export type LmdNodeType = LmdNodeTypeNote | 'root' | 'section' | 'image'

export type LmdLexerResult = {
	preamble: string
	root: LmdNode
	commands: string[]
}
