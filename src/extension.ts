import * as vscode from 'vscode'

export function activate(context: vscode.ExtensionContext) {
	let initDir = vscode.commands.registerCommand('markdownforlatex.init', () => {
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
		const path = doc.uri.fsPath
		vscode.window.showInformationMessage(path, doc.uri.path)
	})
	let parseToLatex = vscode.commands.registerCommand('markdownforlatex.parseToLatex', () => {
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
	})
	let renderImages = vscode.commands.registerCommand('markdownforlatex.renderImages', () => {
		vscode.window.showInformationMessage('Render Images')
	})	
	let createPdf = vscode.commands.registerCommand('markdownforlatex.createPdf', () => {
		vscode.window.showInformationMessage('Create PDF')
	})
	context.subscriptions.push(initDir)
	context.subscriptions.push(parseToLatex)
	context.subscriptions.push(renderImages)
	context.subscriptions.push(createPdf)
}

export function deactivate() {}
