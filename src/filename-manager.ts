import { App, moment, TFile } from 'obsidian';
import { v4 as uuidv4 } from 'uuid';

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

		// Replace {{uuid}}
		filename = filename.replace(/{{uuid}}/g, () => uuidv4());

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

		let finalName = newName;
		let newPath = `${file.parent?.path}/${finalName}.${file.extension}`;
		let counter = 1;

		// Check if file already exists to avoid collision
		while (this.app.vault.getAbstractFileByPath(newPath)) {
			finalName = `${newName} ${counter}`;
			newPath = `${file.parent?.path}/${finalName}.${file.extension}`;
			counter++;
		}

		await this.app.fileManager.renameFile(file, newPath);
	}
}