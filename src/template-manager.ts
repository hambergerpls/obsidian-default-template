import { App, TFile, moment } from 'obsidian';
import { v4 as uuidv4 } from 'uuid';

export class TemplateManager {
	app: App;

	constructor(app: App) {
		this.app = app;
	}

	async getTemplateContent(templatePath: string): Promise<string> {
		if (!templatePath) return '';
		
		const file = this.app.vault.getAbstractFileByPath(templatePath);
		if (file instanceof TFile) {
			return await this.app.vault.read(file);
		}
		return '';
	}

	applyVariables(content: string, title: string): string {
		let replacedContent = content;

		// Replace {{title}}
		replacedContent = replacedContent.replace(/{{title}}/g, title);

		// Replace {{uuid}}
		replacedContent = replacedContent.replace(/{{uuid}}/g, () => uuidv4());

		// Replace {{date}} and {{date:FORMAT}}
		replacedContent = replacedContent.replace(/{{date(?::([^}]+))?}}/g, (_, format: string | undefined) => {
			return moment().format(format || 'YYYY-MM-DD');
		});

		// Replace {{time}} and {{time:FORMAT}}
		replacedContent = replacedContent.replace(/{{time(?::([^}]+))?}}/g, (_, format: string | undefined) => {
			return moment().format(format || 'HH:mm');
		});

		return replacedContent;
	}
}