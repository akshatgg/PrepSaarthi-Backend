const mongoose = require("mongoose");
const validate = require("validator");
const bcryptjs = require("bcryptjs");
const jwt = require("jsonwebtoken");
const crypto = require("crypto");
const { type } = require("os");
const connectionSchema = new mongoose.Schema({

      studentDetails: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Student",
        required: true,
      },
      mentorDetails:{
        type: mongoose.Schema.Types.ObjectId,
        ref: "Mentor",
        required: true,
    },
    expiresIn: {
        type: Date,
        required: true,
    },
    isActive:{
        type:Boolean,
        required: true,
    },
    isConnected:{
        type:Boolean,
        required: true,
    },
    boughtAt: {
        type: Date,
        default: Date.now,
    },
    price:{
        type:Number,
        required: true,
  }
});

connectionSchema.pre("save", async function (next) {
  if (!this.isModified("password")) {
    next();
  }
  this.password = await bcryptjs.hash(this.password, 11);
});

connectionSchema.methods.getJWTToken = function () {
  return jwt.sign({ id: this._id }, process.env.JWT_SEC, {
    expiresIn: process.env.JWT_EXP,
  });
};

connectionSchema.methods.verifyPassword = async function (enteredPassword) {
  return await bcryptjs.compare(enteredPassword, this.password);
};

connectionSchema.methods.generateResetPasswordToken = function () {
  const resetToken = crypto.randomBytes(20).toString("hex");

  this.resetPasswordToken = crypto
    .createHash("sha256")
    .update(resetToken)
    .toString("hex");
  this.resetPasswordExpire = Date.now() + 10 * 60 * 1000;

  return resetToken;
};
module.exports = mongoose.model("Connection", connectionSchema);

