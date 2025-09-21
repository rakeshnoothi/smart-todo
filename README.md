# Smart TODO Tracker

Smart TODO Tracker is a Visual Studio Code extension that helps you **scan, track, and manage TODO comments in your code**. It automatically detects TODOs, records them with their **full file path and line number**, and allows you to **update or replace them efficiently** in a central `TODOs.txt` file within your workspace.

---

## Features

-   **Automatic TODO Detection**: Scans your open files line by line to detect `// TODO:` comments.
-   **Centralized TODO Records**: Saves TODOs in a workspace-level `TODOs.txt` file for easy reference.
-   **Edit and Update**: Update existing TODOs or add new ones directly from your editor.
-   **Full File Path Support**: Tracks TODOs by full file path, avoiding conflicts between files with the same name in different folders.
-   **Easy Notifications**: Shows VS Code notifications when TODOs are appended or replaced.
-   **Multi-file Management**: Handles TODOs from multiple files in the same workspace.

> Example of a TODO record in `TODOs.txt`:
>
> ```text
> **start**
> FileName: src/components/MyComponent.js
> {"fileName":"src/components/MyComponent.js","line":12,"value":"Refactor this function"}
> {"fileName":"src/components/MyComponent.js","line":25,"value":"Add unit tests"}
> **end**
> ```

---

## Requirements

-   Visual Studio Code version **1.104.0** or later.
-   Node.js (only if modifying the extension locally).

No additional dependencies are required.

---

## Usage

1. Open a file in VS Code.
2. Add TODO comments using the format:

    ```js
    // TODO: Description of your task
    ```
