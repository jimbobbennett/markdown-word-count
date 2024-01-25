// An extension to count words in a document. This is derived from the Microsoft word count, but adds support for
// more file types than just markdown.

import * as vscode from 'vscode';

// The status bar item to display the word count
let wordCountStatusBarItem: vscode.StatusBarItem;

export function activate({ subscriptions }: vscode.ExtensionContext) {
	// create a new status bar item that we can now manage
	wordCountStatusBarItem = vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Left, 1);

	// register some listener that make sure the status bar 
	// item always up-to-date
	subscriptions.push(vscode.window.onDidChangeActiveTextEditor(updateStatusBarItem));
	subscriptions.push(vscode.window.onDidChangeTextEditorSelection(updateStatusBarItem));
	subscriptions.push(vscode.workspace.onDidSaveTextDocument(updateStatusBarItem));

	// update status bar item once at start
	updateStatusBarItem();
}

function updateStatusBarItem(): void {
	let editor = vscode.window.activeTextEditor;
	if (!editor) {
		wordCountStatusBarItem.hide();
		return;
	}

	let doc = editor.document;

	console.info(doc.languageId);

	// Only update status if an MD file
	if (shouldCountWords(doc)) {
		let wordCount = getWordCount(doc);

		// Update the status bar
		wordCountStatusBarItem.text = wordCount !== 1 ? `$(pencil) ${wordCount} Words` : '$(pencil) 1 Word';
		wordCountStatusBarItem.show();
	} else {
		wordCountStatusBarItem.hide();
	}
}

function shouldCountWords(doc: vscode.TextDocument): boolean {
	switch (doc.languageId) {
		case "markdown":
		case "plaintext":
		case "mdx":
			return true;
		default:
			return false;
	}
}

export function getWordCount(doc: vscode.TextDocument): number {
	let docContent = doc.getText();

	// Parse out unwanted whitespace so the split is accurate
	docContent = docContent.replace(/(< ([^>]+)<)/g, '').replace(/\s+/g, ' ');
	docContent = docContent.replace(/^\s\s*/, '').replace(/\s\s*$/, '');
	let wordCount = 0;
	if (docContent !== "") {
		wordCount = docContent.split(" ").length;
	}

	return wordCount;
}
