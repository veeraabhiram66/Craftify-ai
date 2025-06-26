import { useState, useEffect, useCallback } from "react";
import {
  listFiles,
  createFile,
  editFile,
  deleteFile,
} from "./mcpClient";
import type { MCPResponse } from "./mcpClient";
import "./App.css";

function App() {
  // Removed unused folder state
  const [files, setFiles] = useState<string[]>([]);
  const [output, setOutput] = useState<string>("");
  const [prompt, setPrompt] = useState("");
  const [uploadedFolderName, setUploadedFolderName] = useState<string>("");
  const [uploading, setUploading] = useState(false);

  // List files in the current folder
  const refreshFiles = useCallback(async (folder = "") => {
    const folderToList = uploadedFolderName ? uploadedFolderName : folder;
    const res: MCPResponse = await listFiles(folderToList);
    let allFiles = (res.content[0]?.text.split("\n") || []).filter(f => f);
    // Only show files inside the uploaded folder
    if (uploadedFolderName) {
      allFiles = allFiles.filter(f => f.startsWith(uploadedFolderName + "/") || f === uploadedFolderName || f === "");
      // Remove the folder itself if present
      allFiles = allFiles.filter(f => f !== uploadedFolderName);
    }
    setFiles(allFiles);
  }, [uploadedFolderName]);

  // Handle folder upload (sync all files to backend)
  const handleFolderUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;
    setUploading(true);
    let folderName = "";
    if (
      files.length > 0 &&
      (files[0] as File & { webkitRelativePath?: string }).webkitRelativePath
    ) {
      const relPath = (files[0] as File & { webkitRelativePath?: string }).webkitRelativePath;
      folderName = relPath ? relPath.split("/")[0] : "";
    }
    setUploadedFolderName(folderName || "(virtual upload)");
    // Upload all files to backend
    for (const file of Array.from(files)) {
      const relPath = (file as File & { webkitRelativePath?: string }).webkitRelativePath || file.name;
      const buf = await file.arrayBuffer();
      await fetch(`http://localhost:3001/upload-file?file=${encodeURIComponent(relPath)}`, {
        method: "POST",
        headers: {},
        body: buf,
      });
    }
    setUploading(false);
    setOutput("Folder uploaded and synced to backend. You can now use the prompt box.");
    refreshFiles("");
  };

  // Parse prompt and call MCP client
  const handlePrompt = async () => {
    const text = prompt.trim();
    let msg = "";
    // Always prefix with uploadedFolderName if set
    const withFolder = (file: string) =>
      uploadedFolderName && !file.startsWith(uploadedFolderName + "/")
        ? `${uploadedFolderName}/${file}`
        : file;
    if (/^create (a )?file (.+)$/i.test(text)) {
      const [, , file] = text.match(/^create (a )?file (.+)$/i)!;
      await createFile(withFolder(file), "");
      msg = `Created file: ${withFolder(file)}`;
      await refreshFiles("");
    } else if (/^edit (the )?file (.+) to (.+)$/i.test(text)) {
      const [, , file, content] = text.match(/^edit (the )?file (.+) to (.+)$/i)!;
      await editFile(withFolder(file), content);
      msg = `Edited file: ${withFolder(file)}`;
      await refreshFiles("");
    } else if (/^delete (the )?file (.+)$/i.test(text)) {
      const [, , file] = text.match(/^delete (the )?file (.+)$/i)!;
      await deleteFile(withFolder(file));
      msg = `Deleted file: ${withFolder(file)}`;
      await refreshFiles("");
    } else {
      msg = "Prompt not recognized. Use: 'create file X', 'edit file X to CONTENT', or 'delete file X'";
    }
    setOutput(msg);
    setPrompt("");
  };

  useEffect(() => {
    refreshFiles("");
  }, [refreshFiles]);

  return (
    <div className="mcp-app-wrapper">
      <div className="mcp-root">
        <header className="mcp-header">
          <h1>Craftify AI</h1>
        </header>
        <div className="mcp-instructions">
          <h2>How to Use</h2>
          <ul>
            <li><b>Upload a folder</b> to start. All files will be managed inside this folder.</li>
            <li>Use the <b>Prompt Box</b> for agent-style commands, e.g.:</li>
            <li><code>create file hello.txt</code></li>
            <li><code>edit file hello.txt to Hello world!</code></li>
            <li><code>delete file hello.txt</code></li>
            <li>Only files inside your uploaded folder are shown and managed.</li>
          </ul>
        </div>
        <main className="mcp-main">
          <section className="mcp-upload-section">
            <h2>📁 Upload Folder</h2>
            <label className="mcp-upload-label">
              <span>Choose a folder to manage:</span>
              <input
                type="file"
                multiple
                onChange={handleFolderUpload}
                className="mcp-upload-input"
                disabled={uploading}
                ref={input => {
                  if (input) {
                    input.setAttribute("webkitdirectory", "true");
                    input.setAttribute("directory", "true");
                  }
                }}
              />
            </label>
            {uploadedFolderName && (
              <div className="mcp-uploaded-folder">
                <b>Uploaded folder:</b> {uploadedFolderName}
              </div>
            )}
            {uploading && <div className="mcp-uploading">Uploading...</div>}
          </section>
          <section className="mcp-prompt-section">
            <h2>💬 AI Commands</h2>
            <div className="mcp-prompt-row">
              <input
                type="text"
                placeholder="e.g. create file foo.txt, edit file foo.txt to hello, delete file foo.txt"
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                className="mcp-prompt-input"
              />
              <button onClick={handlePrompt} className="mcp-prompt-btn">
                Submit
              </button>
            </div>
            {output && <div className="output">{output}</div>}
          </section>
          <section className="mcp-files-section">
            <h2>📂 Your Files</h2>
            <ul className="mcp-files-list">
              {files.map((f) => (
                <li key={f} className="mcp-file-item">
                  <span title={f}>{f}</span>
                </li>
              ))}
            </ul>
          </section>
        </main>
      </div>
    </div>
  );
}

export default App;
