export const prompts = {
  /**
   * Extract job title + key skills from raw job description.
   */
  extractJobMeta: (description) => `
You are a technical recruiter assistant.
Given the following job description, extract:
1. A short job title (max 6 words)
2. A list of up to 10 key technical skills

Return ONLY valid JSON in this format:
{
  "title": "...",
  "skills": ["skill1", "skill2", ...]
}

Job Description:
${description}
`.trim(),

  /**
   * Generate interview questions based on job + difficulty.
   */
  generateQuestions: (jobTitle, skills, difficulty, count = 5) => `
You are an expert technical interviewer.
Generate exactly ${count} ${difficulty}-level interview questions for a "${jobTitle}" role.
The candidate should have skills in: ${skills.join(", ")}.

Rules:
- ${difficulty === "easy" ? "Focus on fundamentals, definitions, basic concepts." : ""}
- ${difficulty === "medium" ? "Focus on applied knowledge, problem-solving, design trade-offs." : ""}
- ${difficulty === "hard" ? "Focus on system design, deep internals, complex scenarios, optimisation." : ""}
- Each question must be unique and specific to the role.
- Include a mix of technical and behavioural questions.

Return ONLY valid JSON in this format:
{
  "questions": [
    { "text": "...", "difficulty": "${difficulty}", "category": "technical|behavioural|system-design" },
    ...
  ]
}
`.trim(),

  /**
   * Evaluate a single interview answer.
   */
  evaluateAnswer: (question, transcript, jobTitle) => `
You are an expert interviewer evaluating a candidate for a "${jobTitle}" role.

Question asked: "${question}"
Candidate's answer: "${transcript}"

Evaluate the answer on:
1. Relevance and accuracy
2. Depth of knowledge
3. Clarity of communication
4. Real-world application

Return ONLY valid JSON in this format:
{
  "feedback": "2–4 sentence specific feedback on this answer",
  "score": <integer 0–10>,
  "strengths": ["..."],
  "improvements": ["..."]
}
`.trim(),

  /**
   * Generate overall interview summary.
   */
  overallFeedback: (jobTitle, difficulty, answers) => `
You are an expert interviewer summarising a completed mock interview for a "${jobTitle}" role (${difficulty} level).

Here are the answers and their scores:
${answers.map((a, i) => `Q${i + 1}: Score ${a.score}/10 — ${a.feedback}`).join("\n")}

Provide an overall summary.
Return ONLY valid JSON:
{
  "overallFeedback": "5-7 sentence overall summary",
  "overallScore": <average score rounded to 1 decimal>,
  "topStrengths": ["..."],
  "areasToImprove": ["..."],
  "recommendedResources": ["..."]
}
`.trim(),

  /**
   * Analyse a resume against an optional job description.
   */
  analyseResume: (resumeText, jobDescription = "") => `
You are an expert ATS resume reviewer.
${jobDescription ? `The candidate is applying for this role:\n${jobDescription}\n` : ""}

Resume content:
${resumeText}

Analyse the resume and return ONLY valid JSON:
{
  "matchScore": <0–100 integer${jobDescription ? ", match % against job description" : ""}>,
  "summary": "2–3 sentence overall impression",
  "strengths": ["..."],
  "weaknesses": ["..."],
  "missingKeywords": ["..."],
  "suggestions": ["..."],
  "atsScore": <0–100 integer, ATS friendliness>,
  "sections": {
    "experience": <0–10>,
    "education": <0–10>,
    "skills": <0–10>,
    "formatting": <0–10>
  }
}
`.trim(),
};
