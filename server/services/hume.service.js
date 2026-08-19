import fetch from "node-fetch";

const HUME_API_KEY    = process.env.HUME_API_KEY;
const HUME_SECRET_KEY = process.env.HUME_SECRET_KEY;

/**
 * Exchange Hume API credentials for a short-lived access token.
 * The token is used by the browser's Hume SDK to open a WebSocket connection.
 */
export async function getHumeAccessToken() {
  if (!HUME_API_KEY || !HUME_SECRET_KEY) {
    throw new Error("HUME_API_KEY and HUME_SECRET_KEY must be set in environment variables.");
  }

  const credentials = Buffer.from(`${HUME_API_KEY}:${HUME_SECRET_KEY}`).toString("base64");

  const response = await fetch("https://api.hume.ai/oauth2-cc/token", {
    method: "POST",
    headers: {
      "Content-Type":  "application/x-www-form-urlencoded",
      "Authorization": `Basic ${credentials}`,
    },
    body: new URLSearchParams({ grant_type: "client_credentials" }),
  });

  if (!response.ok) {
    const text = await response.text();
    throw new Error(`Hume token request failed (${response.status}): ${text}`);
  }

  const data = await response.json();
  return data.access_token;
}
