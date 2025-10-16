// const mongoose = require("mongoose");

// const userSchema = new mongoose.Schema({
//   username: { type: String, required: true, unique: true },
//   email: { type: String, required: true, unique: true },
//   password: { type: String, required: true }
// }, { timestamps: true });

// module.exports = mongoose.model("User", userSchema);





const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  gender: { 
    type: String, 
    enum: ["male", "female", "other", "prefer-not-to-say"], 
    default: "prefer-not-to-say" 
  },
  birthdate: { type: Date },
  address: {
    street: { type: String },
    city: { type: String },
    state: { type: String },
    country: { type: String, default: "US" },
    zipCode: { type: String }
  }
}, { timestamps: true });

module.exports = mongoose.model("User", userSchema);