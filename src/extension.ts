import { window, ExtensionContext, TextDocument, commands, Uri } from 'vscode'
import * as path from 'path'
import LmdToLatexParser from './latex/LmdToLatexParser'
import { writeFile, writeFileSync } from 'fs'
import runLatex from './latex/runLatex'
import LmdLexer from './lmd/LmdLexer'
import initLmdDirectory, { getImageDirPath, getLatexFilePath } from './LmdDirectoryManager'

let extensionContext: ExtensionContext | undefined = undefined

export function activate(context: ExtensionContext): void {
	extensionContext = context
	// Markdown For Latex: Init LMD-Directory
	let initDir = commands.registerCommand('markdownforlatex.initLmdDir', initLmdDirectoryFunc)

	// Markdown For Latex: Parse to Latex
	let parseToLatex = commands.registerCommand('markdownforlatex.parseToLatex', parseToLatexFunc)

	// Markdown For Latex: Render Images
	let renderImages = commands.registerCommand('markdownforlatex.renderImages', renderImagesFunc)

	// Markdown For Latex: Create PDF
	let createPdf = commands.registerCommand('markdownforlatex.createPdf', createPdfFunc)

	extensionContext.subscriptions.push(initDir, parseToLatex, renderImages, createPdf)
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

function initLmdDirectoryFunc(): void {
	if (!extensionContext) {
		window.showErrorMessage('Extension is not active')
		return
	}
	const templateDirPath = path.join(extensionContext.extensionUri.fsPath, 'template')
	const lmdFilePathThenable = initLmdDirectory(templateDirPath)
	if (!lmdFilePathThenable) {
		window.showErrorMessage('Creation not successful')
	}
	lmdFilePathThenable!.then((lmdFilePath) => {
		const doc = Uri.file(lmdFilePath)
		window.showTextDocument(doc)
	})
}

function parseToLatexFunc(): void {
	const lmdFile = getOpenLmdFile()
	if (!lmdFile) {
		window.showErrorMessage('No .lmd-File')
		return
	}
	const latexFilePath = getLatexFilePath(lmdFile)
	const imageDirPath = getImageDirPath(lmdFile)

	const parser = new LmdToLatexParser(lmdFile, imageDirPath)
	const result = parser.parse()

	writeFileSync(latexFilePath, result)
	window.showInformationMessage('Latex File created')
}

function renderImagesFunc(): void {
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

	window.showInformationMessage('Images rendered')
}

function createPdfFunc(): void {
	const lmdFile = getOpenLmdFile()
	if (!lmdFile) {
		window.showErrorMessage('No .lmd-File')
		return
	}
	parseToLatexFunc()
	const texFilePath = getLatexFilePath(lmdFile)
	runLatex(texFilePath, () => {
		window.showInformationMessage('PDF created')
	})
}
