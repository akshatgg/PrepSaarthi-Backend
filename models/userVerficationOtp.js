const mongoose = require("mongoose");

const paymentSchema = new mongoose.Schema({
  email: {
    type: String,
  },
  mobileNumber:{
    type:String,
  },
  otp: {
    type: String,
  },
  mobOtp:{
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
