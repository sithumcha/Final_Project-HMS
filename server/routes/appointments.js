// routes/appointments.js
const express = require("express");
const router = express.Router();
const appointmentController = require("../controllers/appointmentController");

// Public routes
router.post("/", appointmentController.createAppointment);
router.get("/:id", appointmentController.getAppointmentById);
router.get("/", appointmentController.getAllAppointments);

// Protected routes (would add auth middleware later)
router.get("/doctor/:doctorId", appointmentController.getAppointmentsByDoctor);
router.put("/:id/status", appointmentController.updateAppointmentStatus);

router.get("/stats/:doctorId", appointmentController.getAppointmentStats);

module.exports = router;