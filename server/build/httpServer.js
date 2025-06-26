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
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const promises_1 = __importDefault(require("fs/promises"));
const path_1 = __importDefault(require("path"));
const ROOT_DIR = path_1.default.resolve(process.env.MCP_ROOT_DIR || "./sandbox");
const app = (0, express_1.default)();
app.use((0, cors_1.default)());
app.use(express_1.default.json());
function safePath(relPath) {
    const abs = path_1.default.resolve(ROOT_DIR, relPath);
    if (!abs.startsWith(ROOT_DIR))
        throw new Error("Access denied");
    return abs;
}
app.post("/list-files", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const folder = req.body.folder || "";
        const dir = safePath(folder);
        const files = yield promises_1.default.readdir(dir, { withFileTypes: true });
        res.json({
            content: [
                {
                    type: "text",
                    text: files
                        .map((f) => (f.isDirectory() ? `[DIR] ${f.name}` : f.name))
                        .join("\n"),
                },
            ],
        });
    }
    catch (e) {
        res.status(500).json({ error: e.message });
    }
}));
app.post("/create-file", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { file, content = "" } = req.body;
        const filePath = safePath(file);
        yield promises_1.default.mkdir(path_1.default.dirname(filePath), { recursive: true });
        yield promises_1.default.writeFile(filePath, content, "utf8");
        res.json({ content: [{ type: "text", text: `Created ${file}` }] });
    }
    catch (e) {
        res.status(500).json({ error: e.message });
    }
}));
app.post("/edit-file", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { file, content } = req.body;
        const filePath = safePath(file);
        yield promises_1.default.writeFile(filePath, content, "utf8");
        res.json({ content: [{ type: "text", text: `Edited ${file}` }] });
    }
    catch (e) {
        res.status(500).json({ error: e.message });
    }
}));
app.post("/delete-file", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { file } = req.body;
        const filePath = safePath(file);
        yield promises_1.default.unlink(filePath);
        res.json({ content: [{ type: "text", text: `Deleted ${file}` }] });
    }
    catch (e) {
        res.status(500).json({ error: e.message });
    }
}));
const PORT = 3001;
app.listen(PORT, () => {
    console.log(`HTTP MCP server running at http://localhost:${PORT}`);
});
