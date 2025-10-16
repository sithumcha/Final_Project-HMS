






// const jwt = require("jsonwebtoken");
// const Doctor = require("../models/Doctor");

// // Helper to sign JWT token
// function signToken(id) {
//   return jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRES_IN || "7d" });
// }

// // Register Doctor
// exports.registerDoctor = async (req, res) => {
//   try {
//     const {
//       firstName,
//       middleName,
//       lastName,
//       gender,
//       dateOfBirth,
//       nationalId,
//       specialization,
//       department,
//       email,
//       phoneNumber,
//       medicalLicenseNumber,
//       password,
//       price,
//     } = req.body;

//     // Validation
//     if (!password || password.length < 8) {
//       return res.status(400).json({ error: "Password must be at least 8 characters" });
//     }

//     if (!price || price <= 0) {
//       return res.status(400).json({ error: "Price is required and must be greater than 0" });
//     }

//     // Check for duplicate doctor by email, national ID, or medical license number
//     const existingDoctor = await Doctor.findOne({
//       $or: [{ email: email.toLowerCase() }, { nationalId }, { medicalLicenseNumber }],
//     });
//     if (existingDoctor) {
//       return res.status(409).json({
//         error: "Doctor with provided email, national ID, or medical license number already exists",
//       });
//     }

//     const doctorData = {
//       firstName,
//       middleName,
//       lastName,
//       gender,
//       dateOfBirth,
//       nationalId,
//       profilePicture: req.file ? req.file.path : null,
//       specialization,
//       department,
//       email: email.toLowerCase(),
//       phoneNumber,
//       medicalLicenseNumber,
//       password,
//       price: Number(price),
//     };

//     const newDoctor = await Doctor.create(doctorData);

//     const token = signToken(newDoctor._id);
//     const safeDoctor = newDoctor.toObject();
//     delete safeDoctor.password;

//     res.status(201).json({
//       message: "Doctor registered successfully",
//       token,
//       doctor: safeDoctor,
//     });
//   } catch (error) {
//     console.error("Error registering doctor:", error);
//     if (error.name === 'ValidationError') {
//       return res.status(400).json({ error: "Validation error", details: error.message });
//     }
//     res.status(500).json({ error: "Failed to register doctor", details: error.message });
//   }
// };

// // Login Doctor
// exports.loginDoctor = async (req, res) => {
//   try {
//     const { email, password } = req.body;
//     if (!email || !password) {
//       return res.status(400).json({ error: "Email and password are required" });
//     }

//     const doctor = await Doctor.findOne({ email: email.toLowerCase() }).select("+password");
//     if (!doctor) {
//       return res.status(401).json({ error: "Invalid credentials" });
//     }

//     const isValidPassword = await doctor.comparePassword(password);
//     if (!isValidPassword) {
//       return res.status(401).json({ error: "Invalid credentials" });
//     }

//     const token = signToken(doctor._id);
//     const safeDoctor = doctor.toObject();
//     delete safeDoctor.password;

//     res.status(200).json({
//       message: "Login successful",
//       token,
//       doctor: safeDoctor,
//     });
//   } catch (error) {
//     console.error("Error logging in:", error);
//     res.status(500).json({ error: "Failed to login", details: error.message });
//   }
// };

// // Change Password
// exports.changePassword = async (req, res) => {
//   try {
//     const { currentPassword, newPassword } = req.body;
//     if (!currentPassword || !newPassword) {
//       return res.status(400).json({ error: "Current and new passwords are required" });
//     }
//     if (newPassword.length < 8) {
//       return res.status(400).json({ error: "New password must be at least 8 characters" });
//     }

//     const doctor = await Doctor.findById(req.user.id).select("+password");
//     if (!doctor) return res.status(404).json({ error: "Doctor not found" });

//     const isValidPassword = await doctor.comparePassword(currentPassword);
//     if (!isValidPassword) return res.status(401).json({ error: "Current password is incorrect" });

