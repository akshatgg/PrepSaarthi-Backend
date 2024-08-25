const ErrorHandler = require("../utils/errorHandeler.js");
const errorCatcherAsync = require("../utils/errorCatcherAsync.js");
// const Product = require("../backend/models/productModel");
const jwtToken = require("../utils/jwtToken.js");
const { resetPasswordMessage } = require("../utils/mailformat.js");
const crypto = require("crypto");
const Student = require("../models/studentModel.js");
const Mentor = require("../models/mentorModel");
const Connection = require("../models/connectionModel.js");
const cloudinary = require("cloudinary");
const bcryptjs = require("bcryptjs");
const OTPGenerate = require("../models/userVerficationOtp.js");
// const OTPGenerate = require('../models/userVerficationOtp.js')
const sendMail = require("../utils/sendMail.js");
//Registering a USER

exports.reegisterStudent = errorCatcherAsync(async (req, res, next) => { 
  const userCheck = await Mentor.findOne({ email: req.body.email });
  const userMob = await Mentor.findOne({
    mobileNumber: req.body.mobileNumber,
  });
  if (userCheck || userMob) {
    return next(new ErrorHandler("Account already exists", 400));
  }

  const isVerified = await verifyOTP(req,next);
  if(!isVerified){
    return next(new ErrorHandler("Incorrect or expired OTP", 400));
  }
  if (req.body.avatar) {
    const myCloud = await cloudinary.v2.uploader.upload(req.body.avatar, {
      folder: "avatars",
      width: 400,
      crop: "scale",
    });
    const { name, email, password, mobileNumber } = req.body;
    const user = await Student.create({
      name,
      email,
      password,
      mobileNumber,
      verified:true,
      numVerified:true,
      signedUpFor: "student",
      avatar: { public_ID: myCloud.public_id, public_URI: myCloud.secure_url },
    });
    jwtToken(user, 201, res);
  } else {
    const { name, email, password, mobileNumber } = req.body;
    const user = await Student.create({
      name,
      email,
      password,
      verified:true,
      numVerified:true,
      mobileNumber,
      signedUpFor: "student",
    });
    await OTPGenerate.deleteMany({ email: req.body.email, mobileNumber: req.body.mobileNumber});
    jwtToken(user, 201, res);
  }
});

const verifyOTP = async (req,next) => {
  const  otp = req.body.emailOTP;
  const mobOtp = req.body.numberOTP;
  console.log(req.body.email)
  if (!otp || !mobOtp) {
    return next(new ErrorHandler("Please enter the otp", 400));
  }

  const userOTPVerification = await OTPGenerate.find({ email: req.body.email, mobileNumber: req.body.mobileNumber });

  if (userOTPVerification.length <= 0) {
    return next(
      new ErrorHandler(
        "Account doesn't exists or already verified.Please login or signup"
      )
    );
  }
  const { expiresIn } = userOTPVerification[0];

  const hashedOTP = userOTPVerification[0].otp;
  const hashedMobOTP = userOTPVerification[0].mobOtp;

  if (expiresIn < Date.now()) {
    await OTPGenerate.deleteMany({ email: req.body.email });
    return false;
  }

  const validOTP = await bcryptjs.compare(otp, hashedOTP);
  const validMobOTP = await bcryptjs.compare(mobOtp, hashedMobOTP);

  if (!validOTP || !validMobOTP) {
    return false;
  }

  // await Mentor.updateOne({ _id: req.user._id }, { verified: true });
  // await Student.updateOne({ _id: req.user._id }, { verified: true });


  return true;
};
// USER Login

exports.loginStudent = errorCatcherAsync(async (req, res, next) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return next(new ErrorHandler("Enter Your Email & Password", 400));
  }
  const user = await Student.findOne({ email }).select("+password");
  if (!user) {
    return next(new ErrorHandler("Invalid username or password", 401));
  }
  if (!user.isActive) {
    return next(new ErrorHandler("Invalid username or password", 401));
  }
  const isPassword = await user.verifyPassword(password);

  if (!isPassword) {
    return next(new ErrorHandler("Invalid username or password", 401));
  }

  jwtToken(user, 200, res);
});

//Buy Mentorship

