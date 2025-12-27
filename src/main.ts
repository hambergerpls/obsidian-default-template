import { Plugin, TFile, TAbstractFile } from 'obsidian';
import { DEFAULT_SETTINGS, DefaultTemplatePluginSettings, DefaultTemplateSettingTab } from "./settings";
import { TemplateManager } from "./template-manager";
import { FilenameManager } from "./filename-manager";

export default class DefaultTemplatePlugin extends Plugin {
	settings: DefaultTemplatePluginSettings;
	templateManager: TemplateManager;
	filenameManager: FilenameManager;

	async onload() {
		await this.loadSettings();

		this.templateManager = new TemplateManager(this.app);
		this.filenameManager = new FilenameManager(this.app);

		this.addSettingTab(new DefaultTemplateSettingTab(this.app, this));

		this.registerEvent(
			this.app.vault.on('create', (file: TAbstractFile) => {
				if (file instanceof TFile && file.extension === 'md') {
					void this.handleNewFile(file);
				}
			})
		);
	}

	async handleNewFile(file: TFile) {
		// Wait a bit to ensure the file is fully created and accessible
		// and to avoid race conditions with Obsidian's internal processes
		await new Promise(resolve => setTimeout(resolve, 100));

		// Check if file still exists and is empty
		const freshFile = this.app.vault.getAbstractFileByPath(file.path);
		if (!(freshFile instanceof TFile)) return;

		// Only apply to truly new files (created within the last 200 milliseconds)
		// to avoid triggering on files created by sync or other processes
		const isNew = (Date.now() - freshFile.stat.ctime) < 200;
		if (!isNew) return;
		
		const content = await this.app.vault.read(freshFile);

		const folderPath = freshFile.parent?.path || '';
		const mapping = this.settings.folderMappings.find(m => {
			if (!m.folder) return false;
			if (m.isRegex) {
				try {
					const regex = new RegExp(m.folder);
					return regex.test(folderPath);
				} catch (e) {
					console.error(`Invalid regex in folder mapping: ${m.folder}`, e);
					return false;
				}
			}
			return folderPath.startsWith(m.folder);
		});
		
		const templatePath = mapping?.templatePath || this.settings.defaultTemplatePath;
		const filenamePattern = mapping?.filenamePattern || this.settings.defaultFilenamePattern;

		// 1. Handle Renaming
		if (filenamePattern) {
			const newName = this.filenameManager.generateFilename(filenamePattern, freshFile.basename);
			if (newName !== freshFile.basename) {
				await this.filenameManager.renameFile(freshFile, newName);
			}
		}

		// 2. Handle Template
		if (templatePath && !(content.length > 0)) {
			const templateContent = await this.templateManager.getTemplateContent(templatePath);
			if (templateContent) {
				const finalContent = this.templateManager.applyVariables(templateContent, freshFile.basename);
				await this.app.vault.modify(freshFile, finalContent);
			}
		}
	}

	onunload() {
	}

	async loadSettings() {
		this.settings = Object.assign({}, DEFAULT_SETTINGS, await this.loadData() as Partial<DefaultTemplatePluginSettings>);
	}

	async saveSettings() {
		await this.saveData(this.settings);
	}
}
