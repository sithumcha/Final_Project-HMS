
const express = require("express");
const router = express.Router();
const upload = require("../config/multer");
const DoctorController = require("../controllers/doctorController");
const doctorAuth = require("../middleware/doctorauth");

// Auth routes
router.post("/auth/register", upload.single("profilePicture"), DoctorController.registerDoctor);
router.post("/auth/login", DoctorController.loginDoctor);
router.post("/auth/change-password", DoctorController.changePassword);

// CRUD routes
router.get("/", DoctorController.getAllDoctors);
router.get("/:id", DoctorController.getDoctorById);
router.put("/:id", upload.single("profilePicture"), DoctorController.updateDoctor);
router.delete("/:id", DoctorController.deleteDoctor);





// Route to add a time slot for a doctor
router.post("/:doctorId/time-slots", doctorAuth, DoctorController.addTimeSlot);

// Route to fetch all time slots for a doctor
router.get("/:doctorId/time-slots", doctorAuth, DoctorController.getTimeSlots);

// Route to fetch doctor details along with available time slots (public access)
router.get("/public/:doctorId/details", DoctorController.getDoctorDetailsPublic);

// // routes/doctors.js
// router.get('/:doctorId/appointment-stats', async (req, res) => {
//   try {
//     const { doctorId } = req.params;
    
//     // Doctor ගේ data එක ගන්න
//     const doctor = await Doctor.findById(doctorId);
//     if (!doctor) {
//       return res.status(404).json({ error: 'Doctor not found' });
//     }
    
//     const stats = {};
    
//     // එක් එක් time slot එකට booked appointments count එක ගන්න
//     for (let slot of doctor.availableTimeSlots) {
//       const bookedCount = await Appointment.countDocuments({
//         doctorId: doctorId,
//         timeSlotId: slot._id,
//         status: { $in: ['confirmed', 'pending'] }
//       });
      
//       stats[slot._id] = {
//         total: slot.quantity,
//         booked: bookedCount,
//         available: slot.quantity - bookedCount
//       };
//     }
    
//     res.json(stats);
//   } catch (error) {
//     console.error('Error fetching appointment stats:', error);
//     res.status(500).json({ error: 'Server error while fetching appointment statistics' });
//   }
// });




// Delete a time slot
router.delete(
  "/:doctorId/time-slots/:slotId",
  doctorAuth,
  DoctorController.deleteTimeSlot
);



module.exports = router;















