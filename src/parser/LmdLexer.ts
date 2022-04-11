import { LmdLexerResult, LmdNode, LmdNodeType, LmdNodeTypeNote } from './types'
import * as RESOURCES from './RESOURCES.json'
import * as SETTINGS from './SETTINGS.json'
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
	currentSectionDepth: number
	lastIndent: number

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

	constructor(lmdText: string) {
		this.lmdText = lmdText

		const div = lmdText.split('_' + RESOURCES.makros.startdocument)
		this.preamble = div[0]
		this.lines = div[1].split('\r\n')

		this.commands = []
		this.root = {
			type: 'root',
			content: [''],
			comments: [],
			depth: 0,
			parent: undefined,
			children: [],
		}
		this.currentNode = this.root
		this.currentSectionDepth = 0
		this.lastIndent = 0
	}

	lex(): LmdLexerResult {
		// create tree
		this.lines.forEach((line) => {
			if (!LmdLexer.hasNonWhiteSpaceCharacter(line)) return
			const handler = this.handler.find((h) => h.startRegex.test(line))
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
		const sectionDepth = LmdLexer.getSectionDepth(line)
		lmdLexer.goto(lmdLexer, sectionDepth - 1)
		lmdLexer.pushChild(lmdLexer, 'section', line)
		lmdLexer.currentSectionDepth = sectionDepth
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
		// console.log(line)
		const lastIndex = lmdLexer.currentNode.content.length - 1
		line = LmdLexer.prepareLine(line)

		if (SETTINGS.compactLmdNodeLines) {
			if (lmdLexer.currentNode.content[lastIndex][0] === '$') {
				lmdLexer.currentNode.content[lastIndex] += line
			} else {
				lmdLexer.currentNode.content.push(line)
			}
		} else {
			lmdLexer.currentNode.content.push(line)
		}
	}

	onLatexLine(lmdLexer: LmdLexer, line: string): void {
		line = LmdLexer.prepareLine(line)
		if (SETTINGS.compactLmdNodeLines) {
			const type = lmdLexer.currentNode.type
			if (type === 'image' || type === 'section') {
				lmdLexer.currentNode.content.push(line)
			} else {
				const lastIndex = lmdLexer.currentNode.content.length - 1
				if (lmdLexer.currentNode.content[lastIndex][0] === '$') {
					lmdLexer.currentNode.content.push(line)
				} else {
					lmdLexer.currentNode.content[lastIndex] +=
						'\n' + LmdLexer.prepareLine(line)
				}
			}
		} else {
			lmdLexer.currentNode.content.push(line)
		}
	}

	goto(lmdLexer: LmdLexer, depth: number): void {
		if (lmdLexer.currentNode.depth < depth) return
		while (lmdLexer.currentNode.depth > depth) {
			if (!lmdLexer.currentNode.parent) return
			lmdLexer.currentNode = lmdLexer.currentNode.parent
		}
	}

	pushChild(lmdLexer: LmdLexer, type: LmdNodeType, text: string): void {
		// console.log(text)
		const block: LmdNode = {
			type,
			content: [LmdLexer.prepareLine(text)],
			comments: [],
			depth: lmdLexer.currentNode.depth + 1,
			parent: lmdLexer.currentNode,
			children: [],
		}
		lmdLexer.currentNode.children.push(block)
		lmdLexer.currentNode = block
	}

	addNote(lmdLexer: LmdLexer, type: LmdNodeTypeNote, line: string): void {
		// console.log(this.currentNode, line)
		const indent = LmdLexer.getIndent(line)
		if (1 > indent && indent > this.lastIndent + 1) return
		const diff = indent - this.lastIndent
		lmdLexer.goto(lmdLexer, this.currentNode.depth + diff - 1)
		lmdLexer.pushChild(lmdLexer, type, line)
		lmdLexer.lastIndent = indent
		return
	}

	static hasNonWhiteSpaceCharacter(line: string): boolean {
		return /\S/.test(line)
	}

	static prepareLine(line: string): string {
		return line.replace(/\t/g, '')
	}

	static getIndent(line: string): number {
		return LmdLexer.countSymbolsFromBegin(line, '\t')
	}

	static getSectionDepth(line: string): number {
		const hashTags = LmdLexer.countSymbolsFromBegin(
			line,
			RESOURCES.lineStarts.section[1]
		)
		return 6 - hashTags
	}

	static countSymbolsFromBegin(line: string, symbol: string): number {
		for (let i = 0; i < line.length; i++) {
			if (line[i] != symbol) return i
		}
		return 0
	}
}
