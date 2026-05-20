import multer from "multer";

const storage = multer.memoryStorage(); // store PDF in memory buffer

const fileFilter = (_req, file, cb) => {
  if (file.mimetype === "application/pdf") {
    cb(null, true);
  } else {
    cb(new Error("Only PDF files are allowed"), false);
  }
};

export const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: 17 * 1024 * 1024 }, // 17 MB
});
