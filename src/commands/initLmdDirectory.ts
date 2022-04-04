import * as vscode from 'vscode'
import { copySync } from 'fs-extra'
import { renameSync } from 'fs'
import * as path from 'path'

export default function initLmdDirectory(templateDirPath: string): void {
	const dstPath = getCurrentFolderPath()
	if (dstPath === undefined) return

	const dirName = dstPath.substring(dstPath.lastIndexOf('\\') + 1)
	const inputBoxOptions = {
		value: dirName,
		title: 'File Name',
		prompt: 'test',
	}
	vscode.window
		.showInputBox(inputBoxOptions)
		.then((name) => createLmdDirectory(templateDirPath, dstPath, name))
}

function createLmdDirectory(
	templateDirPath: string,
	dstPath: string,
	fileName?: string
): void {
	if (fileName === undefined) return

	// copy files
	try {
		copySync(templateDirPath, dstPath)
	} catch (e) {
		vscode.window.showErrorMessage(
			'Template directory could not be copied. See console for more information.'
		)
	}

	// rename lmd-file
	try {
		renameSync(
			path.join(dstPath, 'template.lmd'),
			path.join(dstPath, fileName + '.lmd')
		)
	} catch (e) {
		vscode.window.showErrorMessage(
			'The .lmd-file could not be renamed. See console for more information.'
		)
	}
}

function getCurrentFolderPath(): string | undefined {
	const folders = vscode.workspace.workspaceFolders
	if (folders === undefined || folders.length <= 0) {
		vscode.window.showErrorMessage('No Folder Open')
		return undefined
	}
	return folders[0].uri.fsPath
}
