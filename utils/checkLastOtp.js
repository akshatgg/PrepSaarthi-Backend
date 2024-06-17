const ErrorHandler = require("./errorHandeler");
const OTPGenerate = require('../models/userVerficationOtp')
const errorCatcherAsync = require('./errorCatcherAsync')
const rateLimit = errorCatcherAsync(async (req, res, next) => {
    const user = req.user;
    const userForOTP = await OTPGenerate.findOne({userId:user._id})
    if(userForOTP){
      const currentTimestamp = new Date().getTime();
      const diff = currentTimestamp - userForOTP?.rateLimiter;
      const hours24 = 24 * 60 * 60 * 1000;

      if (diff >= hours24 || userForOTP.otpCount < 8 ) {
        userForOTP.rateLimiter = currentTimestamp;
        userForOTP.otpCount += 1;
        await userForOTP.save({validateBeforeSave: false})
        next()
    }}
    else if(!userForOTP){
        next()
    }else {
        return next(new ErrorHandler("Too many requests. Try after 24 hrs", 400 ));
    }
  });
module.exports = rateLimit