exports.buyMentorShipDay = errorCatcherAsync(async (req, res, next) => {
  const { id, price } = req.body;
  const user = await Student.findById(req.user._id);
  if (!user) {
    return next(new ErrorHandler("No such user exists", 400));
  }
  const mentor = await Mentor.findById(id);
  if (!mentor) {
    return next(new ErrorHandler("No such mentor exists", 400));
  }
  user.mentorAssigned = true;
  const connection = {
    studentDetails: req.user.id,
    mentorDetails: id,
    expiresIn: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
    isActive: true,
    isConnected: false,
    price: price,
  };
  await Connection.create(connection);
  await user.save({ validateBeforeSave: false });
  res.status(200).json({
    success: true,
  });
});
//Buy Mentorship

exports.getAllAssignedMentors = errorCatcherAsync(async (req, res, next) => {
  const connection = await Connection.find({ studentDetails: req.user.id })
    .populate("studentDetails", "name avatar")
    .populate("mentorDetails", "name avatar");
  res.status(200).json({
    connection,
  });
});
// get all connection
exports.allConnectionSuccessfull = errorCatcherAsync(async (req, res, next) => {
  const connection = await Connection.find({
    mentorDetails: req.params.id,
    // isActive: false,
    // isConnected: false,
  });

  // connection
  res.status(200).json({
    success: true,
    count: connection.length,
  });
});
//active Mentorship
exports.getActiveMentorship = errorCatcherAsync(async (req, res, next) => {
  const connection = await Connection.find({
    studentDetails: req.user.id,
    isActive: true,
  });
  res.status(200).json({
    connection,
  });
});

// Logout user

exports.logout = errorCatcherAsync(async (req, res, next) => {
  res.cookie("token", null, {
    expires: new Date(Date.now()),
    httpOnly: true,
  });

  res.status(200).json({
    success: true,
    message: "You are logged Out",
  });
});

// Forgot Password

exports.forgotPass = errorCatcherAsync(async (req, res, next) => {
  const user = await Student.findOne({ email: req.body.email });

  if (!user || !user.isActive) {
    return next(new ErrorHandler("User not found", 404));
  }

  const resetToken = user.generateResetPasswordToken();

  await user.save({ validateBeforeSave: false });

  const resetPasswordURI = `${process.env.FRONTEND_URL}/password/reset/${resetToken}`;

  const message = resetPasswordMessage(user, resetPasswordURI);

  try {
    await sendMail({
      email: user.email,
      subject: "PrepSaarthi Password Recovery Support",
      message,
    });

    res.status(200).json({
      success: true,
      message: `An email for password recovery has been  sent to your registered email`,
    });
  } catch (e) {
    user.resetPasswordToken = undefined;
    user.resetPasswordExpire = undefined;

    await user.save({ validateBeforeSave: false });

    return next(new ErrorHandler(e.message, 500));
  }
});

// //Reset Password

exports.resetPassord = errorCatcherAsync(async (req, res, next) => {
  const resetPasswordToken = crypto
    .createHash("sha256")
    .update(req.params.tkid)
    .toString("hex");

  const user = await Student.findOne({
    resetPasswordToken,
    resetPasswordExpire: { $gt: Date.now() },
  });
  if (!user) {
    return next(new ErrorHandler("Invalid or Expired Token", 400));
  }

  if (req.body.password !== req.body.confirmPassword) {
    return next(new ErrorHandler("Both the password must match", 400));
  }

  user.password = req.body.password;

  user.resetPasswordToken = undefined;
  user.resetPasswordExpire = undefined;

  await user.save();
  const message = passwordChange(user);

  try {
    await sendMail({
      email: user.email,
      subject: "Your password has been changed",
      message,
    });

    jwtMssg(user, 200, res);
  } catch (e) {
    return next(new ErrorHandler(e.message, 500));
  }
});

// // Get User Detail

exports.getStudentDetails = errorCatcherAsync(async (req, res, next) => {
  const user = await Student.findById(req.params.id);
  if (!user.isActive) {
    return next(new ErrorHandler("No SUch Account Exists", 404));
  }
  res.status(200).json({
    message: true,
    user: {
      name: user.name,
      email: user.email,
      avatar: user.avatar,
      exam: user.exam,
      idCard: user.idCard,
      branch: user.branch,
      yearOfStudy: user.yearOfStudy,
      ratings: user.ratings,
      reviews: user.reviews,
      numberOfrating: user.numOfReviews,
      userAssigned: user.userAssigned,
      desc: user.desc,
      about: user.about,
      ppm: user.pricePerMonth,
      ppd: user.pricePerDay,
    },
  });
});
// // Get User Detail

