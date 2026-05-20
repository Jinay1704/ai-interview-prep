import { ApiResponse } from "../utils/apiResponse.js";

export const errorHandler = (err, _req, res, _next) => {
  console.error(err);

  if (err.name === "ValidationError") {
    const messages = Object.values(err.errors).map((e) => e.message);
    return res.status(400).json(ApiResponse.error(messages.join(", ")));
  }

  if (err.code === 11000) {
    return res.status(409).json(ApiResponse.error("Duplicate entry"));
  }

  const status = err.status || err.statusCode || 500;
  const message = err.message || "Internal server error";
  res.status(status).json(ApiResponse.error(message));
};
