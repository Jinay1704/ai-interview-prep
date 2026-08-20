import fetch from "node-fetch";
import { getCache, setCache } from "../config/redis.js";

const HUME_API_KEY    = process.env.HUME_API_KEY;
const HUME_SECRET_KEY = process.env.HUME_SECRET_KEY;

// Hume access tokens are valid for ~5 minutes; cache for 4 min to stay safe.
const HUME_TOKEN_TTL = 4 * 60; // seconds
const HUME_TOKEN_KEY = "hume:access_token";

/**
 * Exchange Hume API credentials for a short-lived access token.
 * The token is cached in Redis for 4 minutes to avoid unnecessary round-trips.
 * Used by the browser's Hume SDK to open a WebSocket connection.
 */
export async function getHumeAccessToken() {
  if (!HUME_API_KEY || !HUME_SECRET_KEY) {
    throw new Error("HUME_API_KEY and HUME_SECRET_KEY must be set in environment variables.");
  }

  // ── Redis cache look-up ──────────────────────────────────────────────────
  const cached = await getCache(HUME_TOKEN_KEY);
  if (cached) {
    return cached;
  }

  // ── Cache miss — fetch a fresh token from Hume ───────────────────────────
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
  const accessToken = data.access_token;

  // Cache the token so subsequent calls skip the Hume API round-trip
  await setCache(HUME_TOKEN_KEY, accessToken, HUME_TOKEN_TTL);

  return accessToken;
}
