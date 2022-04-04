import { LmdLexerResult, LmdSegment, LmdSegmentType } from './types'
import * as RESOURCES from './RESOURCES.json'
import * as SETTINGS from './SETTINGS.json'

export default class LmdLexer {
	lmdText: string
	preamble: string
	commands: string[]
	root: LmdSegment
	lines: string[]
	currentNode: LmdSegment

	noteLineRegex = new RegExp(RESOURCES.noteIndictor)
	imageLineRegex = new RegExp(RESOURCES.imageIndicator)
	commentLineRegex = new RegExp(RESOURCES.commentIndicator)

	constructor(lmdText: string) {
		this.lmdText = lmdText

		const div = lmdText.split('_' + RESOURCES.commands.startdocument)
		this.preamble = div[0]
		this.lines = div[1].split('\r\n')

		this.commands = []
		this.root = {
			type: 'root',
			text: { main: '', additions: '' },
			depth: 0,
			parent: undefined,
			children: [],
		}
		this.currentNode = this.root
	}

	lex(): LmdLexerResult {
		let currentSectionDepth = 0
		let lastIndent = 0
		this.lines.forEach((line) => {
			if (this.isCommand(line)) {
				this.commands.push(line)
				return
			}
			if (this.isSection(line)) {
				const sectionDepth = this.getSectionDepth(line)
				this.goto(sectionDepth - 1)
				this.pushChild('block', line)
				currentSectionDepth = sectionDepth
				lastIndent = 0
				return
			}
			if (this.isNote(line)) {
				const indent = this.getIndent(line)
				if (1 > indent && indent > lastIndent + 1) return
				const diff = indent - lastIndent
				this.goto(this.currentNode.depth + diff - 1)
				this.pushChild('line', line)
				lastIndent = indent
				return
			}
			if (this.isImage(line)) {
				this.pushChild('line', line)
				return
			}
			if (this.isComment(line)) {
				if (!SETTINGS.parseComment) return
				this.pushChild('line', line)
				return
			}
			this.currentNode.text.additions += '\n' + this.prepareLine(line)
		})

		return {
			preamble: this.preamble,
			root: this.root,
			commands: this.commands,
		}
	}

	goto(depth: number): void {
		if (this.currentNode.depth < depth) return
		while (this.currentNode.depth > depth) {
			if (!this.currentNode.parent) return
			this.currentNode = this.currentNode.parent
		}
	}

	pushChild(type: LmdSegmentType, text: string): void {
		const block: LmdSegment = {
			type,
			text: { main: this.prepareLine(text), additions: '' },
			depth: this.currentNode.depth + 1,
			parent: this.currentNode,
			children: [],
		}
		this.currentNode.children.push(block)
		this.currentNode = block
	}

	prepareLine(line: string): string {
		return line.replace(/\t/g, '')
	}

	isCommand(line: string): boolean {
		return line.startsWith(RESOURCES.commandIndicator)
	}

	isNote(line: string): boolean {
		return this.noteLineRegex.test(line)
	}

	isSection(line: string): boolean {
		return line.startsWith(RESOURCES.sectionIndictor)
	}

	isComment(line: string): boolean {
		return this.commentLineRegex.test(line)
	}

	isImage(line: string): boolean {
		return this.imageLineRegex.test(line)
	}

	getIndent(line: string): number {
		return this.countSymbolsFromBegin(line, '\t')
	}

	getSectionDepth(line: string): number {
		const hashTags = this.countSymbolsFromBegin(
			line,
			RESOURCES.sectionIndictor
		)
		return 6 - hashTags
	}

	countSymbolsFromBegin(line: string, symbol: string): number {
		for (let i = 0; i < line.length; i++) {
			if (line[i] != symbol) return i
		}
		return 0
	}
}
