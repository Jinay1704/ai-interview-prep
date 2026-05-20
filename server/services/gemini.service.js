import { prompts } from "../utils/prompts.js";

const MODEL = "gemini-flash-lite-latest";
const BASE  = "https://generativelanguage.googleapis.com/v1beta";

const callGemini = async (prompt, retries = 3) => {
  const url = `${BASE}/models/${MODEL}:generateContent?key=${process.env.GEMINI_API_KEY}`;

  for (let attempt = 1; attempt <= retries; attempt++) {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 60000);

    try {
      const res = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        signal: controller.signal,
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
          generationConfig: { temperature: 0.7, maxOutputTokens: 2048 },
        }),
      });

      clearTimeout(timer);
      const data = await res.json();

      if (!res.ok) {
        const status = data?.error?.status;
        if (status === "RESOURCE_EXHAUSTED" && attempt < retries) {
          await new Promise((r) => setTimeout(r, attempt * 4000));
          continue;
        }
        throw Object.assign(new Error(data?.error?.message), { status: res.status });
      }

      const text = data.candidates?.[0]?.content?.parts?.[0]?.text ?? "";
      const cleaned = text.replace(/```json\n?/g, "").replace(/```\n?/g, "").trim();
      return JSON.parse(cleaned);

    } catch (err) {
      clearTimeout(timer);
      const isTimeout = err.name === "AbortError" ||
                        err?.cause?.code === "UND_ERR_CONNECT_TIMEOUT";
      if (isTimeout && attempt < retries) {
        console.warn(`Gemini timeout, retry ${attempt}/${retries}...`);
        await new Promise((r) => setTimeout(r, attempt * 3000));
        continue;
      }
      throw err;
    }
  }
};

export const extractJobMeta          = (desc)                        => callGemini(prompts.extractJobMeta(desc));
export const generateQuestions       = (title, skills, diff, n = 5) => callGemini(prompts.generateQuestions(title, skills, diff, n));
export const evaluateAnswer          = (q, t, title)                 => callGemini(prompts.evaluateAnswer(q, t, title));
export const generateOverallFeedback = (title, diff, ans)            => callGemini(prompts.overallFeedback(title, diff, ans));
export const analyseResume           = (text, jd = "")               => callGemini(prompts.analyseResume(text, jd));