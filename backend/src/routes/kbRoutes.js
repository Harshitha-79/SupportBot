// import express from "express";
// import multer from "multer";
// import { ingestText, ingestPdf } from "../controllers/kbController.js";

// const upload = multer({ dest: "uploads/" });
// const router = express.Router();

// router.post("/text", ingestText);
// router.post("/pdf", upload.single("file"), ingestPdf);

// export default router;
import express from "express";
import multer from "multer";
import {
  ingestText,
  ingestPdf,
  listPendingKb,
  approveKb,
  deleteKb
} from "../controllers/kbController.js";
import { protect, authorizeRoles } from "../middleware/authMiddleware.js";

const router = express.Router();
const upload = multer({ dest: "uploads/" });

// Public ingestion endpoints (authenticated users)
router.post("/text", protect, ingestText);
router.post("/pdf", protect, upload.single("file"), ingestPdf);

// Admin/IT endpoints for curation
router.get("/pending", protect, authorizeRoles("admin", "it_support"), listPendingKb);
router.post("/:id/approve", protect, authorizeRoles("admin", "it_support"), approveKb);
router.delete("/:id", protect, authorizeRoles("admin", "it_support"), deleteKb);

export default router;
