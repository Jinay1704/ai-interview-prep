import api from "./api.js";

export const interviewService = {
  create: (jobId, difficulty) =>
    api.post("/interviews", { jobId, difficulty }).then((r) => r.data.data),

  getAll: () => api.get("/interviews").then((r) => r.data.data),

  getById: (id) => api.get(`/interviews/${id}`).then((r) => r.data.data),

  submitAnswer: (id, payload) =>
    api.post(`/interviews/${id}/answer`, payload).then((r) => r.data.data),

  complete: (id) =>
    api.post(`/interviews/${id}/complete`).then((r) => r.data.data),

  getHumeToken: () =>
    api.get("/interviews/hume-token").then((r) => r.data.data.accessToken),

  delete: (id) =>
    api.delete(`/interviews/${id}`).then((r) => r.data),
};