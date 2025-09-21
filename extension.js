const vscode = require("vscode");
const fs = require("fs");
const path = require("path");

function activate(context) {
    let disposable = vscode.commands.registerCommand(
        "rakeshnoothi-todo.todo",
        async () => {
            const editor = vscode.window.activeTextEditor;
            if (!editor) {
                vscode.window.showErrorMessage("No active editor open");
                return;
            }

            const document = editor.document;
            const regex = /\/\/\s*todo\s*:\s*(.*)/gi;
            const todos = [];

            // Iterate line by line to get line numbers
            for (let line = 0; line < document.lineCount; line++) {
                const record = getRecord(document, line, regex);
                if (record) {
                    todos.push(record);
                }
            }

            if (todos.length === 0) {
                vscode.window.showInformationMessage("No TODOs found!");
                return;
            }

            // Determine workspace folder
            const workspaceFolders = vscode.workspace.workspaceFolders;
            if (!workspaceFolders || workspaceFolders.length === 0) {
                vscode.window.showErrorMessage("No workspace folder open!");
                return;
            }

            const workspacePath = workspaceFolders[0].uri.fsPath;
            const filePath = path.join(workspacePath, "TODOs.txt");

            // Use full absolute file path for uniqueness
            updateOrAppend(filePath, document.fileName, todos);
        }
    );

    context.subscriptions.push(disposable);
}

function deactivate() {}

module.exports = { activate, deactivate };

function getRecord(document, line, regex) {
    const lineText = document.lineAt(line).text;
    const match = regex.exec(lineText);
    if (match && match[1]) {
        const record = {
            line: line + 1, // 1-based line index
            value: match[1].trim(),
        };
        return record;
    }
    return null;
}

function updateOrAppend(filePath, absFileName, newRecords) {
    let text = "";
    if (fs.existsSync(filePath)) {
        text = fs.readFileSync(filePath, "utf8");
    } else {
        text = ""; // start with empty content if TODOs.txt doesn't exist
    }

    // Convert records to JSON lines
    const stringifiedRecords = newRecords
        .map(r => JSON.stringify(r))
        .join("\n");

    // Escape regex special chars in file path (important for Windows paths)
    const escapedFileName = absFileName.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

    // Regex to find block for this file path
    const regex = new RegExp(
        `(\\*\\*start\\*\\*\\s*FileName:\\s*${escapedFileName}\\s*)([\\s\\S]*?)(?=\\*\\*end\\*\\*)`,
        "m"
    );

    if (regex.test(text)) {
        // Replace block
        text = text.replace(regex, (match, header) => {
            return `${header}${stringifiedRecords}\n`;
        });
    } else {
        // Append new block
        const newBlock = `**start**
FileName: ${absFileName}
${stringifiedRecords}
**end**\n`;
        text += (text.endsWith("\n") ? "" : "\n") + newBlock;
    }

    fs.writeFileSync(filePath, text, "utf8");
    console.log(`Updated TODOs.txt for ${absFileName}`);
    vscode.window.showInformationMessage(
        `Updated TODOs.txt with ${newRecords.length} todos for ${absFileName}`
    );
}
