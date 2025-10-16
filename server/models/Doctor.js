


// const mongoose = require('mongoose');
// const bcrypt = require('bcryptjs');

// const doctorSchema = new mongoose.Schema(
//   {
//     firstName: { type: String, required: true },
//     middleName: { type: String },
//     lastName: { type: String, required: true },
//     gender: { type: String, required: true },
//     dateOfBirth: { type: Date, required: true },
//     nationalId: { type: String, required: true, unique: true },
//     profilePicture: { type: String },  // Path to the uploaded file (optional)
//     specialization: { type: String, required: true },
//     department: { type: String, required: true },
//     email: { type: String, required: true, unique: true, lowercase: true, trim: true },
//     phoneNumber: { type: String, required: true },
//     medicalLicenseNumber: { type: String, required: true, unique: true },
//     password: { type: String, required: true, minlength: 8, select: false }, // Password should be hashed
//     price: { type: Number, required: true }, // Price for the doctor's services
    
//     // Add available time slots for the doctor
//     availableTimeSlots: [
//       {
//         day: { type: String, required: true }, // Day of the week (e.g., "Monday")
//         startTime: { type: String, required: true }, // e.g., "09:00 AM"
//         endTime: { type: String, required: true }, // e.g., "05:00 PM"
//       },
//     ],
//   },
//   { timestamps: true }
// );

// // Hash the password before saving the document
// doctorSchema.pre("save", async function (next) {
//   if (!this.isModified("password")) return next();
//   const salt = await bcrypt.genSalt(12);
//   this.password = await bcrypt.hash(this.password, salt);
//   next();
// });

// // Instance method to compare password
// doctorSchema.methods.comparePassword = async function (candidatePassword) {
//   return await bcrypt.compare(candidatePassword, this.password);
// };

// const Doctor = mongoose.model("Doctor", doctorSchema);
// module.exports = Doctor;





const mongoose = require('mongoose');
 const bcrypt = require('bcryptjs');

const doctorSchema = new mongoose.Schema(
  {
    firstName: { type: String, required: true },
    middleName: { type: String },
    lastName: { type: String, required: true },
    gender: { type: String, required: true },
    dateOfBirth: { type: Date, required: true },
    nationalId: { type: String, required: true, unique: true },
    profilePicture: { type: String },  // Path to the uploaded file (optional)
    specialization: { type: String, required: true },
    department: { type: String, required: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    phoneNumber: { type: String, required: true },
    medicalLicenseNumber: { type: String, required: true, unique: true },
    password: { type: String, required: true, minlength: 8, select: false }, // Password should be hashed
    price: { type: Number, required: true }, // Price for the doctor's services
    
    // Add available time slots for the doctor
    availableTimeSlots: [
      {
        day: { type: String, required: true }, // Day of the week (e.g., "Monday")
        startTime: { type: String, required: true }, // e.g., "09:00 AM"
        endTime: { type: String, required: true }, // e.g., "05:00 PM"
        quantity: { type: Number, required: true, default: 20 }, // Number of available consultations
      },
    ],
  },
  { timestamps: true }
);

// Hash the password before saving the document
doctorSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();
  const salt = await bcrypt.genSalt(12);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

// Instance method to compare password
doctorSchema.methods.comparePassword = async function (candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

const Doctor = mongoose.model("Doctor", doctorSchema);
module.exports = Doctor;
