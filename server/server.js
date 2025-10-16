// const express = require("express");
// const dotenv = require("dotenv");
// const connectDB = require("./config/db");
// const cors = require("cors");

// dotenv.config();
// connectDB();

// const app = express();
// app.use(cors());
// app.use(express.json());

// app.use("/api/users", require("./routes/authRoutes"));

// const PORT = process.env.PORT || 5000;
// app.listen(PORT, () => console.log(`Server running on port ${PORT}`));



const express = require("express");
const dotenv = require("dotenv");
const connectDB = require("./config/db");
const cors = require("cors");
const path = require("path");

dotenv.config();
connectDB();  // Connect to the database

const app = express();

// Middleware
app.use(cors());
app.use(express.json());  // Parse JSON data in request body

// Serve static files (uploads folder)
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// Routes

app.use("/api/users", require("./routes/authRoutes"));  // User-related routes
app.use("/api/doctors", require("./routes/doctorRoutes"));  // Doctor-related routes






// backend/api/doctors/{doctorId}/time-slots
app.get('/api/doctors/:doctorId/time-slots', async (req, res) => {
  try {
    const doctor = await Doctor.findById(req.params.doctorId);
    if (!doctor) {
      return res.status(404).json({ message: 'Doctor not found' });
    }
    res.json({ availableTimeSlots: doctor.availableTimeSlots });
  } catch (err) {
    res.status(500).json({ message: 'Error fetching time slots' });
  }
});


// In your main app.js or server.js
const appointmentRoutes = require("./routes/appointments");
app.use("/api/appointments", appointmentRoutes);





// Test route
app.get("/api/test", (req, res) => {
  res.json({ message: "Server is running correctly!" });
});


const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});






