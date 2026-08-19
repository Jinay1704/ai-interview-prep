import api from "./api.js";

export const interviewService = {
  // New resume-based creation
  create: (resumeId, difficulty, type) =>
    api.post("/interviews", { resumeId, difficulty, type }).then((r) => r.data.data),

  getAll: () => api.get("/interviews").then((r) => r.data.data),

  getById: (id) => api.get(`/interviews/${id}`).then((r) => r.data.data),

  submitAnswer: (id, payload) =>
    api.post(`/interviews/${id}/answer`, payload).then((r) => r.data.data),

  complete: (id) =>
    api.post(`/interviews/${id}/complete`).then((r) => r.data.data),

  delete: (id) =>
    api.delete(`/interviews/${id}`).then((r) => r.data),

  getHumeToken: () =>
    api.get("/interviews/hume-token").then((r) => r.data.data.accessToken),
};