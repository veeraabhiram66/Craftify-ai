import express from "express";
import cors from "cors";
import { z } from "zod";
import fs from "fs/promises";
import path from "path";

const ROOT_DIR = path.resolve(process.env.MCP_ROOT_DIR || "./sandbox");
const app = express();
app.use(cors());
app.use(express.json());

function safePath(relPath: string) {
  const abs = path.resolve(ROOT_DIR, relPath);
  if (!abs.startsWith(ROOT_DIR)) throw new Error("Access denied");
  return abs;
}

app.post("/list-files", async (req, res) => {
  try {
    const folder = req.body.folder || "";
    const dir = safePath(folder);
    // Recursively list all files with their relative paths
    async function walk(currentDir: string, rel: string): Promise<string[]> {
      const entries = await fs.readdir(currentDir, { withFileTypes: true });
      let results: string[] = [];
      for (const entry of entries) {
        const entryPath = path.join(currentDir, entry.name);
        const relPath = rel ? path.join(rel, entry.name) : entry.name;
        if (entry.isDirectory()) {
          results = results.concat(await walk(entryPath, relPath));
        } else {
          results.push(relPath);
        }
      }
      return results;
    }
    const allFiles = await walk(dir, "");
    res.json({
      content: [
        {
          type: "text",
          text: allFiles.join("\n"),
        },
      ],
    });
  } catch (e: any) {
    res.status(500).json({ error: e.message });
  }
});

app.post("/create-file", async (req, res) => {
  try {
    const { file, content = "" } = req.body;
    const filePath = safePath(file);
    await fs.mkdir(path.dirname(filePath), { recursive: true });
    await fs.writeFile(filePath, content, "utf8");
    res.json({ content: [{ type: "text", text: `Created ${file}` }] });
  } catch (e: any) {
    res.status(500).json({ error: e.message });
  }
});

app.post("/edit-file", async (req, res) => {
  try {
    const { file, content } = req.body;
    const filePath = safePath(file);
    await fs.writeFile(filePath, content, "utf8");
    res.json({ content: [{ type: "text", text: `Edited ${file}` }] });
  } catch (e: any) {
    res.status(500).json({ error: e.message });
  }
});

app.post("/delete-file", async (req, res) => {
  try {
    const { file } = req.body;
    const filePath = safePath(file);
    await fs.unlink(filePath);
    res.json({ content: [{ type: "text", text: `Deleted ${file}` }] });
  } catch (e: any) {
    res.status(500).json({ error: e.message });
  }
});

// Upload a file (from folder upload)
app.post("/upload-file", express.raw({ type: '*/*', limit: '10mb' }), async (req, res) => {
  try {
    const relPath = req.query.file as string;
    if (!relPath) {
      res.status(400).json({ error: "Missing file path" });
      return;
    }
    const filePath = safePath(relPath);
    await fs.mkdir(path.dirname(filePath), { recursive: true });
    console.log(`[UPLOAD] Writing file to: ${filePath}, size: ${req.body?.length ?? 0} bytes`);
    await fs.writeFile(filePath, req.body);
    res.json({ ok: true });
  } catch (e: any) {
    console.error(`[UPLOAD ERROR]`, e);
    res.status(500).json({ error: e.message });
  }
});

// Download a file
app.get("/download-file", async (req, res) => {
  const relPath = req.query.file as string;
  if (!relPath) return res.status(400).json({ error: "Missing file path" });
  const filePath = safePath(relPath);
  try {
    // Log the requested file path
    console.log(`[DOWNLOAD] Requested: ${filePath}`);
    // Check if file exists
    try {
      await fs.access(filePath);
      console.log(`[DOWNLOAD] File exists: ${filePath}`);
    } catch {
      console.error(`[DOWNLOAD] File does NOT exist: ${filePath}`);
      return res.status(404).json({ error: "File not found" });
    }
    const data = await fs.readFile(filePath);
    res.setHeader("Content-Disposition", `attachment; filename=\"${path.basename(filePath)}\"`);
    res.send(data);
  } catch (e: any) {
    console.error(`[DOWNLOAD ERROR]`, e);
    res.status(404).json({ error: e.message });
  }
});

const PORT = 3001;
app.listen(PORT, () => {
  console.log(`HTTP MCP server running at http://localhost:${PORT}`);
});
