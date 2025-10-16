const express = require("express");
const router = express.Router();
const { 
  register, 
  login, 
  getProfile, 
  updateProfile, 
  changePassword, 
  resetPassword,
  getAllUsers,
  deleteUser,
  getCurrentUser,
  getUserById

} = require("../controllers/authController");

// Public routes
router.post("/register", register);
router.post("/login", login);
router.post("/reset-password", resetPassword);

// Protected routes (without middleware - using userId in request body)
router.get("/profile", getProfile);
router.put("/profile", updateProfile);
router.put("/change-password", changePassword);

router.get("/users", getAllUsers);
router.delete("/users/:id", deleteUser);

router.get("/me", getCurrentUser);
router.get("/users/:id", getUserById);

module.exports = router;