//     doctor.password = newPassword;
//     await doctor.save();

//     res.status(200).json({ message: "Password changed successfully" });
//   } catch (error) {
//     console.error("Error changing password:", error);
//     res.status(500).json({ error: "Failed to change password" });
//   }
// };

// // CRUD Operations: Get all doctors
// exports.getAllDoctors = async (req, res) => {
//   try {
//     const doctors = await Doctor.find().select("-password");
//     res.status(200).json(doctors);
//   } catch (error) {
//     console.error("Error fetching doctors:", error);
//     res.status(500).json({ error: "Failed to fetch doctors" });
//   }
// };

// // CRUD Operations: Get doctor by ID
// exports.getDoctorById = async (req, res) => {
//   const { id } = req.params;
//   try {
//     const doctor = await Doctor.findById(id).select("-password");
//     if (!doctor) return res.status(404).json({ error: "Doctor not found" });
//     res.status(200).json(doctor);
//   } catch (error) {
//     console.error("Error fetching doctor:", error);
//     res.status(500).json({ error: "Failed to fetch doctor" });
//   }
// };

// // CRUD Operations: Update doctor by ID
// exports.updateDoctor = async (req, res) => {
//   const { id } = req.params;
//   try {
//     const updateData = {
//       ...(req.body.firstName && { firstName: req.body.firstName }),
//       ...(req.body.middleName && { middleName: req.body.middleName }),
//       ...(req.body.lastName && { lastName: req.body.lastName }),
//       ...(req.body.gender && { gender: req.body.gender }),
//       ...(req.body.dateOfBirth && { dateOfBirth: req.body.dateOfBirth }),
//       ...(req.body.nationalId && { nationalId: req.body.nationalId }),
//       ...(req.body.specialization && { specialization: req.body.specialization }),
//       ...(req.body.department && { department: req.body.department }),
//       ...(req.body.email && { email: req.body.email.toLowerCase() }),
//       ...(req.body.phoneNumber && { phoneNumber: req.body.phoneNumber }),
//       ...(req.body.medicalLicenseNumber && { medicalLicenseNumber: req.body.medicalLicenseNumber }),
//       ...(req.body.price && { price: Number(req.body.price) }),
//     };

//     // Handle file upload separately
//     if (req.file) {
//       updateData.profilePicture = req.file.path;
//     }

//     const updatedDoctor = await Doctor.findByIdAndUpdate(id, updateData, { 
//       new: true,
//       runValidators: true 
//     });
//     if (!updatedDoctor) return res.status(404).json({ error: "Doctor not found" });
//     res.status(200).json({ message: "Doctor updated successfully", doctor: updatedDoctor });
//   } catch (error) {
//     console.error("Error updating doctor:", error);
//     if (error.name === 'ValidationError') {
//       return res.status(400).json({ error: "Validation error", details: error.message });
//     }
//     res.status(500).json({ error: "Failed to update doctor" });
//   }
// };

// // CRUD Operations: Delete doctor by ID
// exports.deleteDoctor = async (req, res) => {
//   const { id } = req.params;
//   try {
//     const deletedDoctor = await Doctor.findByIdAndDelete(id);
//     if (!deletedDoctor) return res.status(404).json({ error: "Doctor not found" });
//     res.status(200).json({ message: "Doctor deleted successfully" });
//   } catch (error) {
//     console.error("Error deleting doctor:", error);
//     res.status(500).json({ error: "Failed to delete doctor" });
//   }
// };

// // Add available time slot for a doctor
// exports.addTimeSlot = async (req, res) => {
//   try {
//     const { doctorId } = req.params;
//     const { day, startTime, endTime } = req.body;

//     if (!day || !startTime || !endTime) {
//       return res.status(400).json({ error: "Day, start time, and end time are required" });
//     }

//     const doctor = await Doctor.findById(doctorId);
//     if (!doctor) {
//       return res.status(404).json({ error: "Doctor not found" });
//     }

