import { window, ExtensionContext, TextDocument, commands, Uri } from 'vscode'
import initLmdDirectory from './commands/initLmdDirectory'
import * as path from 'path'
import LmdToLatexParser from './parser/LmdToLatexParser'
import { writeFile } from 'fs'
import runLatex from './commands/runLatex'
import { LmdLexer } from './parser/LmdLexer'

export function activate(context: ExtensionContext): void {
	// Markdown For Latex: Init LMD-Directory
	let initDir = commands.registerCommand('markdownforlatex.initLmdDir', () =>
		initLmdDirectoryFunc(context)
	)

	// Markdown For Latex: Parse to Latex
	let parseToLatex = commands.registerCommand(
		'markdownforlatex.parseToLatex',
		() => parseToLatexFunc(context)
	)

	// Markdown For Latex: Render Images
	let renderImages = commands.registerCommand(
		'markdownforlatex.renderImages',
		() => renderImagesFunc(context)
	)

	// Markdown For Latex: Create PDF
	let createPdf = commands.registerCommand('markdownforlatex.createPdf', () =>
		createPdfFunc(context)
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
function getOpenLmdFile(): TextDocument | undefined {
	const editor = window.activeTextEditor
	if (editor == null || editor.document == null) {
		window.showErrorMessage('No file open')
		return undefined
	}
	const doc = editor.document
	if (doc.languageId !== 'lmd') {
		window.showErrorMessage('Open File is not an lmd-File')
		return undefined
	}
	return doc
}

function getLatexFilePath(lmdFile: TextDocument): string {
	const fileName = path.basename(lmdFile.fileName)
	const fileNameWithoutExtension = fileName.substring(
		0,
		fileName.indexOf('.')
	)
	const dirName = path.dirname(lmdFile.fileName)
	return path.join(dirName, fileNameWithoutExtension + '.tex')
}

function getImageDirPath(lmdFile: TextDocument): string {
	const dirName = path.dirname(lmdFile.fileName)
	return path.join(dirName, 'images')
}

function initLmdDirectoryFunc(context: ExtensionContext): void {
	const templateDirPath = path.join(context.extensionUri.fsPath, 'template')
	initLmdDirectory(templateDirPath)
}

function parseToLatexFunc(context: ExtensionContext): void {
	const lmdFile = getOpenLmdFile()
	if (!lmdFile) {
		window.showErrorMessage('No .lmd-File')
		return
	}
	const latexFilePath = getLatexFilePath(lmdFile)
	const imageDirPath = getImageDirPath(lmdFile)

	const parser = new LmdToLatexParser(lmdFile, imageDirPath)
	const result = parser.parse()

	writeFile(latexFilePath, result, function (err) {
		if (err) throw err
		window.showInformationMessage('Latex File created')
	})
}

function renderImagesFunc(context: ExtensionContext): void {
	const lmdFile = getOpenLmdFile()
	if (!lmdFile) {
		window.showErrorMessage('No .lmd-File')
		return
	}
	const imageDirPath = getImageDirPath(lmdFile)
	const lexer = new LmdLexer(lmdFile.getText(), { onlyMakros: true })
	const lexerResult = lexer.lex()
	const parser = new LmdToLatexParser(lmdFile, imageDirPath)
	parser.executeMakros(lexerResult.commands)
}

function createPdfFunc(context: ExtensionContext): void {
	const lmdFile = getOpenLmdFile()
	if (!lmdFile) {
		window.showErrorMessage('No .lmd-File')
		return
	}
	const texFilePath = getLatexFilePath(lmdFile)
	runLatex(texFilePath)
}