exports.loadUserDetails = errorCatcherAsync(async (req, res, next) => {
  const user = await Student.findById(req.user.id);
  if (!user.isActive) {
    return next(new ErrorHandler("No SUch Account Exists", 404));
  }
  const connection = await Connection.find({studentDetails:req.user._id, isActive:true})
    if(connection.length > 0){
      user.mentorAssigned = true;
      await user.save()
    }
    if(connection.length === 0){
      user.mentorAssigned = false;
      await user.save()
    }
  res.status(200).json({
    message: true,
    user,
    userSigned: req.user._id,
  });
});

// // Update User password

exports.updatePassword = errorCatcherAsync(async (req, res, next) => {
  const user = await Student.findById(req.user.id).select("+password");

  if (!req.body.oldPassword) {
    return next(new ErrorHandler("Kindly enter your old Password", 400));
  }

  if (!req.body.newPassword || !req.body.confirmPassword) {
    return next(
      new ErrorHandler("Please enter your new password in both feilds", 400)
    );
  }

  if (req.body.newPassword !== req.body.confirmPassword) {
    return next(new ErrorHandler("Both password must match", 400));
  }

  const isPassword = await user.verifyPassword(req.body.oldPassword);

  if (!isPassword) {
    return next(new ErrorHandler("Old Password is incorrect ! Try again", 400));
  }

  user.password = req.body.newPassword;
  await user.save();

  jwtToken(user, 200, res);
});

exports.changeCoverPhotoStu = errorCatcherAsync(async (req, res, next) => {
  const user = await Student.findById(req.user._id);
  if (!user) {
    return next(new ErrorHandler("Invalid Request", 500));
  }  
  if (req.body.avatar) {
    if(user.coverImg.public_URI !== '/images/cover.img'){
      await cloudinary.v2.uploader.destroy(user.coverImg.public_ID);
    }
      const myCloud = await cloudinary.v2.uploader.upload(req.body.avatar, {
        folder: "covers",
        width: 1000,
        crop: "scale",
      }); 
      user.coverImg = { public_ID: myCloud.public_id, public_URI: myCloud.secure_url }
      await user.save({validateBeforeSave:false})  
      res.status(200).json({
        success: true,
      });
  
  
  } 
});


// //  update personal info

exports.updateStudentProfile = errorCatcherAsync(async (req, res, next) => {
  const newUserData = {
    email: req.body.email,
    name: req.body.name,
    mobileNumber: req.body.number,
  };
  if (req.body.avatar && req.body.avatar !== " ") {
    const data = await Student.findById(req.user.id);
    const { avatar } = data;
    await cloudinary.v2.uploader.destroy(avatar.public_ID);
    try {
      const myCloud = await cloudinary.v2.uploader.upload(req.body.avatar, {
        folder: "avatars",
        width: 400,
        crop: "scale",
      });

      newUserData.avatar = {
        public_ID: myCloud.public_id,
        public_URI: myCloud.secure_url,
      };
    } catch (e) {}
  }
  await Student.findByIdAndUpdate(req.user.id, newUserData, {
    new: true,
    runValidators: true,
    useFindAndModify: false,
  });

  res.status(200).json({
    success: true,
  });
});

//Update mentor info

// exports.updateStudentInfo = errorCatcherAsync(async (req, res, next) => {
//   const newUserData = {
//     isDropper: req.body.isDropper,
//     studyMode: req.body.studyMode,
//     branch: req.body.branch,
//     exam: JSON.parse(req.body.exam),
//     yearOfStudy: req.body.yearOfStudy,
//     linkedin: req.body.linkedin,
//     youtube: req.body.youtube,
//     about: req.body.about,
//     desc: req.body.disc,
//     pricePerMonth: req.body.ppm,
//     pricePerDay: req.body.ppd,
//     isStepLastCompleted: true,
//   };
//   if (
//     !newUserData.isDropper ||
//     !newUserData.studyMode ||
//     !newUserData.exam ||
//     !newUserData.linkedin ||
//     !newUserData.youtube ||
//     !newUserData.about ||
//     !newUserData.desc ||
//     !newUserData.pricePerMonth ||
//     !newUserData.pricePerDay ||
//     !req.body.idCard
//   ) {
//     return next(
//       new ErrorHandler(
//         "All fields are compulsory. Kindly fill every fields",
//         400
//       )
//     );
//   }

