import { window } from 'vscode'
import { existsSync } from 'fs'
import { Poppler } from 'node-poppler'
import path = require('path')

export default class ImageManager {
	currentPdfDirPath?: string
	currentPdfPath?: string
	dstPath: string
	poppler: Poppler

	constructor(dstPath: string) {
		this.dstPath = dstPath
		this.poppler = new Poppler()
	}

	set pdfDirPath(pdfDirPath: string) {
		if (!existsSync(pdfDirPath)) {
			throw Error(`path ${pdfDirPath} does not exist`)
		}
		this.currentPdfDirPath = pdfDirPath
	}

	set pdfPath(pdfPath: string) {
		const p =
			this.currentPdfDirPath && !pdfPath.includes(':')
				? path.join(this.currentPdfDirPath, pdfPath)
				: pdfPath
		if (!p.endsWith('.pdf')) {
			throw Error(`path ${p} is not a .pdf-file`)
		}
		if (!existsSync(p)) {
			throw Error(`path ${p} does not exist`)
		}
		this.currentPdfPath = p
	}

	createImage(name: string, startPage: number, endPage: number): void {
		if (!this.currentPdfPath) {
			throw Error('image not created. Pdf is not set')
		}
		const dst = path.join(this.dstPath, `${name}`)
		if (existsSync(`${dst}.png`)) return

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
