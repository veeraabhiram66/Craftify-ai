/// <reference types="node" />
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { z } from "zod";
import fs from "fs/promises";
import path from "path";

const ROOT_DIR = path.resolve(process.env.MCP_ROOT_DIR || "./sandbox");

const server = new McpServer({
  name: "filesystem-mcp-server",
  version: "1.0.0",
  capabilities: {
    resources: {},
    tools: {},
  },
});

// Utility to resolve and validate paths
function safePath(relPath: string) {
  const abs = path.resolve(ROOT_DIR, relPath);
  if (!abs.startsWith(ROOT_DIR)) throw new Error("Access denied");
  return abs;
}

// List files
server.tool(
  "list-files",
  "List files in a folder",
  { folder: z.string().default("") },
  async ({ folder }) => {
    const dir = safePath(folder);
    const files = await fs.readdir(dir, { withFileTypes: true });
    return {
      content: [
        {
          type: "text",
          text: files
            .map((f: import('node:fs').Dirent) => (f.isDirectory() ? `[DIR] ${f.name}` : f.name))
            .join("\n"),
        },
      ],
    };
  }
);

// Create file
server.tool(
  "create-file",
  "Create a new file",
  { file: z.string(), content: z.string().default("") },
  async ({ file, content }) => {
    const filePath = safePath(file);
    await fs.mkdir(path.dirname(filePath), { recursive: true });
    await fs.writeFile(filePath, content, "utf8");
    return { content: [{ type: "text", text: `Created ${file}` }] };
  }
);

// Edit file
server.tool(
  "edit-file",
  "Edit an existing file (replace content)",
  { file: z.string(), content: z.string() },
  async ({ file, content }) => {
    const filePath = safePath(file);
    await fs.writeFile(filePath, content, "utf8");
    return { content: [{ type: "text", text: `Edited ${file}` }] };
  }
);

// Delete file
server.tool(
  "delete-file",
  "Delete a file",
  { file: z.string() },
  async ({ file }) => {
    const filePath = safePath(file);
    await fs.unlink(filePath);
    return { content: [{ type: "text", text: `Deleted ${file}` }] };
  }
);

async function main() {
  await fs.mkdir(ROOT_DIR, { recursive: true });
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error("Filesystem MCP Server running on stdio");
}

main().catch((err) => {
  console.error("Fatal error in main():", err);
  process.exit(1);
});
