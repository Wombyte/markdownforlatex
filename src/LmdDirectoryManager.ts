import { window, workspace, TextDocument } from 'vscode'
import { copySync, removeSync } from 'fs-extra'
import { existsSync, renameSync, unlink, unlinkSync } from 'fs'
import * as path from 'path'

/**
 * @param templateDirPath dir of the template dir
 * @returns path to .lmd file (undefined when error)
 */
export default function initLmdDirectory(
	templateDirPath: string
): Thenable<string | undefined> | undefined {
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
		if (!name) return undefined
		createLmdDirectory(templateDirPath, dstPath, name)
		return path.join(dstPath, `${name}.lmd`)
	})
}

function createLmdDirectory(templateDirPath: string, dstPath: string, fileName: string): void {
	const lmdFilePath = path.join(dstPath, `${fileName}.lmd`)

	// copy files
	try {
		copySync(templateDirPath, dstPath, { overwrite: false })
	} catch (e) {
		window.showErrorMessage(
			'Template directory could not be copied. See console for more information.'
		)
	}

	const copiedLmdFile = path.join(dstPath, 'template.lmd')
	if (existsSync(lmdFilePath)) {
		try {
			unlinkSync(copiedLmdFile)
		} catch (e) {
			window.showErrorMessage(
				'Lmd-File already existed, but the new Lmd-File could not be removed'
			)
		}
	} else {
		try {
			renameSync(copiedLmdFile, lmdFilePath)
		} catch (e) {
			window.showErrorMessage(
				'The .lmd-file could not be renamed. See console for more information.'
			)
		}
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
