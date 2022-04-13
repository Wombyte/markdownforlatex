import LmdTreeTraversal from '../LmdTreeTraversal'
import { LmdNode } from '../types'
import * as RESOURCES from '../RESOURCES.json'

type NoteHandler = {
	regex: RegExp
	text: string
	length: number
}

/**
 * Works on the tree structure from the LmdLexer. The content of every node is transformed
 * to have a readable structure.
 */
export default class LmdTreeNodeLexer extends LmdTreeTraversal {
	noteRegexes: NoteHandler[]

	constructor(root: LmdNode) {
		super(root)

		const escapeRegex = (string: string): string =>
			string.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&')

		this.noteRegexes = RESOURCES.noteStarts.map((start) => {
			return {
				regex: new RegExp('^' + escapeRegex(start)),
				text: start,
				length: start.length,
			}
		})
	}

	visitSection(node: LmdNode): void {
		node.content[0] = node.content[0].replace(new RegExp('#+\\s'), '')
	}

	/**
	 * content[0]: note symbol
	 * content[1]: head or ''
	 * content[2]: rest
	 * content[>2]: rest content
	 */
	visitNote(node: LmdNode): void {
		if (node.content.length <= 0) return

		let line = node.content.shift()!
		const start = this.noteRegexes.find((h) => h.regex.test(line))
		if (!start) {
			node.content.push(line)
			return
		}

		line = line.substring(start.length)
		if (line[0] === ' ') {
			node.content.unshift(line.substring(1))
			node.content.unshift('')
		} else {
			let segments = line.split('  ')
			if (segments.length <= 0) throw Error('head of node never ends')
			const head = segments.shift()!
			const rest = segments.join(' ')
			node.content.unshift(rest)
			node.content.unshift(head)
		}
		node.content.unshift(start.text)
	}

	/**
	 * content[0]: '>'
	 * content[1]: pre bold
	 * content[2]: bold
	 * content[3]: post bold
	 * content[>3]: rest
	 */
	visitDefinition(node: LmdNode): void {
		if (node.content.length <= 0) return

		let line = node.content.shift()!.substring(1)

		let segments = line.split('  ')
		if (line[0] === ' ') {
			segments[0] = segments[0].substring(1)
		} else {
			segments.unshift('')
		}
		node.content.unshift(...segments)
		node.content.unshift('>')
	}

	/**
	 * content[0]: 'img'
	 * content[1]: name
	 * content[2]: size
	 * content[>2]: rest
	 */
	visitImage(node: LmdNode): void {
		if (node.content.length <= 0) return

		let args = node.content.shift()!.split(' ')
		if (args.length <= 0) return

		args.shift()
		node.content.unshift(...args)
	}
}
