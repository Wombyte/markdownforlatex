import * as vscode from 'vscode'
import LmdLexer from './LmdLexer'
import LmdTreeTraversal from './LmdTreeTraversal'
import { LmdNode } from './types'
import * as RESOURCES from './RESOURCES.json'
import ImageManager from './ImageManager'

type MakroHandler = {
	name: string
	args: string[]
	handler: (parser: LmdToLatexParser, args: string[]) => void

	// created
	regex?: RegExp
}

export default class LmdToLatexParser {
	private lexer: LmdLexer
	private imageManager: ImageManager

	private MAKRO_HANDLER: MakroHandler[] = [
		{
			name: RESOURCES.makros.setpdf.name,
			args: RESOURCES.makros.setpdf.args,
			handler: this.handleSetPdf,
		},
		{
			name: RESOURCES.makros.crimg.name,
			args: RESOURCES.makros.crimg.args,
			handler: this.handleCreateImage,
		},
	]

	constructor(srcFile: vscode.TextDocument, imgDir: string) {
		this.lexer = new LmdLexer(srcFile.getText())
		this.MAKRO_HANDLER.forEach((handler) => {
			const argRegex = handler.args
				// @ts-ignore: RESOURCES.makroArgRegex has to have arg as key!
				.map((arg) => RESOURCES.makroArgRegex[arg])
				.join(' ')
			handler.regex = new RegExp('_' + handler.name + ' ' + argRegex)
		})
		this.imageManager = new ImageManager(imgDir)
	}

	parse(): string {
		const lexerResult = this.lexer.lex()

		// execute Makros
		lexerResult.commands.forEach((command) => {
			const args = LmdToLatexParser.getArguments(command)
			if (args.length <= 0) {
				vscode.window.showErrorMessage(`makro has no name: ${command}`)
				return
			}
			const makro = this.MAKRO_HANDLER.find((h) => h.regex?.test(command))
			if (!makro) {
				vscode.window.showErrorMessage(
					`no such makro found: ${command}`
				)
				return
			}
			makro.handler(this, args)
		})

		// parse lexer result
		const trav = new LmdTreeTraversalForLatex(lexerResult.root)
		trav.traverse()

		return (
			'\\documentclass{build/lmdscript}\n' +
			lexerResult.preamble +
			trav.result
		)
	}

	handleSetPdf(parser: LmdToLatexParser, args: string[]): void {
		const path = args[0]
		parser.imageManager.pdfPath = path
	}

	handleCreateImage(parser: LmdToLatexParser, args: string[]): void {
		const name = args[0]
		const page = LmdToLatexParser.toNumber(args[1])
		parser.imageManager.createImage(name, page, page)
	}

	static getArguments(command: string): string[] {
		const args: string[] = []
		const segments = command.split(' ')

		for (let i = 1; i < segments.length; i++) {
			let string = segments[i]
			if (segments[i].startsWith('"')) {
				while (!segments[i].endsWith('"')) {
					string += ' ' + segments[i + 1]
					i++
				}
				string = string.substring(1, string.length - 1)
			}
			args.push(string)
		}

		return args
	}

	static toNumber(arg: string): number {
		return +arg
	}
}

/**
 * needs SETTINGS.compactLmdNodeLines to be true
 */
class LmdTreeTraversalForLatex extends LmdTreeTraversal {
	result: string

	TEX_SECTION_COMMANDS: string[] = [
		'paragraph',
		'subsubsection',
		'subsection',
		'section',
		'chapter',
	]

	TEX_NOTE_COMMANDS: Map<string, string> = new Map([
		['.', 'num'],
		[',', 'note'],
		['+', 'plus'],
		['-', 'minus'],
		['!', 'nota'],
		['*', 'theo'],
		['=>', 'conc'],
		['|', 'lornote'],
		['&', 'landnote'],
		['"', 'expl'],
		['eg', 'smpl'],
		['[', 'blank'],
	])

