// const User = require("../models/User");
// const bcrypt = require("bcryptjs");
// const jwt = require("jsonwebtoken");

// // Register
// exports.register = async (req, res) => {
//   const { username, email, password } = req.body;
//   try {
//     const userExists = await User.findOne({ email });
//     if (userExists) return res.status(400).json({ message: "User already exists" });

//     const hashedPassword = await bcrypt.hash(password, 10);

//     const user = await User.create({
//       username,
//       email,
//       password: hashedPassword
//     });

//     const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: "1d" });
//     res.status(201).json({ user, token });
//   } catch (error) {
//     res.status(500).json({ message: error.message });
//   }
// };

// // Login
// exports.login = async (req, res) => {
//   const { email, password } = req.body;
//   try {
//     const user = await User.findOne({ email });
//     if (!user) return res.status(400).json({ message: "User not found" });

//     const isMatch = await bcrypt.compare(password, user.password);
//     if (!isMatch) return res.status(400).json({ message: "Invalid credentials" });

//     const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: "1d" });
//     res.status(200).json({ user, token });
//   } catch (error) {
//     res.status(500).json({ message: error.message });
//   }
// };





const User = require("../models/User");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

// Register with password
exports.register = async (req, res) => {
  const { username, email, password, gender, birthdate, address } = req.body;
  
  try {
    // Validate required fields
    if (!username || !email || !password) {
      return res.status(400).json({ message: "Username, email, and password are required" });
    }

    // Validate password strength
    if (password.length < 6) {
      return res.status(400).json({ message: "Password must be at least 6 characters long" });
    }

    // Check if user already exists
    const userExists = await User.findOne({ 
      $or: [{ email }, { username }] 
    });
    
    if (userExists) {
      return res.status(400).json({ 
        message: userExists.email === email ? "Email already registered" : "Username already taken" 
      });
    }

    // Validate birthdate if provided
    if (birthdate) {
      const birthDate = new Date(birthdate);
      const today = new Date();
      const age = today.getFullYear() - birthDate.getFullYear();
      
      if (age < 13) {
        return res.status(400).json({ message: "You must be at least 13 years old to register" });
      }
      
      if (birthDate > today) {
        return res.status(400).json({ message: "Birthdate cannot be in the future" });
      }
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create user
    const user = await User.create({
      username,
      email,
      password: hashedPassword,
      gender: gender || "prefer-not-to-say",
      birthdate: birthdate ? new Date(birthdate) : undefined,
      address: address || {}
    });

    // Generate JWT token
    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: "1d" });

    // Return user data (excluding password)
    const userResponse = {
      _id: user._id,
      username: user.username,
      email: user.email,
      gender: user.gender,
      birthdate: user.birthdate,
      address: user.address,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt
    };

    res.status(201).json({ 
      message: "User registered successfully",
      user: userResponse, 
      token 
    });
  } catch (error) {
    console.error("Registration error:", error);
    res.status(500).json({ 
      message: "Server error during registration",
      error: process.env.NODE_ENV === "development" ? error.message : undefined
    });
  }
};

// Login with password verification
exports.login = async (req, res) => {
  const { email, password } = req.body;
  
  try {
    // Validate input
    if (!email || !password) {
      return res.status(400).json({ message: "Email and password are required" });
    }

    // Find user
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    // Check password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    // Generate JWT token
    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: "1d" });

    // Return user data (excluding password)
    const userResponse = {
      _id: user._id,
      username: user.username,
      email: user.email,
      gender: user.gender,
      birthdate: user.birthdate,
      address: user.address,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt
    };

    res.status(200).json({ 
      message: "Login successful",
      user: userResponse, 
      token 
    });
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({ 
      message: "Server error during login",
      error: process.env.NODE_ENV === "development" ? error.message : undefined
    });
  }
};

// Change password
exports.changePassword = async (req, res) => {
  const { userId, currentPassword, newPassword } = req.body;
  
  try {
    if (!userId || !currentPassword || !newPassword) {
      return res.status(400).json({ message: "User ID, current password, and new password are required" });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({ message: "New password must be at least 6 characters long" });
    }

    // Find user
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Verify current password
    const isMatch = await bcrypt.compare(currentPassword, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: "Current password is incorrect" });
    }

    // Hash new password
    const hashedNewPassword = await bcrypt.hash(newPassword, 10);

    // Update password
    user.password = hashedNewPassword;
    await user.save();

    res.status(200).json({ message: "Password changed successfully" });
  } catch (error) {
    console.error("Change password error:", error);
    res.status(500).json({ 
      message: "Server error while changing password",
      error: process.env.NODE_ENV === "development" ? error.message : undefined
    });
  }
};

// Reset password (simple version - in production, you'd want email verification)
exports.resetPassword = async (req, res) => {
  const { email, newPassword } = req.body;
  
  try {
    if (!email || !newPassword) {
      return res.status(400).json({ message: "Email and new password are required" });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({ message: "New password must be at least 6 characters long" });
    }

    // Find user
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Hash new password
    const hashedNewPassword = await bcrypt.hash(newPassword, 10);

    // Update password
    user.password = hashedNewPassword;
    await user.save();

    res.status(200).json({ message: "Password reset successfully" });
  } catch (error) {
    console.error("Reset password error:", error);
    res.status(500).json({ 
      message: "Server error while resetting password",
      error: process.env.NODE_ENV === "development" ? error.message : undefined
    });
  }
};

