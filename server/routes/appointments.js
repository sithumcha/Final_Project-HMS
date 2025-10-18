// routes/appointments.js
const express = require("express");
const router = express.Router();
const appointmentController = require("../controllers/appointmentController");

// Public routes
router.post("/", appointmentController.createAppointment);
router.get("/:id", appointmentController.getAppointmentById);
router.get("/", appointmentController.getAllAppointments);


router.get("/user/:userId", appointmentController.getAppointmentsByUser); // NEW ROUTE

// Protected routes (would add auth middleware later)
router.get("/doctor/:doctorId", appointmentController.getAppointmentsByDoctor);
router.put("/:id/status", appointmentController.updateAppointmentStatus);

router.put("/:id/cancel", appointmentController.cancelAppointment); // NEW ROUTE

router.get("/stats/:doctorId", appointmentController.getAppointmentStats);

// Add this to your routes/appointments.js
router.delete("/:id", appointmentController.deleteAppointment);

module.exports = router;