	openText?: string

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
		const sectionCommand =
			this.TEX_SECTION_COMMANDS[node.hierarchyNumber - 1]
		this.result += `\\${sectionCommand}{${node.content[0]}}\n`
		if (LmdTreeTraversalForLatex.hasNoteChild(node)) {
			this.openText = '\\begin{notes}' + '% ' + node.content[0] + '\n'
		}
		this.handleContentRest(node.content, 1, -node.hierarchyNumber)
	}

	afterSection(node: LmdNode): void {
		if (LmdTreeTraversalForLatex.hasNoteChild(node)) {
			this.result += '\\end{notes}' + '% ' + node.content[0] + '\n'
		}
	}

	visitDefinition(node: LmdNode): void {
		if (this.openText) {
			this.result += this.openText
			this.openText = undefined
		}

		const pre = node.content[1]
		const head = node.content[2]
		const rest = node.content[3]
		this.result += LmdTreeTraversalForLatex.getSpaces(-node.hierarchyNumber)
		if (pre == '') {
			this.result += `\\defi{${head}}{${rest}}\n`
		} else {
			this.result += `\\defi[${pre}]{${head}}{${rest}}\n`
		}
		this.handleContentRest(node.content, 4, -node.hierarchyNumber)
		if (LmdTreeTraversalForLatex.hasNoteChild(node)) {
			this.openText = LmdTreeTraversalForLatex.getSpaces(
				-node.hierarchyNumber
			)
			this.openText += '\\begin{notes}' + '% ' + node.content[0] + '\n'
		}
	}

	afterDefinition(node: LmdNode): void {
		if (LmdTreeTraversalForLatex.hasNoteChild(node)) {
			this.result += LmdTreeTraversalForLatex.getSpaces(
				-node.hierarchyNumber
			)
			this.result += '\\end{notes}' + '% ' + node.content[0] + '\n'
		}
	}

	visitNote(node: LmdNode): void {
		if (this.openText) {
			this.result += this.openText
			this.openText = undefined
		}

		const command = this.TEX_NOTE_COMMANDS.get(node.content[0])
		const head = node.content[1]
		const rest = node.content[2]
		this.result += LmdTreeTraversalForLatex.getSpaces(-node.hierarchyNumber)
		if (head == '') {
			this.result += `\\${command}{${rest}}\n`
		} else {
			this.result += `\\${command}[${head}]{${rest}}\n`
		}
		this.handleContentRest(node.content, 3, -node.hierarchyNumber)
		if (LmdTreeTraversalForLatex.hasNoteChild(node)) {
			this.openText = LmdTreeTraversalForLatex.getSpaces(
				-node.hierarchyNumber
			)
			this.openText += '\\begin{notes}' + '% ' + node.content[0] + '\n'
		}
	}

	afterNote(node: LmdNode): void {
		if (LmdTreeTraversalForLatex.hasNoteChild(node)) {
			this.result += LmdTreeTraversalForLatex.getSpaces(
				-node.hierarchyNumber
			)
			this.result += '\\end{notes}' + '% ' + node.content[0] + '\n'
		}
	}

	visitImage(node: LmdNode): void {
		const name = node.content[0]
		const size = node.content[1]
		this.result += `\\pic{${name}}{${size}}\n`
		this.handleContentRest(node.content, 2, -node.hierarchyNumber)
	}

	handleContentRest(
		content: string[],
		startIndex: number,
		indent: number
	): void {
		for (let i = startIndex; i < content.length; i++) {
			let text = content[i]
			if (text[0] == '$') {
				let math = content[i].replace('\\$\\$\\$\\$', '\\\\')
				math = math.substring(2, math.length - 2)
			}
			this.result += LmdTreeTraversalForLatex.getSpaces(indent)
			this.result += text + '\n'
		}
	}

	static hasNoteChild(node: LmdNode): boolean {
		if (node.children.length == 0) return false
		return node.children.some(
			(n) => n.type === 'note' || n.type === 'definition'
		)
	}

	static getSpaces(n: number): string {
		let s = ''
		for (let i = 0; i < n; i++) {
			s += '\t'
		}
		return s
	}
}
