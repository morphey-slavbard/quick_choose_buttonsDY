// Local dev server: serves index.html and proxies Dynamic Yield so DY_API_KEY never reaches the browser.
import { createServer } from "node:http";
import { readFile } from "node:fs/promises";
import { existsSync, readFileSync } from "node:fs";
import { choose } from "./lib/dy.mjs";

if (existsSync(new URL(".env", import.meta.url))) {
  for (const line of readFileSync(new URL(".env", import.meta.url), "utf8").split("\n")) {
    const match = line.match(/^\s*([A-Z_]+)\s*=\s*(.*?)\s*$/);
    if (match && !(match[1] in process.env)) process.env[match[1]] = match[2].replace(/^["']|["']$/g, "");
  }
}

const PORT = Number(process.env.PORT) || 5180;
const API_KEY = process.env.DY_API_KEY;
const BASE = (process.env.DY_API_BASE || "https://dy-api.com/v2").replace(/\/$/, "");
const MAX_BODY = 5_000;

const send = (res, status, body, type = "application/json") => {
  res.writeHead(status, { "Content-Type": type });
  res.end(type === "application/json" ? JSON.stringify(body) : body);
};

const readJson = req => new Promise((resolve, reject) => {
  let raw = "";
  req.on("data", chunk => { raw += chunk; if (raw.length > MAX_BODY) reject(new Error("Body too large")); });
  req.on("end", () => { try { resolve(JSON.parse(raw || "{}")); } catch (error) { reject(error); } });
  req.on("error", reject);
});

createServer(async (req, res) => {
  try {
    if (req.method === "GET" && (req.url === "/" || req.url.startsWith("/?"))) {
      return send(res, 200, await readFile(new URL("index.html", import.meta.url)), "text/html; charset=utf-8");
    }
    if (req.method === "POST" && req.url === "/api/choose") {
      const [status, json] = await choose(await readJson(req));
      return send(res, status, json);
    }
    send(res, 404, { error: "Not found" });
  } catch (error) {
    console.error(error);
    send(res, 500, { error: "Request failed" });
  }
}).listen(PORT, () => console.log(`http://localhost:${PORT}  (DY key ${API_KEY ? "loaded" : "MISSING"}, ${BASE})`));
