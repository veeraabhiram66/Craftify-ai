// Minimal MCP client for communicating with the MCP server
// Assumes server is running locally and exposes HTTP endpoints for demo purposes
// In production, adapt to your actual MCP transport (e.g., WebSocket, HTTP, etc.)

export type MCPResponse = {
  content: { type: string; text: string }[];
};

const MCP_SERVER_URL = "http://localhost:3001"; // Change if needed

export async function listFiles(folder = ""): Promise<MCPResponse> {
  const res = await fetch(`${MCP_SERVER_URL}/list-files`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ folder }),
  });
  return res.json();
}

export async function createFile(file: string, content = ""): Promise<MCPResponse> {
  const res = await fetch(`${MCP_SERVER_URL}/create-file`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ file, content }),
  });
  return res.json();
}

export async function editFile(file: string, content: string): Promise<MCPResponse> {
  const res = await fetch(`${MCP_SERVER_URL}/edit-file`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ file, content }),
  });
  return res.json();
}

export async function deleteFile(file: string): Promise<MCPResponse> {
  const res = await fetch(`${MCP_SERVER_URL}/delete-file`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ file }),
  });
  return res.json();
}
