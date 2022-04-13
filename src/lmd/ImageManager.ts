import { window } from 'vscode'
import { existsSync } from 'fs'
import { Poppler } from 'node-poppler'
import path = require('path')

export default class ImageManager {
	currentPdfPath?: string
	dstPath: string
	poppler: Poppler

	constructor(dstPath: string) {
		this.dstPath = dstPath
		this.poppler = new Poppler()
	}

	set pdfPath(path: string) {
		if (!path.endsWith('.pdf')) {
			throw Error(`path ${path} is not a .pdf-file`)
		}
		if (!existsSync(path)) {
			throw Error(`path ${path} does not exist`)
		}
		this.currentPdfPath = path
	}

	createImage(name: string, startPage: number, endPage: number): void {
		if (!this.currentPdfPath) {
			throw Error('image not created. Pdf is not set')
		}
		const dst = path.join(this.dstPath, `${name}`)
		if (existsSync(dst)) return

		const options = {
			firstPageToConvert: startPage,
			lastPageToConvert: endPage,
			singleFile: startPage === endPage,
			pngFile: true,
			scalePageTo: 3000,
		}

		this.poppler.pdfToCairo(this.currentPdfPath, dst, options).catch((e) => {
			window.showErrorMessage(`${dst} could not be generated`)
		})
	}
}
