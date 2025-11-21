import express from "express";
import { listUnassignedResolved, applyAssignAll, createItUser, updateWorkingHours, listPendingItUsers, approveItUser, listItUsers, removeItUser, listAllTickets, sendMessageToIT, getAdminMessages, getITMessages, markMessageRead, getAttendanceReport } from "../controllers/adminController.js";
import { protect, authorizeRoles } from "../middleware/authMiddleware.js";

const router = express.Router();

// Get unassigned resolved tickets
router.get('/unassigned', protect, authorizeRoles('admin'), listUnassignedResolved);

// Get all tickets
router.get('/tickets', protect, authorizeRoles('admin'), listAllTickets);

// Auto-assign all unassigned tickets
router.post('/assign', protect, authorizeRoles('admin'), applyAssignAll);

// Create new IT support user
router.post('/users', protect, authorizeRoles('admin'), createItUser);

// Update working hours for IT user
router.put('/users/:id/working-hours', protect, authorizeRoles('admin'), updateWorkingHours);

// Get pending IT user approvals
router.get('/users/pending', protect, authorizeRoles('admin'), listPendingItUsers);

// Approve pending IT user
router.post('/users/:id/approve', protect, authorizeRoles('admin'), approveItUser);

// Get all IT users with stats
router.get('/users', protect, authorizeRoles('admin'), listItUsers);

// Remove IT user (deactivate)
router.post('/users/:id/remove', protect, authorizeRoles('admin'), removeItUser);

// Admin messaging to IT staff
router.post('/messages', protect, authorizeRoles('admin'), sendMessageToIT);
router.get('/messages', protect, authorizeRoles('admin'), getAdminMessages);
router.get('/messages/it', protect, authorizeRoles('it_support'), getITMessages);
router.put('/messages/:id/read', protect, authorizeRoles('it_support'), markMessageRead);

// Attendance reports
router.get('/attendance', protect, authorizeRoles('admin'), getAttendanceReport);

export default router;

