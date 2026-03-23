import express from "express";
import multer from "multer";
import { submitAdmission, getAdmissions } from "../controllers/admissionController.js";

const router = express.Router();

// File Upload Config
const upload = multer({ dest: "uploads/" });

router.post(
  "/submit",
  upload.fields([
    { name: "photo", maxCount: 1 },
    { name: "birthCertificate", maxCount: 1 },
  ]),
  submitAdmission
);

router.get("/all", getAdmissions);

export default router;
