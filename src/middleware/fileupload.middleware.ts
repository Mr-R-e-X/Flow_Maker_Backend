import multer from "multer";

const upload = multer({
  limits: { fileSize: 1024 * 1024 * 10 },
});

export const CSVUpload = upload.single("CSV_LEAD");
