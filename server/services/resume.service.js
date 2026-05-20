import pdfParse from "pdf-parse";

/**
 * Extract plain text from a PDF buffer (from multer memoryStorage).
 */
export const extractTextFromPDF = async (buffer) => {
  const data = await pdfParse(buffer);
  return data.text;
};
