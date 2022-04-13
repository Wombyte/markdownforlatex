export type LmdNode = {
	type: LmdNodeType

	// for note types, the second item is always the bold one
	content: string[]

	comments: string[]
	hierarchyNumber: number
	parent: LmdNode | undefined
	children: LmdNode[]
}

export type LmdNodeTypeNote = 'note' | 'definition'

export type LmdNodeType = LmdNodeTypeNote | 'root' | 'section' | 'image'

export type LmdLexerOptions = {
	onlyMakros: boolean
	readComments: boolean
}

export type LmdLexerResult = {
	preamble: string
	root: LmdNode
	commands: string[]
}