//     doctor.availableTimeSlots.push({ day, startTime, endTime });
//     await doctor.save();

//     res.status(200).json({
//       message: "Time slot added successfully",
//       availableTimeSlots: doctor.availableTimeSlots,
//     });
//   } catch (error) {
//     console.error("Error adding time slot:", error);
//     res.status(500).json({ error: "Failed to add time slot" });
//   }
// };

// // Get all available time slots for a doctor
// exports.getTimeSlots = async (req, res) => {
//   try {
//     const { doctorId } = req.params;

//     const doctor = await Doctor.findById(doctorId).select("availableTimeSlots");
//     if (!doctor) {
//       return res.status(404).json({ error: "Doctor not found" });
//     }

//     res.status(200).json({ availableTimeSlots: doctor.availableTimeSlots });
//   } catch (error) {
//     console.error("Error fetching time slots:", error);
//     res.status(500).json({ error: "Failed to fetch time slots" });
//   }
// };

// // Public route to fetch doctor details along with available time slots
// exports.getDoctorDetailsPublic = async (req, res) => {
//   const { doctorId } = req.params;

//   try {
//     const doctor = await Doctor.findById(doctorId).select("-password");
//     if (!doctor) return res.status(404).json({ error: "Doctor not found" });

//     res.status(200).json({
//       doctor: doctor,
//       price: doctor.price,
//       availableTimeSlots: doctor.availableTimeSlots || [],
//     });
//   } catch (error) {
//     console.error("Error fetching doctor details:", error);
//     res.status(500).json({ error: "Failed to fetch doctor details" });
//   }
// };

// // Delete a specific time slot for a doctor
// exports.deleteTimeSlot = async (req, res) => {
//   try {
//     const { doctorId, slotId } = req.params;

//     const doctor = await Doctor.findById(doctorId);
//     if (!doctor) return res.status(404).json({ error: "Doctor not found" });

//     doctor.availableTimeSlots = doctor.availableTimeSlots.filter(
//       (slot) => slot._id.toString() !== slotId
//     );

//     await doctor.save();

//     res.status(200).json({
//       message: "Time slot deleted successfully",
//       availableTimeSlots: doctor.availableTimeSlots,
//     });
//   } catch (error) {
//     console.error("Error deleting time slot:", error);
//     res.status(500).json({ error: "Failed to delete time slot" });
//   }
// };







const jwt = require("jsonwebtoken");
const Doctor = require("../models/Doctor");

// Helper to sign JWT token
function signToken(id) {
  return jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRES_IN || "7d" });
}

// Register Doctor
exports.registerDoctor = async (req, res) => {
  try {
    const {
      firstName,
      middleName,
      lastName,
      gender,
      dateOfBirth,
      nationalId,
      specialization,
      department,
      email,
      phoneNumber,
      medicalLicenseNumber,
      password,
      price,
    } = req.body;

    // Validation
    if (!password || password.length < 8) {
      return res.status(400).json({ error: "Password must be at least 8 characters" });
    }

    if (!price || price <= 0) {
      return res.status(400).json({ error: "Price is required and must be greater than 0" });
    }

    // Check for duplicate doctor by email, national ID, or medical license number
    const existingDoctor = await Doctor.findOne({
      $or: [{ email: email.toLowerCase() }, { nationalId }, { medicalLicenseNumber }],
    });
    if (existingDoctor) {
      return res.status(409).json({
        error: "Doctor with provided email, national ID, or medical license number already exists",
      });
    }

    const doctorData = {
      firstName,
      middleName,
      lastName,
      gender,
      dateOfBirth,
      nationalId,
      profilePicture: req.file ? req.file.path : null,
      specialization,
      department,
      email: email.toLowerCase(),
      phoneNumber,
      medicalLicenseNumber,
      password,
      price: Number(price),
    };

    const newDoctor = await Doctor.create(doctorData);

    const token = signToken(newDoctor._id);
    const safeDoctor = newDoctor.toObject();
    delete safeDoctor.password;

    res.status(201).json({
      message: "Doctor registered successfully",
      token,
      doctor: safeDoctor,
    });
  } catch (error) {
    console.error("Error registering doctor:", error);
    if (error.name === 'ValidationError') {
      return res.status(400).json({ error: "Validation error", details: error.message });
    }
    res.status(500).json({ error: "Failed to register doctor", details: error.message });
  }
};

