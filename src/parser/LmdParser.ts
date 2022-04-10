import * as vscode from 'vscode'
import LmdLexer from './LmdLexer'

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

		return lexerResult.preamble
	}

	getSpaces(number: number): string {
		let text = ''
		for (let i = 0; i < number; i++) {
			text += '-'
		}
		return text
	}
}
