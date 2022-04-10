import LmdTreeTraversal from './LmdTreeTraversal'
import { LmdNode, LmdNodeTypeNote } from './types'
import * as RESOURCES from './RESOURCES.json'

type NoteHandler = {
	regex: RegExp
	text: string
	length: number
}

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
		let heading = node.content[0]
		heading = heading.replace(new RegExp('#+\\s'), '')
		heading = heading.substring(1)
		node.content[0] = heading
	}

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
			node.content.unshift(start.text)
		} else {
			let segments = line.split('  ')
			segments = segments.reverse()
			segments.forEach((s) => node.content.unshift(s))
			node.content.unshift(start.text)
		}
	}

	visitDefinition(node: LmdNode): void {
		if (node.content.length <= 0) return

		let line = node.content.shift()!.substring(1)

		let segments = line.split('  ')
		if (line[0] === ' ') {
			segments[0] = segments[0].substring(1)
		}
		segments = segments.reverse()
		segments.forEach((s) => node.content.unshift(s))
		node.content.unshift('>')
	}

	visitImage(node: LmdNode): void {
		node.content = node.content[0].split(' ')
		if (node.content.length > 0) node.content.shift()
	}
}
