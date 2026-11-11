import { choose } from "../lib/dy.mjs";

export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });
  try {
    const body = typeof req.body === "object" && req.body ? req.body : JSON.parse(req.body || "{}");
    const [status, json] = await choose(body);
    res.status(status).json(json);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Request failed" });
  }
}
