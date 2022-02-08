import * as vscode from 'vscode'
import initLmdDirectory from './commands/initLmdDirectory'
import * as path from 'path'

export function activate(context: vscode.ExtensionContext): void {
	const templateDirPath = path.join(context.extensionUri.fsPath, 'template')
	let initDir = vscode.commands.registerCommand('markdownforlatex.init', () =>
		initLmdDirectory(templateDirPath)
	)
	let parseToLatex = vscode.commands.registerCommand(
		'markdownforlatex.parseToLatex',
		() => {
			const editor = vscode.window.activeTextEditor
			if (editor == null || editor.document == null) {
				vscode.window.showErrorMessage('No file open')
				return
			}
			const doc = editor.document
			if (doc.languageId !== 'lmd') {
				vscode.window.showErrorMessage('Open File is not an lmd-File')
				return
			}
			const firstline = doc.lineAt(0)
			vscode.window.showInformationMessage(firstline.text)
		}
	)
	let renderImages = vscode.commands.registerCommand(
		'markdownforlatex.renderImages',
		() => {
			vscode.window.showInformationMessage('Render Images')
		}
	)
	let createPdf = vscode.commands.registerCommand(
		'markdownforlatex.createPdf',
		() => {
			vscode.window.showInformationMessage('Create PDF')
		}
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
