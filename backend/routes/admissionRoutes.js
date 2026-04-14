import express from "express";
import multer from "multer";
import { 
  submitAdmission, 
  getAdmissions, 
  updateAdmissionStatus, 
  deleteAdmission 
} from "../controllers/admissionController.js";
import { protect, admin } from "../middlewares/authMiddleware.js";

import upload from "../middlewares/uploadMiddleware.js";

const router = express.Router();

router.post(
  "/submit",
  upload.fields([
    { name: "photo", maxCount: 1 },
    { name: "birthCertificate", maxCount: 1 },
  ]),
  submitAdmission
);

router.get("/all", protect, admin, getAdmissions);
router.patch("/:id/status", protect, admin, updateAdmissionStatus);
router.delete("/:id", protect, admin, deleteAdmission);

export default router;
