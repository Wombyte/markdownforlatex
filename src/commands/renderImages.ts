import { Poppler } from 'node-poppler'
import * as vscode from 'vscode'

export default function renderImages(doc: vscode.TextDocument): void {
	// get data from parser
	const data = [
		{
			src: 'C:/Users/marcu/Desktop/Programme/VSCodeExtension/markdownforlatex/src/test/preview/images/test.pdf',
			dst: 'C:/Users/marcu/Desktop/Programme/VSCodeExtension/markdownforlatex/src/test/preview/images/testimg',
			pages: [1, 1],
		},
	]

	const poppler = new Poppler()
	data.forEach(({ src, dst, pages }) => {
		const options = {
			firstPageToConvert: pages[0],
			lastPageToConvert: pages[1],
			singleFile: pages[0] === pages[1],
			pngFile: true,
			scalePageTo: 3000,
		}

		poppler.pdfToCairo(src, dst, options).catch((e) => {
			vscode.window.showErrorMessage(`${dst} could not be generated`)
			console.log(e)
			console.log({ src, dst, pages })
		})
	})
}
