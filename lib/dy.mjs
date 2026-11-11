const ID = /^[\w.:=+/-]{1,128}$/;

export async function choose(body) {
  const API_KEY = process.env.DY_API_KEY;
  // Server-side keys: https://dy-api.com/v2 (US) or https://dy-api.eu/v2 (EU).
  const BASE = (process.env.DY_API_BASE || "https://dy-api.com/v2").replace(/\/$/, "");
  const CAMPAIGN = process.env.DY_CAMPAIGN || "jhcampaign-custom-deposit";

  const limit = Number(body.maxDepositLimit);
  if (!Number.isFinite(limit) || limit < 0 || limit > 1_000_000) return [400, { error: "Invalid maxDepositLimit" }];
  if (body.dyid && !ID.test(body.dyid)) return [400, { error: "Invalid dyid" }];
  if (body.session && !ID.test(body.session)) return [400, { error: "Invalid session" }];

  const request = {
    user: body.dyid ? { dyid: body.dyid, dyid_server: body.dyid, active_consent_accepted: true } : { active_consent_accepted: true },
    session: body.session ? { dy: body.session } : {},
    selector: { names: [CAMPAIGN] },
    context: {
      page: { type: "HOMEPAGE", data: [""], location: "https://www.national-lottery.co.uk/", locale: "en_GB" },
      pageAttributes: { maxDepositLimit: limit }
    },
    options: { isImplicitPageview: true, returnAnalyticsMetadata: true }
  };
  if (!API_KEY) return [503, { request, error: "DY_API_KEY is not set" }];

  const response = await fetch(`${BASE}/serve/user/choose`, {
    method: "POST",
    headers: { "Content-Type": "application/json", "dy-api-key": API_KEY },
    body: JSON.stringify(request)
  });
  const text = await response.text();
  let json;
  try { json = JSON.parse(text); } catch { json = { raw: text }; }
  return [response.ok ? 200 : 502, { request, status: response.status, response: json }];
}
