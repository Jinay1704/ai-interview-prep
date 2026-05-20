import api from "./api.js";

export const jobService = {
  create: (description) => api.post("/jobs", { description }).then((r) => r.data.data),
  getAll: () => api.get("/jobs").then((r) => r.data.data),
  getById: (jobId) => api.get(`/jobs/${jobId}`).then((r) => r.data.data),
  delete: (jobId) => api.delete(`/jobs/${jobId}`).then((r) => r.data),
};