// Login Doctor
exports.loginDoctor = async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ error: "Email and password are required" });
    }

    const doctor = await Doctor.findOne({ email: email.toLowerCase() }).select("+password");
    if (!doctor) {
      return res.status(401).json({ error: "Invalid credentials" });
    }

    const isValidPassword = await doctor.comparePassword(password);
    if (!isValidPassword) {
      return res.status(401).json({ error: "Invalid credentials" });
    }

    const token = signToken(doctor._id);
    const safeDoctor = doctor.toObject();
    delete safeDoctor.password;

    res.status(200).json({
      message: "Login successful",
      token,
      doctor: safeDoctor,
    });
  } catch (error) {
    console.error("Error logging in:", error);
    res.status(500).json({ error: "Failed to login", details: error.message });
  }
};

// Change Password
exports.changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    if (!currentPassword || !newPassword) {
      return res.status(400).json({ error: "Current and new passwords are required" });
    }
    if (newPassword.length < 8) {
      return res.status(400).json({ error: "New password must be at least 8 characters" });
    }

    const doctor = await Doctor.findById(req.user.id).select("+password");
    if (!doctor) return res.status(404).json({ error: "Doctor not found" });

    const isValidPassword = await doctor.comparePassword(currentPassword);
    if (!isValidPassword) return res.status(401).json({ error: "Current password is incorrect" });

    doctor.password = newPassword;
    await doctor.save();

    res.status(200).json({ message: "Password changed successfully" });
  } catch (error) {
    console.error("Error changing password:", error);
    res.status(500).json({ error: "Failed to change password" });
  }
};

// CRUD Operations: Get all doctors
exports.getAllDoctors = async (req, res) => {
  try {
    const doctors = await Doctor.find().select("-password");
    res.status(200).json(doctors);
  } catch (error) {
    console.error("Error fetching doctors:", error);
    res.status(500).json({ error: "Failed to fetch doctors" });
  }
};

// CRUD Operations: Get doctor by ID
exports.getDoctorById = async (req, res) => {
  const { id } = req.params;
  try {
    const doctor = await Doctor.findById(id).select("-password");
    if (!doctor) return res.status(404).json({ error: "Doctor not found" });
    res.status(200).json(doctor);
  } catch (error) {
    console.error("Error fetching doctor:", error);
    res.status(500).json({ error: "Failed to fetch doctor" });
  }
};

// CRUD Operations: Update doctor by ID
exports.updateDoctor = async (req, res) => {
  const { id } = req.params;
  try {
    const updateData = {
      ...(req.body.firstName && { firstName: req.body.firstName }),
      ...(req.body.middleName && { middleName: req.body.middleName }),
      ...(req.body.lastName && { lastName: req.body.lastName }),
      ...(req.body.gender && { gender: req.body.gender }),
      ...(req.body.dateOfBirth && { dateOfBirth: req.body.dateOfBirth }),
      ...(req.body.nationalId && { nationalId: req.body.nationalId }),
      ...(req.body.specialization && { specialization: req.body.specialization }),
      ...(req.body.department && { department: req.body.department }),
      ...(req.body.email && { email: req.body.email.toLowerCase() }),
      ...(req.body.phoneNumber && { phoneNumber: req.body.phoneNumber }),
      ...(req.body.medicalLicenseNumber && { medicalLicenseNumber: req.body.medicalLicenseNumber }),
      ...(req.body.price && { price: Number(req.body.price) }),
    };

    // Handle file upload separately
    if (req.file) {
      updateData.profilePicture = req.file.path;
    }

    const updatedDoctor = await Doctor.findByIdAndUpdate(id, updateData, { 
      new: true,
      runValidators: true 
    });
    if (!updatedDoctor) return res.status(404).json({ error: "Doctor not found" });
    res.status(200).json({ message: "Doctor updated successfully", doctor: updatedDoctor });
  } catch (error) {
    console.error("Error updating doctor:", error);
    if (error.name === 'ValidationError') {
      return res.status(400).json({ error: "Validation error", details: error.message });
    }
    res.status(500).json({ error: "Failed to update doctor" });
  }
};

