# Craftify AI

Craftify AI is a modern, agent-style file system manager web app. It allows you to upload a folder, manage its files using natural language commands, and interact with a Model Context Protocol (MCP) server for all file operations. The app is built with Vite, React, and TypeScript, and features a clean, professional UI.

## Features

- **Full-page blue-violet gradient background** for a modern, immersive look
- **Card-like, compact feature boxes** for each main function
- **Upload a folder**: All file management is scoped to your uploaded folder
- **AI Command Prompt**: Use natural language to create, edit, or delete files (e.g., `create file notes.txt`, `edit file notes.txt to Hello!`, `delete file notes.txt`)
- **Live file list**: See all files inside your uploaded folder
- **Responsive and scrollable layout**: Works great on all screen sizes
- **Contained upload input**: The folder upload input is always perfectly styled and contained
- **Clear, friendly output messages**

## How to Use

1. **Start the MCP server** (see below).
2. **Run the client app** (see below).
3. In the web app:
    - Upload a folder to begin.
    - Use the AI Command Prompt to manage files inside your folder.
    - View your files in the "Your Files" section.

## Example Commands

- `create file hello.txt`
- `edit file hello.txt to Hello world!`
- `delete file hello.txt`

## Project Structure

- `client/` — Vite + React + TypeScript frontend
- `server/` — MCP server (TypeScript, @modelcontextprotocol/sdk)

## Getting Started

### Prerequisites

- Node.js (v18+ recommended)
- npm or yarn

### Install Dependencies

```bash
cd client
npm install
# (and in server/ if present)
```

### Run the MCP Server

```bash
cd server
npm install
npm run dev
```

### Run the Client

```bash
cd client
npm run dev
```

## Tech Stack

- React + TypeScript (frontend)
- Vite (build tool)
- @modelcontextprotocol/sdk (MCP server)
- Custom CSS (with a migration plan for Tailwind CSS if desired)

## Customization

- All UI/UX and branding is in `client/src/App.tsx` and `client/src/App.css`.
- To rebrand or restyle, edit these files.

## License

MIT

---

Craftify AI — Modern agent-style file management, powered by MCP.
