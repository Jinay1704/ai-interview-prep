import api from "./api.js";

export const resumeService = {
  analyse: (file, jobId = "") => {
    const form = new FormData();
    form.append("file", file);
    if (jobId) form.append("jobId", jobId);
    return api.post("/resume/analyse", form, {
      headers: { "Content-Type": "multipart/form-data" },
    }).then((r) => r.data.data);
  },

  getAll: () => api.get("/resume").then((r) => r.data.data),

  getById: (id) => api.get(`/resume/${id}`).then((r) => r.data.data),

  delete: (id) => api.delete(`/resume/${id}`).then((r) => r.data),
};
