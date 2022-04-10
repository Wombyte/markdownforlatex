import * as vscode from 'vscode'
import LmdLexer from './LmdLexer'
import LmdTreeTraversal from './LmdTreeTraversal'
import { LmdNode } from './types'

export default class LmdParser {
	private lexer

	constructor(srcFile: vscode.TextDocument) {
		this.lexer = new LmdLexer(srcFile.getText())
	}

	parse(): string {
		const lexerResult = this.lexer.lex()
		console.log(lexerResult.root)

		// execute Makros

		// parse lexer result
		const trav = new LmdTreeTraversalForLatex(lexerResult.root)
		trav.traverse()
		/*let text = ''
		const stack = [lexerResult.root]
		while (stack.length > 0) {
			const node = stack.pop()
			if (!node) continue
			text +=
				this.getSpaces(node.depth) +
				node.text.main +
				node.text.additions +
				'\n'
			stack.push(...node.children.reverse())
		}*/

		return (
			'\\documentclass{lmdscript}\n' + lexerResult.preamble + trav.result
		)
	}
}

/**
 * needs SETTINGS.compactLmdNodeLines to be true
 */
class LmdTreeTraversalForLatex extends LmdTreeTraversal {
	result: string

	TEX_SECTION_COMMANDS: string[] = [
		'chapter',
		'section',
		'subsection',
		'subsubsection',
		'paragraph',
	]

	TEX_NOTE_COMMANDS: Map<string, string> = new Map([
		['.', 'num'],
		[',', 'note'],
		['+', 'plus'],
		['-', 'minus'],
		['!', 'nota'],
		['*', 'theo'],
		['=>', 'conc'],
		['lor', 'lor'],
		['land', 'land'],
		['"', 'expl'],
		['eg', 'smpl'],
	])

	constructor(root: LmdNode) {
		super(root)
		this.result = ''
	}

	visitRoot(node: LmdNode): void {
		this.result += '\\begin{document}\n'
	}

	afterRoot(node: LmdNode): void {
		this.result += '\\end{document}\n'
	}

	visitSection(node: LmdNode): void {
		this.result += `\\${this.TEX_SECTION_COMMANDS[node.depth - 1]}{${
			node.content[0]
		}}\n`
		this.handleContentRest(node.content, 1)
		if (LmdTreeTraversalForLatex.hasNoteChild(node)) {
			this.result += '\\begin{notes}' + '\n'
		}
	}

	afterSection(node: LmdNode): void {
		if (LmdTreeTraversalForLatex.hasNoteChild(node)) {
			this.result += '\\end{notes}' + '\n'
		}
	}

	visitDefinition(node: LmdNode): void {
		const pre = node.content[1]
		const head = node.content[2]
		const rest = node.content[3]
		if (pre == '') {
			this.result += `\\defi{${head}}{${rest}}\n`
		} else {
			this.result += `\\defi[${pre}]{${head}}{${rest}}\n`
		}
		this.handleContentRest(node.content, 4)
		if (LmdTreeTraversalForLatex.hasNoteChild(node)) {
			this.result += '\\begin{notes}' + '\n'
		}
	}

	afterDefinition(node: LmdNode): void {
		if (LmdTreeTraversalForLatex.hasNoteChild(node)) {
			this.result += '\\end{notes}' + '\n'
		}
	}

	visitNote(node: LmdNode): void {
		const command = this.TEX_NOTE_COMMANDS.get(node.content[0])
		const head = node.content[1]
		const rest = node.content[2]
		if (head == '') {
			this.result += `\\${command}{${rest}}\n`
		} else {
			this.result += `\\${command}[${head}]{${rest}}\n`
		}
		this.handleContentRest(node.content, 3)
		if (LmdTreeTraversalForLatex.hasNoteChild(node)) {
			this.result += '\\begin{notes}' + '\n'
		}
	}

	afterNote(node: LmdNode): void {
		if (LmdTreeTraversalForLatex.hasNoteChild(node)) {
			this.result += '\\end{notes}' + '\n'
		}
	}

	visitImage(node: LmdNode): void {
		const name = node.content[0]
		const size = node.content[1]
		this.result += `\\pic{${name}}{${size}}\n`
		this.handleContentRest(node.content, 2)
	}

	handleContentRest(content: string[], startIndex: number): void {
		for (let i = startIndex; i < content.length; i++) {
			let text = content[i]
			if (text[0] == '$') {
				let math = content[i].replace('\\$\\$\\$\\$', '\\\\')
				math = math.substring(2, math.length - 2)
			}
			this.result += text + '\n'
		}
	}

	static hasNoteChild(node: LmdNode): boolean {
		if (node.children.length == 0) return false
		return node.children.some(
			(n) => n.type === 'note' || n.type === 'definition'
		)
	}
}