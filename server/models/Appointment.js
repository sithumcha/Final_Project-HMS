


// // models/Appointment.js
// const mongoose = require("mongoose");

// const appointmentSchema = new mongoose.Schema(
//   {
//     doctorId: {
//       type: mongoose.Schema.Types.ObjectId,
//       ref: "Doctor",
//       required: true
//     },
//     doctorName: {
//       type: String,
//       required: true
//     },
//     doctorSpecialization: {
//       type: String,
//       required: true
//     },
//     patientDetails: {
//       fullName: { type: String, required: true },
//       email: { type: String },
//       phoneNumber: { type: String, required: true },
//       dateOfBirth: { type: Date },
//       gender: { type: String },
//       address: { type: String },
//       medicalConcern: { type: String, required: true },
//       previousConditions: { type: String }
//     },
//     appointmentDate: {
//       type: Date,
//       required: true
//     },
//     timeSlot: {
//       day: { type: String, required: true },
//       startTime: { type: String, required: true },
//       endTime: { type: String, required: true }
//     },
//     timeSlotId: {  // NEW FIELD - Add this
//       type: mongoose.Schema.Types.ObjectId,
//       required: true
//     },
//     status: {
//       type: String,
//       enum: ["pending", "confirmed", "cancelled", "completed"],
//       default: "pending"
//     },
//     appointmentNumber: {
//       type: String,
//       unique: true
//     }
//   },
//   { timestamps: true }
// );

// // Generate appointment number before saving
// appointmentSchema.pre("save", async function (next) {
//   if (this.isNew) {
//     const date = new Date();
//     const year = date.getFullYear();
//     const month = String(date.getMonth() + 1).padStart(2, '0');
//     const count = await mongoose.model("Appointment").countDocuments();
//     this.appointmentNumber = `APT-${year}${month}-${String(count + 1).padStart(4, '0')}`;
//   }
//   next();
// });

// module.exports = mongoose.model("Appointment", appointmentSchema);









const mongoose = require("mongoose");

const appointmentSchema = new mongoose.Schema(
  {
    userId: {  // NEW FIELD - Add this
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true
    },
    doctorId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Doctor",
      required: true
    },
    doctorName: {
      type: String,
      required: true
    },
    doctorSpecialization: {
      type: String,
      required: true
    },
    patientDetails: {
      fullName: { type: String, required: true },
      email: { type: String },
      phoneNumber: { type: String, required: true },
      dateOfBirth: { type: Date },
      gender: { type: String },
      address: { type: String },
      medicalConcern: { type: String, required: true },
      previousConditions: { type: String }
    },
    appointmentDate: {
      type: Date,
      required: true
    },
    timeSlot: {
      day: { type: String, required: true },
      startTime: { type: String, required: true },
      endTime: { type: String, required: true }
    },
    timeSlotId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true
    },
    status: {
      type: String,
      enum: ["pending", "confirmed", "cancelled", "completed"],
      default: "pending"
    },
    appointmentNumber: {
      type: String,
      unique: true
    }
  },
  { timestamps: true }
);

// Generate appointment number before saving
appointmentSchema.pre("save", async function (next) {
  if (this.isNew) {
    const date = new Date();
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const count = await mongoose.model("Appointment").countDocuments();
    this.appointmentNumber = `APT-${year}${month}-${String(count + 1).padStart(4, '0')}`;
  }
  next();
});

module.exports = mongoose.model("Appointment", appointmentSchema);