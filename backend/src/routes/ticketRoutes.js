import express from "express";
import {
  createTicket,
  getMyTickets,
  getAssignedTickets,
  updateTicket,
  confirmResolution,
  getTicketById,
  addMessage,
  markMessagesRead,
  requestEmployeeConfirmation,
  upload,
} from "../controllers/ticketController.js";
import { protect, authorizeRoles } from "../middleware/authMiddleware.js";

const router = express.Router();

// Employee
router.post("/", protect, authorizeRoles("employee"), createTicket);
router.get("/my", protect, authorizeRoles("employee"), getMyTickets);

// IT Support
router.get("/assigned", protect, authorizeRoles("it_support"), getAssignedTickets);
// single ticket (employee or assigned IT or admin)
router.get("/:id", protect, authorizeRoles("employee", "it_support", "admin"), getTicketById);
router.put("/:id", protect, authorizeRoles("it_support", "admin"), updateTicket);
  // Confirm resolution (employee or IT support)
  router.post("/:id/confirm", protect, authorizeRoles("employee", "it_support"), confirmResolution);
// Add message to ticket (employee or assigned IT or admin)
router.post('/:id/messages', protect, authorizeRoles('employee', 'it_support', 'admin'), upload.array('attachments', 5), addMessage);
// Mark messages as read (employee or assigned IT or admin)
router.post('/:id/read', protect, authorizeRoles('employee', 'it_support', 'admin'), markMessagesRead);
// Request employee confirmation (IT support only)
router.post('/:id/request-confirmation', protect, authorizeRoles('it_support'), requestEmployeeConfirmation);

export default router;
