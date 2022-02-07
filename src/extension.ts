// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from 'vscode'

// this method is called when your extension is activated
// your extension is activated the very first time the command is executed
export function activate(context: vscode.ExtensionContext) {
	
	// Use the console to output diagnostic information (console.log) and errors (console.error)
	// This line of code will only be executed once when your extension is activated
	console.log('Congratulations, your extension "helloworld" is now active!')

	// The command has been defined in the package.json file
	// Now provide the implementation of the command with registerCommand
	// The commandId parameter must match the command field in package.json
	let parseToLatex = vscode.commands.registerCommand('markdownforlatex.parseToLatex', () => {
		const editor = vscode.window.activeTextEditor
		if (editor == null || editor.document == null) {
			vscode.window.showErrorMessage('No file open')
			return
		}
		const doc = editor.document
		if (doc.languageId !== 'mwd') {
			vscode.window.showErrorMessage('Open File is not an MWarkDown-File')
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
	context.subscriptions.push(parseToLatex)
	context.subscriptions.push(renderImages)
	context.subscriptions.push(createPdf)

}

// this method is called when your extension is deactivated
export function deactivate() {}
