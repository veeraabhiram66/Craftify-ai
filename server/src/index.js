"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
/// <reference types="node" />
const mcp_js_1 = require("@modelcontextprotocol/sdk/server/mcp.js");
const stdio_js_1 = require("@modelcontextprotocol/sdk/server/stdio.js");
const zod_1 = require("zod");
const promises_1 = __importDefault(require("fs/promises"));
const path_1 = __importDefault(require("path"));
const ROOT_DIR = path_1.default.resolve(process.env.MCP_ROOT_DIR || "./sandbox");
const server = new mcp_js_1.McpServer({
    name: "filesystem-mcp-server",
    version: "1.0.0",
    capabilities: {
        resources: {},
        tools: {},
    },
});
// Utility to resolve and validate paths
function safePath(relPath) {
    const abs = path_1.default.resolve(ROOT_DIR, relPath);
    if (!abs.startsWith(ROOT_DIR))
        throw new Error("Access denied");
    return abs;
}
// List files
server.tool("list-files", "List files in a folder", { folder: zod_1.z.string().default("") }, (_a) => __awaiter(void 0, [_a], void 0, function* ({ folder }) {
    const dir = safePath(folder);
    const files = yield promises_1.default.readdir(dir, { withFileTypes: true });
    return {
        content: [
            {
                type: "text",
                text: files
                    .map((f) => (f.isDirectory() ? `[DIR] ${f.name}` : f.name))
                    .join("\n"),
            },
        ],
    };
}));
// Create file
server.tool("create-file", "Create a new file", { file: zod_1.z.string(), content: zod_1.z.string().default("") }, (_a) => __awaiter(void 0, [_a], void 0, function* ({ file, content }) {
    const filePath = safePath(file);
    yield promises_1.default.mkdir(path_1.default.dirname(filePath), { recursive: true });
    yield promises_1.default.writeFile(filePath, content, "utf8");
    return { content: [{ type: "text", text: `Created ${file}` }] };
}));
// Edit file
server.tool("edit-file", "Edit an existing file (replace content)", { file: zod_1.z.string(), content: zod_1.z.string() }, (_a) => __awaiter(void 0, [_a], void 0, function* ({ file, content }) {
    const filePath = safePath(file);
    yield promises_1.default.writeFile(filePath, content, "utf8");
    return { content: [{ type: "text", text: `Edited ${file}` }] };
}));
// Delete file
server.tool("delete-file", "Delete a file", { file: zod_1.z.string() }, (_a) => __awaiter(void 0, [_a], void 0, function* ({ file }) {
    const filePath = safePath(file);
    yield promises_1.default.unlink(filePath);
    return { content: [{ type: "text", text: `Deleted ${file}` }] };
}));
function main() {
    return __awaiter(this, void 0, void 0, function* () {
        yield promises_1.default.mkdir(ROOT_DIR, { recursive: true });
        const transport = new stdio_js_1.StdioServerTransport();
        yield server.connect(transport);
        console.error("Filesystem MCP Server running on stdio");
    });
}
main().catch((err) => {
    console.error("Fatal error in main():", err);
    process.exit(1);
});
