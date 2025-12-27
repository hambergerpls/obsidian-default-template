# Obsidian Default Template Plugin

An Obsidian plugin for creating notes with a default template, configurable per folder.

## Features
- Automatically inserts a predefined template when creating a new note.
- Configure different templates for different folders within your vault.
- Default filename patterns based on date, time, or custom text.

## How to use

- Clone this repo.
- Make sure your NodeJS is at least v16 (`node --version`).
- `npm i` or `yarn` to install dependencies.
- `npm run dev` to start compilation in watch mode.

## Manually installing the plugin

- Copy over `main.js`, `styles.css`, `manifest.json` to your vault `VaultFolder/.obsidian/plugins/your-plugin-id/`.

## Improve code quality with eslint
- [ESLint](https://eslint.org/) is a tool that analyzes your code to quickly find problems. You can run ESLint against your plugin to find common bugs and ways to improve your code. 
- This project already has eslint preconfigured, you can invoke a check by running`npm run lint`
- Together with a custom eslint [plugin](https://github.com/eslint-plugin) for Obsidan specific code guidelines.
- A GitHub action is preconfigured to automatically lint every commit on all branches.

## API Documentation

See https://docs.obsidian.md
