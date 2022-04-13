import * as path from 'path'
import { exec } from 'child_process'
import { window, workspace, Uri } from 'vscode'

export default function runLatex(texFilePath: string): void {
	const fileName = path.basename(texFilePath)
	const dirName = path.dirname(texFilePath)
	exec(
		`cd ${dirName} && pdflatex.exe -synctex=1 -interaction=nonstopmode ${fileName} -aux-directory=build`,
		(error, stdout, stderr) => {
			if (error) {
				window.showErrorMessage(error.message)
				return
			}
			if (stderr) {
				window.showErrorMessage(stderr)
				return
			}

			const pdfFileName = fileName.replace('.tex', '.pdf')
			window.showTextDocument(
				Uri.joinPath(Uri.file(dirName), pdfFileName)
			)
		}
	)
}
