import { LmdNode, LmdNodeType } from './types'

type LmdTreeTraversalHandler = {
	type: LmdNodeType
	visit: (node: LmdNode) => void
	backtrack: (node: LmdNode) => void
}

export default abstract class LmdTreeTraversal {
	root: LmdNode

	constructor(root: LmdNode) {
		this.root = root
	}

	traverse(): void {
		this.dfs(this.root)
	}

	dfs(node: LmdNode): void {
		switch (node.type) {
			case 'root':
				this.visitRoot(node)
				break
			case 'section':
				this.visitSection(node)
				break
			case 'definition':
				this.visitDefinition(node)
				break
			case 'note':
				this.visitNote(node)
				break
			case 'image':
				this.visitImage(node)
		}
		node.children.forEach((n) => this.dfs(n))
		switch (node.type) {
			case 'root':
				this.afterRoot(node)
				break
			case 'section':
				this.afterSection(node)
				break
			case 'definition':
				this.afterDefinition(node)
				break
			case 'note':
				this.afterNote(node)
				break
			case 'image':
				this.afterImage(node)
		}
	}

	visitRoot(node: LmdNode): void {}
	afterRoot(node: LmdNode): void {}
	visitSection(node: LmdNode): void {}
	afterSection(node: LmdNode): void {}
	visitDefinition(node: LmdNode): void {}
	afterDefinition(node: LmdNode): void {}
	visitNote(node: LmdNode): void {}
	afterNote(node: LmdNode): void {}
	visitImage(node: LmdNode): void {}
	afterImage(node: LmdNode): void {}
}
