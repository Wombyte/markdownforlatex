import * as vscode from 'vscode'
import initLmdDirectory from './commands/initLmdDirectory'
import renderImages from './commands/renderImages'
import * as path from 'path'

export function activate(context: vscode.ExtensionContext): void {
	// Markdown For Latex: Init LMD-Directory
	let initDir = vscode.commands.registerCommand(
		'markdownforlatex.initLmdDir',
		() => initLmdDirectoryFunc(context)
	)

	// Markdown For Latex: Parse to Latex
	let parseToLatex = vscode.commands.registerCommand(
		'markdownforlatex.parseToLatex',
		() => parseToLatexFunc(context)
	)

	// Markdown For Latex: Render Images
	let renderImages = vscode.commands.registerCommand(
		'markdownforlatex.renderImages',
		() => renderImagesFunc(context)
	)

	// Markdown For Latex: Create PDF
	let createPdf = vscode.commands.registerCommand(
		'markdownforlatex.createPdf',
		() => createPdfFunc(context)
	)

	context.subscriptions.push(initDir)
	context.subscriptions.push(parseToLatex)
	context.subscriptions.push(renderImages)
	context.subscriptions.push(createPdf)
}

export function deactivate(): void {}

/**
 * @returns the document of the active text editor if it is an .lmd-file, or undefined if not
 */
function getOpenLmdFile(): vscode.TextDocument | undefined {
	const editor = vscode.window.activeTextEditor
	if (editor == null || editor.document == null) {
		vscode.window.showErrorMessage('No file open')
		return undefined
	}
	const doc = editor.document
	if (doc.languageId !== 'lmd') {
		vscode.window.showErrorMessage('Open File is not an lmd-File')
		return undefined
	}
	return doc
}

function initLmdDirectoryFunc(context: vscode.ExtensionContext): void {
	const templateDirPath = path.join(context.extensionUri.fsPath, 'template')
	initLmdDirectory(templateDirPath)
}

function parseToLatexFunc(context: vscode.ExtensionContext): void {}

function renderImagesFunc(context: vscode.ExtensionContext): void {
	const lmdfile = getOpenLmdFile()
	if (!lmdfile) return
	renderImages(lmdfile)
}

function createPdfFunc(context: vscode.ExtensionContext): void {
	vscode.window.showInformationMessage('Create PDF')
}
