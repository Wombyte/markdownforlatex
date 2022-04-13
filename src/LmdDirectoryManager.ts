import { window, workspace, TextDocument } from 'vscode'
import { copySync } from 'fs-extra'
import { renameSync } from 'fs'
import * as path from 'path'

/**
 * @param templateDirPath dir of the template dir
 * @returns path to .lmd file (undefined when error)
 */
export default function initLmdDirectory(templateDirPath: string): Thenable<string> | undefined {
	const folders = workspace.workspaceFolders
	if (folders === undefined || folders.length <= 0) {
		window.showErrorMessage('No Folder Open')
		return undefined
	}
	const dstPath = folders[0].uri.fsPath

	const dirName = dstPath.substring(dstPath.lastIndexOf('\\') + 1)
	const inputBoxOptions = {
		value: dirName,
		title: 'File Name',
		prompt: 'test',
	}
	return window.showInputBox(inputBoxOptions).then((name) => {
		createLmdDirectory(templateDirPath, dstPath, name)
		return path.join(dstPath, `${name}.lmd`)
	})
}

function createLmdDirectory(templateDirPath: string, dstPath: string, fileName?: string): void {
	if (fileName === undefined) return

	// copy files
	try {
		copySync(templateDirPath, dstPath)
	} catch (e) {
		window.showErrorMessage(
			'Template directory could not be copied. See console for more information.'
		)
	}

	// rename lmd-file
	try {
		renameSync(path.join(dstPath, 'template.lmd'), path.join(dstPath, fileName + '.lmd'))
	} catch (e) {
		window.showErrorMessage(
			'The .lmd-file could not be renamed. See console for more information.'
		)
	}
}

export function getDirectoryPath(lmdFile: TextDocument): string {
	return path.dirname(lmdFile.fileName)
}

export function getImageDirPath(lmdFile: TextDocument): string {
	return path.join(getDirectoryPath(lmdFile), 'images')
}

export function getLatexFilePath(lmdFile: TextDocument): string {
	const fileNameWithoutExtension = getFileNameWithoutExtension(lmdFile)
	const dirName = getDirectoryPath(lmdFile)
	return path.join(dirName, fileNameWithoutExtension + '.tex')
}

export function getPdfFilePath(lmdFile: TextDocument): string {
	const fileNameWithoutExtension = getFileNameWithoutExtension(lmdFile)
	const dirName = getDirectoryPath(lmdFile)
	return path.join(dirName, fileNameWithoutExtension + '.pdf')
}

function getFileNameWithoutExtension(lmdFile: TextDocument): string {
	const fileName = path.basename(lmdFile.fileName)
	return fileName.substring(0, fileName.indexOf('.'))
}