//   try {
//     const myCloud = await cloudinary.v2.uploader.upload(req.body.idCard, {
//       folder: "idcard",
//       width: 400,
//       crop: "scale",
//     });

//     newUserData.idCard = {
//       public_ID: myCloud.public_id,
//       public_URI: myCloud.secure_url,
//     };
//   } catch (e) {
//   }
//   await Student.findByIdAndUpdate(req.user.id, newUserData, {
//     new: true,
//     runValidators: true,
//     useFindAndModify: false,
//   });

//   res.status(200).json({
//     success: true,
//   });
// });

// Get a single user
exports.getSingleUsers = errorCatcherAsync(async (req, res, next) => {
  const user = await Student.findById(req.params.id).select(
    "name exam avatar pricePerMonth pricePerDay collegeName branch yearOfStudy"
  );

  if (!user) {
    return next(new ErrorHandler(`Error 404`, 404));
  }

  res.status(200).json({
    success: true,
    user,
  });
});
// //  Get all Users

exports.getAllStudents = errorCatcherAsync(async (req, res, next) => {
  const users = await Student.find({
    role: "mentor",
    mentoringStatus: "active",
  }).select(
    "name exam avatar pricePerMonth pricePerDay collegeName branch yearOfStudy ratings createdAt"
  );
  res.status(200).json({
    success: true,
    users,
  });
});

// // update User role  (ADMIN)

// exports.updateRole = asyncErrorCatcher(async (req, res, next) => {
//   const user = await User.findById(req.params.id);
//   if (!user) {
//     return next(
//       new ErrorHandler(`User does not exsits with ID of ${req.params.id}`, 404)
//     );
//   }
//   if (req.user._id.toString() === req.params.id) {
//     return next(new ErrorHandler("You can't change your own role", 400));
//   }

//   if (user.email === process.env.PRCTRMAIL) {
//     const message = `A suspicious activity of changing your role has been done by user ${req.user.name} having ${req.user.email} and ${req.user.id} as email and ID respectivly`;
//     try {
//       await activityMail({
//         message,
//       });

//      return next(new ErrorHandler("Super Prevliged Admin can't be updated", 403));
//     } catch (e) {
//       return next(new ErrorHandler(e.message, 500));
//     }
//   }
//   if (user.role === "admin") {
//     if (req.user.email !== process.env.PRCTRMAIL)
//       return next(new ErrorHandler("You can't change an admin role", 400));
//   }

//   user.role = req.body.role;

//   await user.save();

//   res.status(200).json({
//     success: true,
//     message: `${user.name}'s Role has been changed to ${req.body.role}`,
//   });
// });

// // Deleting a user (ADMIN)

// exports.deleteUser = asyncErrorCatcher(async (req, res, next) => {
//   const user = await User.findById(req.params.id);
//   const userName = user.name;

//   if (!user) {
//     return next(
//       new ErrorHandler(`User does not exsits with ID of ${req.params.id}`, 404)
//     );
//   }

//   if ((user._id).toString() === (req.user._id).toString()) {
//     return next(
//       new ErrorHandler(`You cant delete yourself`, 400)
//     );
//   }

//   if (user.email === process.env.PRCTRMAIL) {
//     const message = `A suspicious activity of deleting your account has been done by user ${req.user.name} having ${req.user.email} and ${req.user.id} as email and ID respectivly`;
//     try {
//       await activityMail({
//         message,
//       });

//       return next(new ErrorHandler("Super Prevliged Admin can't be deleted", 403));
//     } catch (e) {
//       return next(new ErrorHandler(e.message, 500));
//     }
//   }
//   const imageId = user.avatar.public_ID;
//   await cloudinary.v2.uploader.destroy(imageId);
//   user.isActive = false;
//   user.idDeletedDate = new Date();
//   await user.save();

//   res.status(200).json({
//     sucess: true,
//     message: `${userName} removed successfully`,
//   });
// });
