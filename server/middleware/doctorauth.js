// const jwt = require("jsonwebtoken");
// const Doctor = require("../models/Doctor");

// // Function to verify JWT and attach user data to the request
// module.exports = function doctorAuth(req, res, next) {
//   const authHeader = req.headers.authorization || ""; 
//   const token = authHeader.startsWith("Bearer ") ? authHeader.slice(7) : null;

//   if (!token) {
//     return res.status(401).json({ error: "Not authorized: missing token" });
//   }

//   try {
//     // Verify the token using your JWT secret
//     const decoded = jwt.verify(token, process.env.JWT_SECRET);

//     // Attach the doctor ID to the request object
//     req.user = { id: decoded.id };

//     // Optionally, if you need role-based access (admin role check), fetch the doctor details from DB
//     Doctor.findById(decoded.id).select("role")
//       .then(doctor => {
//         if (doctor) {
//           req.user.role = doctor.role || "doctor"; // Default role to "doctor"
//           next(); // Proceed with the request if the doctor is found
//         } else {
//           return res.status(404).json({ error: "Doctor not found" });
//         }
//       })
//       .catch(err => {
//         console.error("Error fetching doctor:", err);
//         return res.status(500).json({ error: "Internal server error" });
//       });

//   } catch (err) {
//     console.error("Invalid token:", err);
//     return res.status(401).json({ error: "Invalid or expired token" });
//   }
// };



//////////////////////////////////////////////

const jwt = require("jsonwebtoken");
const Doctor = require("../models/Doctor");

// Function to verify JWT and attach user data to the request
module.exports = function doctorAuth(req, res, next) {
  const authHeader = req.headers.authorization || ""; 
  const token = authHeader.startsWith("Bearer ") ? authHeader.slice(7) : null;

  if (!token) {
    return res.status(401).json({ error: "Not authorized: missing token" });
  }

  try {
    // Verify the token using your JWT secret
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Attach the doctor ID to the request object
    req.user = { id: decoded.id };

    // Optionally, if you need role-based access (admin role check), fetch the doctor details from DB
    Doctor.findById(decoded.id).select("role")
      .then(doctor => {
        if (doctor) {
          req.user.role = doctor.role || "doctor"; // Default role to "doctor"
          
          // Optional: Role-based access check (e.g., for admin routes)
          if (req.user.role === "admin") {
            // Allow admin to access any route
            next();
          } else if (req.user.role === "doctor") {
            // Allow doctor to access doctor-related routes
            next();
          } else {
            return res.status(403).json({ error: "Permission denied" });
          }
        } else {
          return res.status(404).json({ error: "Doctor not found" });
        }
      })
      .catch(err => {
        console.error("Error fetching doctor:", err);
        return res.status(500).json({ error: "Internal server error" });
      });

  } catch (err) {
    console.error("Invalid token:", err);
    return res.status(401).json({ error: "Invalid or expired token" });
  }
};
