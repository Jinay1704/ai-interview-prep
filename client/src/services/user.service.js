import api from "./api.js";

export const userService = {
  /** Fetch the authenticated user's profile (including current plan, interviewsRemaining) from your DB */
  getMe: () => api.get("/user/me").then((r) => r.data.data),
};
