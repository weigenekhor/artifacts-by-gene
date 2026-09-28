import { createServer } from "node:http";
import { readFile } from "node:fs/promises";
import { resolve, extname, sep } from "node:path";

// Exercise the same relative URLs as a GitHub Pages project deployment.
export async function serveSite() {
  const root = resolve(import.meta.dirname, "..");
  const mime = {
    ".html": "text/html",
    ".js": "text/javascript",
    ".css": "text/css",
    ".webp": "image/webp",
    ".png": "image/png",
    ".svg": "image/svg+xml",
    ".woff2": "font/woff2",
    ".json": "application/json",
  };
  const server = createServer(async (req, res) => {
    const pathname = decodeURIComponent(
      new URL(req.url, "http://localhost").pathname,
    ).replace(/^\/artifacts-by-gene\//, "/");
    const file = resolve(root, "." + pathname.replace(/\/$/, "/index.html"));
    if (!file.startsWith(root + sep)) {
      res.writeHead(403).end();
      return;
    }
    try {
      res.setHeader("Content-Type", mime[extname(file)] || "text/plain");
      res.end(await readFile(file));
    } catch {
      res.writeHead(404).end();
    }
  });
  await new Promise((resolve) => server.listen(0, "127.0.0.1", resolve));
  server.unref();
  return {
    url: `http://127.0.0.1:${server.address().port}/artifacts-by-gene/`,
    stop: () => server.close(),
  };
}