// CRUD Operations: Delete doctor by ID
exports.deleteDoctor = async (req, res) => {
  const { id } = req.params;
  try {
    const deletedDoctor = await Doctor.findByIdAndDelete(id);
    if (!deletedDoctor) return res.status(404).json({ error: "Doctor not found" });
    res.status(200).json({ message: "Doctor deleted successfully" });
  } catch (error) {
    console.error("Error deleting doctor:", error);
    res.status(500).json({ error: "Failed to delete doctor" });
  }
};

// Add available time slot for a doctor
exports.addTimeSlot = async (req, res) => {
  try {
    const { doctorId } = req.params;
    const { day, startTime, endTime, quantity } = req.body;

    if (!day || !startTime || !endTime || !quantity) {
      return res.status(400).json({ error: "Day, start time, end time, and quantity are required" });
    }

    if (startTime >= endTime) {
      return res.status(400).json({ error: "End time must be after start time" });
    }

    const doctor = await Doctor.findById(doctorId);
    if (!doctor) {
      return res.status(404).json({ error: "Doctor not found" });
    }

    doctor.availableTimeSlots.push({ day, startTime, endTime, quantity });
    await doctor.save();

    res.status(200).json({
      message: "Time slot added successfully",
      availableTimeSlots: doctor.availableTimeSlots,
    });
  } catch (error) {
    console.error("Error adding time slot:", error);
    res.status(500).json({ error: "Failed to add time slot" });
  }
};

// Get all available time slots for a doctor
exports.getTimeSlots = async (req, res) => {
  try {
    const { doctorId } = req.params;

    const doctor = await Doctor.findById(doctorId).select("availableTimeSlots");
    if (!doctor) {
      return res.status(404).json({ error: "Doctor not found" });
    }

    res.status(200).json({ availableTimeSlots: doctor.availableTimeSlots });
  } catch (error) {
    console.error("Error fetching time slots:", error);
    res.status(500).json({ error: "Failed to fetch time slots" });
  }
};

// Public route to fetch doctor details along with available time slots
exports.getDoctorDetailsPublic = async (req, res) => {
  const { doctorId } = req.params;

  try {
    const doctor = await Doctor.findById(doctorId).select("-password");
    if (!doctor) return res.status(404).json({ error: "Doctor not found" });

    res.status(200).json({
      doctor: doctor,
      price: doctor.price,
      availableTimeSlots: doctor.availableTimeSlots || [],
    });
  } catch (error) {
    console.error("Error fetching doctor details:", error);
    res.status(500).json({ error: "Failed to fetch doctor details" });
  }
};

// Delete a specific time slot for a doctor
exports.deleteTimeSlot = async (req, res) => {
  try {
    const { doctorId, slotId } = req.params;

    const doctor = await Doctor.findById(doctorId);
    if (!doctor) return res.status(404).json({ error: "Doctor not found" });

    doctor.availableTimeSlots = doctor.availableTimeSlots.filter(
      (slot) => slot._id.toString() !== slotId
    );

    await doctor.save();

    res.status(200).json({
      message: "Time slot deleted successfully",
      availableTimeSlots: doctor.availableTimeSlots,
    });
  } catch (error) {
    console.error("Error deleting time slot:", error);
    res.status(500).json({ error: "Failed to delete time slot" });
  }
};
