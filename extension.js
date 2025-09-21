const vscode = require("vscode");
const fs = require("fs");
const path = require("path");

function activate(context) {
    let disposable = vscode.commands.registerCommand(
        "smart-todo-tracker.todo",
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

function normalizePath(filePath) {
    return filePath.replace(/\\/g, "/").trim();
}

function updateOrAppend(filePath, absFileName, newRecords) {
    const normalizedFileName = normalizePath(absFileName);

    // Read existing TODOs.txt or start empty
    let text = "";
    if (fs.existsSync(filePath)) {
        text = fs.readFileSync(filePath, "utf8");
    }

    // Prepare stringified records
    const stringifiedRecords = newRecords
        .map(r => JSON.stringify(r))
        .join("\n");

    // Escape for regex
    const escapedFileName = normalizedFileName.replace(
        /[.*+?^${}()|[\]\\]/g,
        "\\$&"
    );

    // Regex to match the block
    const regex = new RegExp(
        `(\\*\\*start\\*\\*\\s*FileName:\\s*${escapedFileName}\\s*\\n)([\\s\\S]*?)(?=\\*\\*end\\*\\*)`,
        "m"
    );

    let action = "";

    if (regex.test(text)) {
        console.log("Block found, replacing...");
        text = text.replace(regex, (match, header) => {
            return `${header}${stringifiedRecords}\n`;
        });
    } else {
        console.log("Block not found, appending...");
        const newBlock = `**start**
FileName: ${normalizedFileName}
${stringifiedRecords}
**end**\n`;

        text += (text.endsWith("\n") ? "" : "\n") + newBlock;
        action = "appended";
    }

    fs.writeFileSync(filePath, text, "utf8");

    vscode.window.showInformationMessage(
        `TODOs.txt ${action} successfully for ${normalizedFileName} with ${newRecords.length} record(s)`
    );
}
