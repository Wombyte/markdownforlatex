import * as vscode from 'vscode'
import initLmdDirectory from './commands/initLmdDirectory'
import renderImages from './commands/renderImages'
import * as path from 'path'
import LmdParser from './parser/LmdToLatexParser'
import { writeFile } from 'fs'

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

function getLatexFilePath(lmdFile: vscode.TextDocument): string {
	const fileName = path.basename(lmdFile.fileName)
	const fileNameWithoutExtension = fileName.substring(
		0,
		fileName.indexOf('.')
	)
	const dirName = path.dirname(lmdFile.fileName)
	return path.join(dirName, fileNameWithoutExtension + '.tex')
}

function initLmdDirectoryFunc(context: vscode.ExtensionContext): void {
	const templateDirPath = path.join(context.extensionUri.fsPath, 'template')
	initLmdDirectory(templateDirPath)
}

function parseToLatexFunc(context: vscode.ExtensionContext): void {
	const lmdFile = getOpenLmdFile()
	if (!lmdFile) return
	const latexFilePath = getLatexFilePath(lmdFile)

	const parser = new LmdParser(lmdFile)
	const result = parser.parse()

	writeFile(latexFilePath, result, function (err) {
		if (err) throw err
		vscode.window.showInformationMessage('Latex File created')
	})
}

function renderImagesFunc(context: vscode.ExtensionContext): void {
	const lmdfile = getOpenLmdFile()
	if (!lmdfile) return
	renderImages(lmdfile)
}

function createPdfFunc(context: vscode.ExtensionContext): void {
	vscode.window.showInformationMessage('Create PDF')
}
