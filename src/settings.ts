import {App, PluginSettingTab, Setting} from "obsidian";
import DefaultTemplatePlugin from "./main";

export interface FolderMapping {
	folder: string;
	templatePath: string;
	filenamePattern: string;
}

export interface DefaultTemplatePluginSettings {
	defaultTemplatePath: string;
	defaultFilenamePattern: string;
	folderMappings: FolderMapping[];
}

export const DEFAULT_SETTINGS: DefaultTemplatePluginSettings = {
	defaultTemplatePath: '',
	defaultFilenamePattern: '',
	folderMappings: []
}

export class DefaultTemplateSettingTab extends PluginSettingTab {
	plugin: DefaultTemplatePlugin;

	constructor(app: App, plugin: DefaultTemplatePlugin) {
		super(app, plugin);
		this.plugin = plugin;
	}

	display(): void {
		const {containerEl} = this;

		containerEl.empty();

		new Setting(containerEl)
			.setName('Template defaults')
			.setHeading();

		new Setting(containerEl)
			.setName('Default template path')
			.setDesc('Path to the default template file (e.g., templates/default.md)')
			.addText(text => text
				.setPlaceholder('templates/default.md')
				.setValue(this.plugin.settings.defaultTemplatePath)
				.onChange(async (value) => {
					this.plugin.settings.defaultTemplatePath = value;
					await this.plugin.saveSettings();
				}));

		new Setting(containerEl)
			.setName('Default filename pattern')
			.setDesc('Pattern for new notes (e.g., {{date}} {{time}})')
			.addText(text => text
				.setPlaceholder('{{date}} {{time}}')
				.setValue(this.plugin.settings.defaultFilenamePattern)
				.onChange(async (value) => {
					this.plugin.settings.defaultFilenamePattern = value;
					await this.plugin.saveSettings();
				}));

		new Setting(containerEl)
			.setName('Folder-specific templates')
			.setHeading();
		
		containerEl.createEl('p', {
			text: 'Configure different templates and filename patterns for specific folders. ' +
				'Note: This works best when "Default location for new notes" is set to "Same folder as current file" or "In the folder specified below".'
		});

		this.plugin.settings.folderMappings.forEach((mapping, index) => {
			const s = new Setting(containerEl)
				.addText(text => text
					.setPlaceholder('Folder path')
					.setValue(mapping.folder)
					.onChange(async (value) => {
						mapping.folder = value;
						await this.plugin.saveSettings();
					}))
				.addText(text => text
					.setPlaceholder('Template path')
					.setValue(mapping.templatePath)
					.onChange(async (value) => {
						mapping.templatePath = value;
						await this.plugin.saveSettings();
					}))
				.addText(text => text
					.setPlaceholder('Filename pattern')
					.setValue(mapping.filenamePattern)
					.onChange(async (value) => {
						mapping.filenamePattern = value;
						await this.plugin.saveSettings();
					}))
				.addButton(button => button
					.setButtonText('Remove')
					.setWarning()
					.onClick(async () => {
						this.plugin.settings.folderMappings.splice(index, 1);
						await this.plugin.saveSettings();
						this.display();
					}));
			
			s.infoEl.remove(); // Remove the info element to make it more compact
		});

		new Setting(containerEl)
			.addButton(button => button
				.setButtonText('Add folder mapping')
				.setCta()
				.onClick(async () => {
					this.plugin.settings.folderMappings.push({
						folder: '',
						templatePath: '',
						filenamePattern: ''
					});
					await this.plugin.saveSettings();
					this.display();
				}));
	}
}
