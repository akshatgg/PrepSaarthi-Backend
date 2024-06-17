const mongoose = require("mongoose");

const paymentSchema = new mongoose.Schema({
  userId: {
    type: String,
  },
  otp: {
    type: String,
  },
  createdAt: {
    type: Date,
    default: Date.now(),
  },
  expiresIn:{
    type:Date
  },
otpCount:{
    type:Number,
    required:true,
    default:0
},
rateLimiter:{
    type:Date,
    default:Date.now()
}
});
module.exports = mongoose.model("OTPGenerate", paymentSchema);
