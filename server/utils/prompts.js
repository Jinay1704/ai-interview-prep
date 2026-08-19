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
  generateQuestions: (jobTitle, skills, difficulty, count = 10) => `
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
   * Generate interview questions grounded in resume chunks retrieved from ChromaDB.
   * chunks: string[] of top-K resume text excerpts
   */
  generateQuestionsFromResume: (chunks, difficulty, type, count = 10) => `
You are an expert technical interviewer conducting a personalised mock interview.
You have been given excerpts from the candidate's actual resume. Use these to generate
exactly ${count} ${difficulty}-level interview questions that are deeply tailored to
the candidate's real experience.

The interview type is: ${type.toUpperCase()}.
${type === "behavioral" ? "Focus strictly on behavioral questions (e.g. 'Tell me about a time...', leadership, conflict, soft skills)." : "Focus on technical questions, system design, architectural decisions, and specific technologies mentioned in the resume."}

Resume excerpts:
${chunks.map((c, i) => `--- Excerpt ${i + 1} ---\n${c}`).join("\n\n")}

Rules:
- ${difficulty === "easy" ? "Focus on fundamentals from the candidate's listed skills and experience." : ""}
- ${difficulty === "medium" ? "Ask applied, scenario-based questions referencing the candidate's projects and roles." : ""}
- ${difficulty === "hard" ? "Dive deep into complex scenarios, edge-cases, or difficult leadership/technical challenges." : ""}
- Every question must reference something concrete from the resume excerpts above.
- Do NOT ask generic questions unrelated to the resume content.
- Each question must be unique.

Return ONLY valid JSON in this format:
{
  "questions": [
    { "text": "...", "difficulty": "${difficulty}", "category": "${type}" },
    ...
  ]
}
`.trim(),

  /**
   * Evaluate all interview answers at once and generate overall summary.
   */
  evaluateAnswersBulk: (context, difficulty, type, answers) => `
You are an expert interviewer evaluating a completed ${difficulty}-level ${type} mock interview.
${context ? `Candidate background context: ${context}` : ""}

Here are the questions asked and the candidate's transcripts:
${answers.map((a, i) => `--- Q${i + 1} (ID: ${a.questionId}) ---\nQuestion: ${a.question}\nAnswer: ${a.transcript || "[No answer provided]"}`).join("\n\n")}

Your task is to:
1. Provide a specific score (0-10) and feedback for EVERY single answer.
2. Provide an overall summary, average score, top strengths, and areas to improve based on all the answers.

Return ONLY valid JSON in this EXACT format:
{
  "evaluatedAnswers": [
    {
      "questionId": "<exact questionId from above>",
      "score": <0-10 integer>,
      "feedback": "2-3 sentences specific feedback on this individual answer"
    }
  ],
  "overallFeedback": "5-7 sentence overall summary of the entire interview",
  "overallScore": <average score across all questions, rounded to 1 decimal point>,
  "topStrengths": ["...", "..."],
  "areasToImprove": ["...", "..."],
  "recommendedResources": ["...", "..."]
}
`.trim(),

  /**
   * Analyse a resume (standalone — no job description needed).
   */
  analyseResume: (resumeText) => `
You are an expert ATS resume reviewer.

Resume content:
${resumeText}

Analyse the resume and return ONLY valid JSON:
{
  "matchScore": <0–100 integer, overall resume quality score>,
  "extractedRole": "<inferred job title / role the candidate is targeting>",
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

