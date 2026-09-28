import http from "node:http";
import fs from "node:fs/promises";
import path from "node:path";

const root = process.cwd();
const types = { ".html": "text/html; charset=utf-8", ".css": "text/css", ".svg": "image/svg+xml", ".webp": "image/webp", ".png": "image/png", ".woff2": "font/woff2", ".js": "text/javascript", ".json": "application/json" };
http.createServer(async (request, response) => {
  try {
    const pathname = decodeURIComponent(new URL(request.url, "http://localhost").pathname);
    let file = path.resolve(root, "." + pathname);
    if (file !== root && !file.startsWith(root + path.sep)) throw Error("Invalid path");
    if ((await fs.stat(file)).isDirectory()) file = path.join(file, "index.html");
    const body = await fs.readFile(file);
    response.writeHead(200, { "Content-Type": types[path.extname(file)] || "application/octet-stream", "Cache-Control": "no-cache" });
    response.end(body);
  } catch { response.writeHead(404); response.end("Not found"); }
}).listen(8001, "127.0.0.1", () => console.log("ARTIFACTS: http://127.0.0.1:8001/"));
