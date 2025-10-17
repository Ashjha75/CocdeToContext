import os
import platform
import datetime

# --- Folder Tree Generator ---
def generate_folder_map(root_folder, skip_folders):
    lines = []

    def walk(folder, prefix=""):
        try:
            entries = sorted(os.listdir(folder))
        except (PermissionError, FileNotFoundError):
            return

        entries = [e for e in entries if not e.startswith(".")]
        entries = [e for e in entries if not any(skip.lower() in e.lower() for skip in skip_folders)]

        for i, entry in enumerate(entries):
            path = os.path.join(folder, entry)
            connector = "└── " if i == len(entries) - 1 else "├── "
            if os.path.isdir(path):
                lines.append(f"{prefix}{connector}{entry}")
                extension = "    " if i == len(entries) - 1 else "│   "
                walk(path, prefix + extension)
            else:
                lines.append(f"{prefix}{connector}{entry}")

    walk(root_folder)
    return "\n".join(lines)

# --- Combine All Files Into One ---
def dump_all_files_to_txt(root_folder, output_file, skip_extensions=None, skip_files=None, skip_folders=None):
    skip_extensions = skip_extensions or []
    skip_files = skip_files or []
    skip_folders = skip_folders or []

    with open(output_file, "w", encoding="utf-8", errors="ignore") as outfile:
        # --- METADATA HEADER ---
        now = datetime.datetime.now().strftime("%B %d, %Y – %I:%M %p")
        outfile.write("===== PROJECT METADATA =====\n")
        outfile.write(f"Generated on: {now}\n")
        outfile.write(f"OS: {platform.system()} {platform.release()}\n")
        outfile.write(f"Root Folder: {os.path.abspath(root_folder)}\n\n")

        # --- ROUTE MAP (XML WRAPPED) ---
        outfile.write("===== ROUTE MAP / FOLDER STRUCTURE =====\n")
        outfile.write("<folder-structure>\n")
        folder_map = generate_folder_map(root_folder, skip_folders)
        outfile.write(folder_map if folder_map.strip() else "(No files found)")
        outfile.write("\n</folder-structure>\n")

        # --- BEGIN FILE CONTENTS ---
        outfile.write("\n\n===== BEGIN FILE CONTENTS =====\n")

        for foldername, subfolders, filenames in os.walk(root_folder):
            # Skip ignored folders
            if any(skip.lower() in foldername.lower() for skip in skip_folders):
                continue

            for filename in filenames:
                file_ext = os.path.splitext(filename)[1].lower()
                file_lower = filename.lower()

                if file_ext in skip_extensions or file_lower in skip_files:
                    continue

                file_path = os.path.join(foldername, filename)
                try:
                    with open(file_path, "r", encoding="utf-8", errors="ignore") as infile:
                        outfile.write(f"\n\n===== FILE: {file_path} =====\n\n")
                        outfile.write(infile.read())
                except Exception as e:
                    outfile.write(f"\n\n===== FILE: {file_path} (Could not read: {e}) =====\n\n")

    print(f"\n✅ Combined file created successfully: {output_file}")

# --- MAIN EXECUTION ---
if __name__ == "__main__":
    root_folder = r"EDIT THIS PLEASE TO FOLDER PATH"  # 👈 Change this
    output_file = "project_snapshot.txt"

    skip_extensions = [
        ".jpg", ".jpeg", ".png", ".ico", ".bmp", ".svg", ".mp3",
        ".avi", ".mov", ".zip", ".rar", ".7z", ".tar", ".gz",
        ".exe", ".dll", ".bin", ".pdf"
    ]

    skip_files = [".ds_store", "package-lock.json", "yarn.lock", ".env", ".gitignore"]

    skip_folders = [
        "node_modules", "dist", "build", "target", ".idea", ".vscode",
        "__pycache__", ".angular", ".next", ".git", ".svn",
        "venv", "env", "logs", "coverage", "out", "tmp"
    ]

    dump_all_files_to_txt(root_folder, output_file, skip_extensions, skip_files, skip_folders)
