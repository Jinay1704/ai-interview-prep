import { fetchAccessToken } from "hume";

/**
 * Fetch a short-lived Hume access token for the client.
 * The frontend uses this token to open a WebSocket voice session.
 */
export const getHumeAccessToken = async () => {
  const accessToken = await fetchAccessToken({
    apiKey: process.env.HUME_API_KEY,
    secretKey: process.env.HUME_SECRET_KEY,
  });

  if (!accessToken) {
    throw new Error("Failed to fetch Hume access token — check HUME_API_KEY and HUME_SECRET_KEY in .env");
  }

  return accessToken;
};

/**
 * Parse Hume emotion prosody data from a completed voice message.
 * Returns the top N emotions sorted by score.
 */
export const parseHumeEmotions = (humeMessage, topN = 5) => {
  try {
    const emotions =
      humeMessage?.models?.prosody?.grouped_predictions?.[0]
        ?.predictions?.[0]?.emotions ?? [];

    return emotions
      .sort((a, b) => b.score - a.score)
      .slice(0, topN)
      .map(({ name, score }) => ({
        name,
        score: Math.round(score * 100) / 100,
      }));
  } catch {
    return [];
  }
};