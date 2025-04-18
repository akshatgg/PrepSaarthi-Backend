const ErrorHandler = require("./errorHandeler");
const OTPGenerate = require('../models/userVerficationOtp')
const errorCatcherAsync = require('./errorCatcherAsync')
const rateLimit = errorCatcherAsync(async (req, res, next) => {
  const userForOTP = await OTPGenerate.findOne({email:req.body.email, mobileNumber:req.body.mobileNumber})
  if(userForOTP){
    const currentTimestamp = new Date().getTime();
    const diff = currentTimestamp - userForOTP?.rateLimiter;
    const hours24 = 24 * 60 * 60 * 1000;
    
    if (diff >= hours24 || userForOTP.otpCount < 5 ) {
      userForOTP.rateLimiter = currentTimestamp; 
      await userForOTP.save({validateBeforeSave: false})
      next()
    }
    else{
      return next(new ErrorHandler("Too many requests. Try after 24 hrs", 400 ));
  }}
    else if(!userForOTP){
      next()
    }
  });
module.exports = rateLimit 