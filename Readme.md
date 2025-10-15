# CodeToContext - Convert Your Codebase into a Single AI Prompt

CodeToContext is a simple yet powerful tool that transforms local source code into a single, clean, and structured text prompt, ready for any Large Language Model (LLM). It runs entirely in your browser, ensuring your code remains 100% private and secure.

![CodeToContext Screenshot](https://github.com/Ashjha75/CodeToContext/blob/dev_v1/ss.png) 
<!-- You can add a screenshot of your app here later -->

## 🎯 Core Features

-   **Structure-Aware Output** - Generates a clear folder diagram alongside the code for complete context.
-   **100% Private & Secure** - All file processing happens locally in your browser. Your code never leaves your machine.
-   **No Build Step Needed** - A pure vanilla JavaScript, HTML, and CSS application. Just open the file to run.
-   **Intelligent File Handling** - Select an entire directory, and the tool automatically ignores common clutter like `node_modules` and `.git`.
-   **Detailed Analysis** - Get an instant estimate of file count, total size, and token count for your selected code.
-   **Multiple Export Formats** - Download your final prompt as a `.txt`, `.md`, or `.json` file, correctly named after your project.

## 🚀 Getting Started

### Option 1: Use It Online (Recommended)
The easiest way to use CodeToContext is through the live version hosted on GitHub Pages.

**[Visit the Live Application](https://ashjha75.github.io/CodeToContext/)** 
<!-- Update this link once you deploy -->

### Option 2: Run Locally
Since this is a vanilla web application, there are no dependencies or build steps.

1.  **Clone the repository:**
    ```bash
    git clone https://github.com/your-username/codetocontext.git
    cd codetocontext
    ```

2.  **Open `index.html`:**
    Simply open the `index.html` file directly in a modern web browser like Chrome, Firefox, or Edge.

## 📁 How It Works

1.  **Select Your Directory:** Click the **"Select Directory"** button and choose your project folder.
2.  **Filter and Refine:** The file tree will instantly populate. Use the checkboxes to select or deselect the specific files and folders you want to include in the prompt.
3.  **Review the Output:** The main panel provides a live preview of the generated prompt, complete with the folder structure diagram and concatenated file contents.
4.  **Export:** Use the action buttons to copy the entire prompt to your clipboard or download it in your preferred format.

## 🎨 Design

The user interface is built with a clean, professional dark theme inspired by modern code editors. The color palette focuses on clarity and readability:

-   **Primary (Text/Highlight)**: `#f0eee6`
-   **Dark (Background)**: `#141413`
-   **Accent (UI Elements)**: `#e3dacc`

## 🛠️ Key JavaScript Functions

The application's logic is contained within a single `<script>` tag in `index.html`. Here are some of the core functions:

| Function                 | Description                                                              |
| ------------------------ | ------------------------------------------------------------------------ |
| `handleFolderSelection()`| Processes the files from the selected directory.                         |
| `buildTreeFromPaths()`   | Creates a hierarchical data structure from the file paths.               |
| `renderFileTree()`       | Renders the interactive file tree in the sidebar.                        |
| `updateStatistics()`     | Calculates file count, size, and tokens, then updates the UI.            |
| `generateStructureDiagram()`| Creates the text-based folder diagram for the output.                  |
| `getFormattedOutput()`   | Assembles the final prompt with the diagram and file contents.           |

## 🌐 Browser Compatibility

CodeToContext uses the standard `<input type="file" webkitdirectory>` attribute for folder selection, ensuring broad compatibility.

| Browser         | Support |
| --------------- | ------- |
| Chrome / Edge   | ✅ Full |
| Firefox         | ✅ Full |
| Safari          | ✅ Full |
| Brave           | ✅ Full |
| Mobile Browsers | ✅ Full |

## 🤝 Contributing

Contributions are welcome! If you have ideas for improvements or find a bug, please feel free to fork the repository, make your changes, and open a pull request.

1.  Fork the project.
2.  Create a new branch (`git checkout -b feature/new-enhancement`).
3.  Commit your changes (`git commit -m 'Add some new enhancement'`).
4.  Push to the branch (`git push origin feature/new-enhancement`).
5.  Open a Pull Request.

