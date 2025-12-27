import { App, moment, TFile } from 'obsidian';

export class FilenameManager {
	app: App;

	constructor(app: App) {
		this.app = app;
	}

	generateFilename(pattern: string, originalTitle: string): string {
		if (!pattern) return originalTitle;

		let filename = pattern;

		// Replace {{title}}
		filename = filename.replace(/{{title}}/g, originalTitle);

		// Replace {{date}} and {{date:FORMAT}}
		filename = filename.replace(/{{date(?::([^}]+))?}}/g, (_, format: string | undefined) => {
			return moment().format(format || 'YYYY-MM-DD');
		});

		// Replace {{time}} and {{time:FORMAT}}
		filename = filename.replace(/{{time(?::([^}]+))?}}/g, (_, format: string | undefined) => {
			return moment().format(format || 'HH:mm');
		});

		// Remove characters that are illegal in filenames
		return filename.replace(/[\\/:*?"<>|]/g, '-');
	}

	async renameFile(file: TFile, newName: string) {
		if (!newName || file.basename === newName) return;

		const newPath = `${file.parent?.path}/${newName}.${file.extension}`;
		
		// Check if file already exists to avoid collision
		if (this.app.vault.getAbstractFileByPath(newPath)) {
			console.warn(`File ${newPath} already exists. Skipping rename.`);
			return;
		}

		await this.app.fileManager.renameFile(file, newPath);
	}
}