// Get user profile
exports.getProfile = async (req, res) => {
  try {
    const { userId } = req.body;
    
    if (!userId) {
      return res.status(400).json({ message: "User ID is required" });
    }

    const user = await User.findById(userId).select("-password");
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    
    res.status(200).json({ user });
  } catch (error) {
    console.error("Get profile error:", error);
    res.status(500).json({ 
      message: "Server error while fetching profile",
      error: process.env.NODE_ENV === "development" ? error.message : undefined
    });
  }
};

// Update user profile
exports.updateProfile = async (req, res) => {
  const { userId, username, gender, birthdate, address } = req.body;
  
  try {
    if (!userId) {
      return res.status(400).json({ message: "User ID is required" });
    }

    // Check if username is being updated and if it's already taken
    if (username) {
      const existingUser = await User.findOne({ 
        username, 
        _id: { $ne: userId } 
      });
      
      if (existingUser) {
        return res.status(400).json({ message: "Username already taken" });
      }
    }

    // Validate birthdate if provided
    if (birthdate) {
      const birthDate = new Date(birthdate);
      const today = new Date();
      
      if (birthDate > today) {
        return res.status(400).json({ message: "Birthdate cannot be in the future" });
      }
    }

    const updatedUser = await User.findByIdAndUpdate(
      userId,
      {
        ...(username && { username }),
        ...(gender && { gender }),
        ...(birthdate && { birthdate: new Date(birthdate) }),
        ...(address && { address })
      },
      { new: true, runValidators: true }
    ).select("-password");

    if (!updatedUser) {
      return res.status(404).json({ message: "User not found" });
    }

    res.status(200).json({ 
      message: "Profile updated successfully",
      user: updatedUser 
    });
  } catch (error) {
    console.error("Update profile error:", error);
    res.status(500).json({ 
      message: "Server error while updating profile",
      error: process.env.NODE_ENV === "development" ? error.message : undefined
    });
  }
};






// Get all users (Admin only)
exports.getAllUsers = async (req, res) => {
  try {
    const users = await User.find().select("-password").sort({ createdAt: -1 });
    res.status(200).json({
      message: "Users fetched successfully",
      users: users
    });
  } catch (error) {
    console.error("Get users error:", error);
    res.status(500).json({ 
      message: "Server error while fetching users",
      error: error.message
    });
  }
};

// Delete user
// Delete user
exports.deleteUser = async (req, res) => {
  try {
    const { id } = req.params;
    console.log('Deleting user ID:', id);
    console.log('Request user:', req.user); // Debug log

    // Check if user is authenticated
    if (!req.user) {
      return res.status(401).json({ 
        success: false,
        message: "Not authorized" 
      });
    }

    // Check if user exists
    const userToDelete = await User.findById(id);
    if (!userToDelete) {
      return res.status(404).json({ 
        success: false,
        message: "User not found" 
      });
    }

    // Prevent user from deleting themselves
    if (req.user._id.toString() === id) {
      return res.status(400).json({ 
        success: false,
        message: "Cannot delete your own account" 
      });
    }

    // Delete the user
    await User.findByIdAndDelete(id);
    console.log('User deleted successfully:', id);

    res.status(200).json({ 
      success: true,
      message: "User deleted successfully"
    });
  } catch (error) {
    console.error("Delete user error:", error);
    res.status(500).json({ 
      success: false,
      message: "Server error while deleting user",
      error: error.message
    });
  }
};


// Get user by ID
exports.getUserById = async (req, res) => {
  try {
    const { id } = req.params;
    console.log('Getting user by ID:', id);

    // Find user by ID and exclude password
    const user = await User.findById(id).select("-password");
    
    if (!user) {
      return res.status(404).json({ 
        success: false,
        message: "User not found" 
      });
    }

    res.status(200).json({
      success: true,
      message: "User fetched successfully",
      user: user
    });
  } catch (error) {
    console.error("Get user by ID error:", error);
    
    if (error.name === 'CastError') {
      return res.status(400).json({ 
        success: false,
        message: "Invalid user ID format" 
      });
    }
    
    res.status(500).json({ 
      success: false,
      message: "Server error while fetching user",
      error: error.message
    });
  }
};

// Get current user profile (alternative)
exports.getCurrentUser = async (req, res) => {
  try {
    // req.user is set by the protect middleware
    const user = await User.findById(req.user._id).select("-password");
    
    if (!user) {
      return res.status(404).json({ 
        success: false,
        message: "User not found" 
      });
    }

    res.status(200).json({
      success: true,
      message: "User profile fetched successfully",
      user: user
    });
  } catch (error) {
    console.error("Get current user error:", error);
    res.status(500).json({ 
      success: false,
      message: "Server error while fetching profile",
      error: error.message
    });
  }
};