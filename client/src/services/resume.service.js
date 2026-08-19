import api from "./api.js";

export const resumeService = {
  analyse: (file) => {
    const form = new FormData();
    form.append("file", file);
    return api.post("/resume/analyse", form, {
      headers: { "Content-Type": "multipart/form-data" },
    }).then((r) => r.data.data);
  },

  getAll: () => api.get("/resume").then((r) => r.data.data),

  getById: (id) => api.get(`/resume/${id}`).then((r) => r.data.data),

  delete: (id) => api.delete(`/resume/${id}`).then((r) => r.data),
};

