import { LmdLexerOptions, LmdLexerResult, LmdNode, LmdNodeType, LmdNodeTypeNote } from '../types'
import * as RESOURCES from '../RESOURCES.json'
import * as SETTINGS from '../SETTINGS.json'
import LmdTreeNodeLexer from './LmdTreeNodeLexer'

type LmdLineHandler = {
	// regex
	startRegex: RegExp

	// line => content
	lexer: (lmdLexer: LmdLexer, line: string) => void
}

export default class LmdLexer {
	lmdText: string
	preamble: string
	commands: string[]
	root: LmdNode
	lines: string[]
	currentNode: LmdNode
	lastIndent: number

	options: LmdLexerOptions

	readonly standardOptions: LmdLexerOptions = {
		onlyMakros: false,
		readComments: false,
	}

	handler: LmdLineHandler[] = [
		{
			startRegex: new RegExp(RESOURCES.lineStarts.makro),
			lexer: this.onMakroLine,
		},
		{
			startRegex: new RegExp(RESOURCES.lineStarts.section),
			lexer: this.onSectionLine,
		},
		{
			startRegex: new RegExp(RESOURCES.lineStarts.def),
			lexer: this.onDefintionLine,
		},
		{
			startRegex: new RegExp(RESOURCES.lineStarts.note),
			lexer: this.onNoteLine,
		},
		{
			startRegex: new RegExp(RESOURCES.lineStarts.comment),
			lexer: this.onCommentLine,
		},
		{
			startRegex: new RegExp(RESOURCES.lineStarts.image),
			lexer: this.onImageLine,
		},
		{
			startRegex: new RegExp(RESOURCES.lineStarts.math),
			lexer: this.onMathLine,
		},
	]

	constructor(lmdText: string, options?: Partial<LmdLexerOptions>) {
		this.options = { ...this.standardOptions, ...options }
		this.lmdText = lmdText

		const div = lmdText.split('_' + RESOURCES.makros.startdocument)
		this.preamble = div[0]
		this.lines = div[1].split('\r\n')

		this.commands = []
		this.root = {
			type: 'root',
			content: [''],
			comments: [],
			hierarchyNumber: 6,
			parent: undefined,
			children: [],
		}
		this.currentNode = this.root
		this.lastIndent = 0
	}

	lex(): LmdLexerResult {
		const handlerSelection = this.options.onlyMakros ? [this.handler[0]] : this.handler
		// create tree
		this.lines.forEach((line) => {
			if (!LmdLexer.hasNonWhiteSpaceCharacter(line)) return
			const handler = handlerSelection.find((h) => h.startRegex.test(line))
			// console.log(handler)
			if (handler) {
				handler.lexer(this, line)
			} else {
				this.onLatexLine(this, line)
			}
		})

		// lex nodes
		const treeNodeLexer = new LmdTreeNodeLexer(this.root)
		treeNodeLexer.traverse()

		return {
			preamble: this.preamble,
			root: this.root,
			commands: this.commands,
		}
	}

	onMakroLine(lmdLexer: LmdLexer, line: string): void {
		lmdLexer.commands.push(line)
	}

	onSectionLine(lmdLexer: LmdLexer, line: string): void {
		lmdLexer.pushChild(lmdLexer, 'section', line)
		lmdLexer.lastIndent = 0
	}

	onDefintionLine(lmdLexer: LmdLexer, line: string): void {
		lmdLexer.addNote(lmdLexer, 'definition', line)
	}

	onNoteLine(lmdLexer: LmdLexer, line: string): void {
		lmdLexer.addNote(lmdLexer, 'note', line)
	}

	onCommentLine(lmdLexer: LmdLexer, line: string): void {
		// console.log(line)
		if (!SETTINGS.parseComment) return
		lmdLexer.currentNode.comments.push(line)
	}

	onImageLine(lmdLexer: LmdLexer, line: string): void {
		lmdLexer.pushChild(lmdLexer, 'image', line)
	}

	onMathLine(lmdLexer: LmdLexer, line: string): void {
		line = LmdLexer.prepareLine(line)
		lmdLexer.currentNode.content.push(line)
	}

	onLatexLine(lmdLexer: LmdLexer, line: string): void {
		line = LmdLexer.prepareLine(line)
		lmdLexer.currentNode.content.push(line)
	}

	pushChild(lmdLexer: LmdLexer, type: LmdNodeType, text: string): void {
		// console.log(text)
		const hn = LmdLexer.getHierarchyNumber(type, text)
		lmdLexer.gotoNextParent(lmdLexer, hn)
		const block: LmdNode = {
			type,
			content: [LmdLexer.prepareLine(text)],
			comments: [],
			hierarchyNumber: hn,
			parent: lmdLexer.currentNode,
			children: [],
		}
		lmdLexer.currentNode.children.push(block)
		lmdLexer.currentNode = block
	}

	addNote(lmdLexer: LmdLexer, type: LmdNodeTypeNote, line: string): void {
		// console.log(this.currentNode, line)
		const indent = LmdLexer.getIndent(line)
		if (1 > indent && indent > this.lastIndent + 1) {
			throw Error(`Invalid indent in line: ${line}`)
		}
		lmdLexer.pushChild(lmdLexer, type, line)
		lmdLexer.lastIndent = indent
	}

	static hasNonWhiteSpaceCharacter(line: string): boolean {
		return /\S/.test(line)
	}

	static prepareLine(line: string): string {
		return line.replace(/(\t|\n)/g, '')
	}

	static countSymbolsFromBegin(line: string, symbol: string): number {
		for (let i = 0; i < line.length; i++) {
			if (line[i] != symbol) return i
		}
		return 0
	}

	static getIndent(line: string): number {
		return LmdLexer.countSymbolsFromBegin(line, '\t')
	}

	static getHierarchyNumber(type: LmdNodeType, line: string): number {
		if (type == 'section') {
			return LmdLexer.countSymbolsFromBegin(line, '#')
		}
		if (type == 'image') {
			return -4
		}
		return -LmdLexer.getIndent(line)
	}

	gotoNextParent(lmdLexer: LmdLexer, hn: number): void {
		while (lmdLexer.currentNode.hierarchyNumber <= hn) {
			if (!lmdLexer.currentNode.parent) return
			lmdLexer.currentNode = lmdLexer.currentNode.parent
		}
	}
}
