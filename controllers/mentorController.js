const ErrorHandler = require("../utils/errorHandeler");
const errorCatcherAsync = require("../utils/errorCatcherAsync");
const Mentor = require("../models/mentorModel");
const bcryptjs = require("bcryptjs");
const Student = require("../models/studentModel.js");
const OTPGenerate = require("../models/userVerficationOtp.js");
const Connection = require("../models/connectionModel.js");
const jwtToken = require("../utils/jwtToken");
const { resetPasswordMessage } = require("../utils/mailformat.js");
const { passwordchange } = require("../utils/passwordchange.js");
const crypto = require("crypto");
const cloudinary = require("cloudinary");
const sendMail = require("../utils/sendMail.js");
const otpSender = require("../utils/otpSender.js");
//Registering a USER

exports.registerMentor = errorCatcherAsync(async (req, res, next) => {
  const userCheck = await Student.findOne({ email: req.body.email });
  if (userCheck) {
    return next(new ErrorHandler("Email already exists", 400));
  }
  if (req.body.avatar) {
    const myCloud = await cloudinary.v2.uploader.upload(req.body.avatar, {
      folder: "avatars",
      width: 400,
      crop: "scale",
    });
    const { name, email, password, collegeName, mobileNumber } = req.body;
    const user = await Mentor.create({
      name,
      email,
      password,
      collegeName,
      mobileNumber,
      signedUpFor: "mentor",
      avatar: { public_ID: myCloud.public_id, public_URI: myCloud.secure_url },
    });
    jwtToken(user, 201, res);
  } else {
    const { name, email, password, collegeName, mobileNumber } = req.body;
    const user = await Mentor.create({
      name,
      email,
      password,
      collegeName,
      mobileNumber,
      signedUpFor: "mentor",
    });
    jwtToken(user, 201, res);
  }
});
// USER Login

exports.loginMentor = errorCatcherAsync(async (req, res, next) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return next(new ErrorHandler("Enter Your Email & Password", 400));
  }
  const user = await Mentor.findOne({ email }).select("+password");
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
  const user = await Mentor.findOne({ email: req.body.email });
  const stuUser = await Student.findOne({ email: req.body.email });

  if (!user || !user.isActive ) {
    if(!stuUser || !stuUser.isActive){
    return next(new ErrorHandler("User not found", 404));
    }
  }

  const otp = await generateOtp(user || stuUser);
  const message = resetPasswordMessage(user || stuUser, otp);
  try {
    await sendMail({
      email: user?.email || stuUser?.email,
      subject: "PrepSaarthi Password Recovery Support",
      message,
    });

    res.status(200).json({
      success: true,
      message: `An email for password recovery has been  sent to your registered email`,
      userId:user?._id || stuUser?._id
    });
  } catch (e) {
    return next(new ErrorHandler(e.message, 500));
  }
});

// //Reset Password

exports.resetPassord = errorCatcherAsync(async (req, res, next) => {
  const { otp, userId } = req.body;
  if (!otp) {
    return next(new ErrorHandler("Please enter the otp", 400));
  }

  const userOTPVerification = await OTPGenerate.find({ userId });

  if (userOTPVerification.length <= 0) {
    return next(
      new ErrorHandler(
        "Invalid Request"
      )
    );
  }
  const { expiresIn } = userOTPVerification[0];

  const hashedOTP = userOTPVerification[0].otp;

  if (expiresIn < Date.now()) {
    await OTPGenerate.deleteMany({ userId});
    return next(new ErrorHandler("Invalid OTP"));
  }

  const validOTP = await bcryptjs.compare(otp, hashedOTP);

  if (!validOTP) {
    return next(new ErrorHandler("Inavlid OTP. Please try again"));
  }


  if (req.body.password !== req.body.confirmPassword) {
    return next(new ErrorHandler("Both the password must match", 400));
  }
  const user = await Mentor.findOne({ _id: userId });
  const stuUser = await Student.findOne({ _id: userId});

  if(user){
    user.password = req.body.password;
  await user.save();
  } 
  if(stuUser){
    stuUser.password = req.body.password;
    await stuUser.save();
  }
  if(!user && !stuUser){
    return next(new ErrorHandler("No account exists", 404))
  }
  const message = passwordchange(user || stuUser);
try {
  await sendMail({
    email: user?.email || stuUser?.email,
    subject: "Your password has been changed",
    message,
    });
    
    await OTPGenerate.deleteMany({ userId});
    jwtToken(user || stuUser, 200, res);
} catch (e) {
  return next(new ErrorHandler(e.message, 500));
}
});

// // Get User Detail

exports.getMentorDetails = errorCatcherAsync(async (req, res, next) => {
  const user = await Mentor.findById(req.params.id);
  if (!user) {
    return next(new ErrorHandler("No Such Account Exists", 404));
  }
  if (!user.isActive) {
    return next(new ErrorHandler("No Such Account Exists", 404));
  }
  res.status(200).json({
    message: true,
    user: {
      name: user.name,
      id: user._id,
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
  const user = await Mentor.findById(req.user.id);
  if (!user.isActive) {
    return next(new ErrorHandler("No SUch Account Exists", 404));
  }
  res.status(200).json({
    message: true,
    user,
    userSigned: req.user._id,
  });
});

// // Update User password

exports.updatePassword = errorCatcherAsync(async (req, res, next) => {
  const user = await Mentor.findById(req.user.id).select("+password");

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

// //  update personal info

exports.updateProfile = errorCatcherAsync(async (req, res, next) => {
  const newUserData = {
    email: req.body.email,
    name: req.body.name,
    mobileNumber: req.body.number,
    collegeName: req.body.collegeName,
  };
  if (req.body.avatar && req.body.avatar !== " ") {
    const data = await Mentor.findById(req.user.id);
    const { avatar } = data;
    await cloudinary.v2.uploader.destroy(avatar.public_ID);

    const myCloud = await cloudinary.v2.uploader.upload(req.body.avatar, {
      folder: "avatars",
      width: 400,
      crop: "scale",
    });

    newUserData.avatar = {
      public_ID: myCloud.public_id,
      public_URI: myCloud.secure_url,
    };
  }
  await Mentor.findByIdAndUpdate(req.user.id, newUserData, {
    new: true,
    runValidators: true,
    useFindAndModify: false,
  });

  res.status(200).json({
    success: true,
  });
});
exports.updateMentoringStatus = errorCatcherAsync(async (req, res, next) => {
  const newUserData = {
    mentoringStatus: req.body.status,
  };
  await Mentor.findByIdAndUpdate(req.user.id, newUserData, {
    new: true,
    runValidators: true,
    useFindAndModify: false,
  });

  res.status(200).json({
    success: true,
  });
});

//Update mentor info

exports.updateMentorInfo = errorCatcherAsync(async (req, res, next) => {
  const newUserData = {
    isDropper: req.body.isDropper,
    studyMode: req.body.studyMode,
    branch: req.body.branch,
    exam: JSON.parse(req.body.exam),
    yearOfStudy: req.body.yearOfStudy,
    linkedin: req.body.linkedin,
    youtube: req.body.youtube,
    about: req.body.about,
    desc: req.body.disc,
    pricePerMonth: req.body.ppm,
    pricePerDay: req.body.ppd,
    isStepLastCompleted: true,
  };
  if (
    !newUserData.isDropper ||
    !newUserData.studyMode ||
    !newUserData.exam ||
    !newUserData.linkedin ||
    !newUserData.youtube ||
    !newUserData.about ||
    !newUserData.desc ||
    !newUserData.pricePerMonth ||
    !newUserData.pricePerDay ||
    !req.body.idCard
  ) {
    return next(
      new ErrorHandler(
        "All fields are compulsory. Kindly fill every fields",
        400
      )
    );
  }

  const myCloud = await cloudinary.v2.uploader.upload(req.body.idCard, {
    folder: "idcard",
    width: 400,
    crop: "scale",
  });

  newUserData.idCard = {
    public_ID: myCloud.public_id,
    public_URI: myCloud.secure_url,
  };

  await Mentor.findByIdAndUpdate(req.user.id, newUserData, {
    new: true,
    runValidators: true,
    useFindAndModify: false,
  });

  res.status(200).json({
    success: true,
  });
});

exports.updateMentorInfoAfter = errorCatcherAsync(async (req, res, next) => {
  const newUserData = {
    isDropper: req.body.isDropper,
    studyMode: req.body.studyMode,
    branch: req.body.branch,
    exam: JSON.parse(req.body.exam),
    yearOfStudy: req.body.yearOfStudy,
    linkedin: req.body.linkedin,
    youtube: req.body.youtube,
    about: req.body.about,
    desc: req.body.disc,
    pricePerMonth: req.body.ppm,
    pricePerDay: req.body.ppd,
    isStepLastCompleted: true,
  };
  const data = await Mentor.findById(req.user.id);
  const { idCard, pricePerDay, pricePerMonth } = data;

  if (req.body.idCard && req.body.idCard !== " ") {
    await cloudinary.v2.uploader.destroy(idCard.public_ID);

    const myCloud = await cloudinary.v2.uploader.upload(req.body.idCard, {
      folder: "idcard",
      width: 400,
      crop: "scale",
    });

    newUserData.idCard = {
      public_ID: myCloud.public_id,
      public_URI: myCloud.secure_url,
    };
    newUserData.updateRequest = "yes";
  }
  if (
    parseInt(pricePerDay) !== parseInt(req.body.ppd) ||
    parseInt(pricePerMonth) !== parseInt(req.body.ppm)
  ) {
    newUserData.updateRequest = "yes";
  }

  await Mentor.findByIdAndUpdate(req.user.id, newUserData, {
    new: true,
    runValidators: true,
    useFindAndModify: false,
  });

  res.status(200).json({
    success: true,
  });
});

// Get a single user
exports.getSingleUsers = errorCatcherAsync(async (req, res, next) => {
  const user = await Mentor.findById(req.params.id).select(
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

exports.getAllMentors = errorCatcherAsync(async (req, res, next) => {
  const users = await Mentor.find({
    role: "mentor",
    mentoringStatus: "active",
    isActive: true,
  }).select(
    "name exam avatar pricePerMonth pricePerDay collegeName branch yearOfStudy ratings createdAt"
  );
  res.status(200).json({
    success: true,
    users,
  });
});

//Get all students(admin)
exports.getAllStudents = errorCatcherAsync(async (req, res, next) => {
  const users = await Student.find({});
  res.status(200).json({
    success: true,
    users,
  });
});
//Get all mentors(admin)
exports.getAllMentorsAdmin = errorCatcherAsync(async (req, res, next) => {
  const users = await Mentor.find({ $or: [{ role: "mentor" }, { role: "user" }] });
  res.status(200).json({
    success: true,
    users,
  });
});

//Get all Admins(admin)
exports.getAllAdmin = errorCatcherAsync(async (req, res, next) => {
  const users = await Mentor.find({ role: "admin" });
  res.status(200).json({
    success: true,
    users,
    userSigned: req.user.id,
  });
});
// //  Get all request(admin)

exports.getAllMentorByStatus = errorCatcherAsync(async (req, res, next) => {
  const usersPending = await Mentor.find({
    isPending: "yes",
    isApproved: "no",
    isStepLastCompleted: true,
  });
  const userRejected = await Mentor.find({
    isPending: "no",
    isRejected: "yes",
    isStepLastCompleted: true,
  });
  const userApproved = await Mentor.find({
    isPending: "no",
    isApproved: "yes",
    isStepLastCompleted: true,
  });
  res.status(200).json({
    success: true,
    usersPending,
    userRejected,
    userApproved,
  });
});

// // update User role  (ADMIN)
exports.updateRole = errorCatcherAsync(async (req, res, next) => {
  const user = await Mentor.findById(req.params.id);
  if (!user) {
    return next(
      new ErrorHandler(`User does not exsits with ID of ${req.params.id}`, 404)
    );
  }
  if (req.user._id.toString() === req.params.id) {
    return next(new ErrorHandler("You can't change your own role", 400));
  }
  if (user.email === process.env.PRCTRMAIL) {
    const message = `A suspicious activity of changing your role has been done by user ${req.user.name} having ${req.user.email} and ${req.user.id} as email and ID respectivly`;
    try {
      await activityMail({
        message,
      });

      return next(
        new ErrorHandler("Super Prevliged Admin can't be updated", 403)
      );
    } catch (e) {
      return next(new ErrorHandler(e.message, 500));
    }
  }
  if (user.role === "admin") {
    if (req.user.email !== process.env.PRCTRMAIL)
      return next(new ErrorHandler("You can't change an admin role", 400));
  }

  user.role = req.body.role;
  if (req.body.role === "mentor") {
    user.isApproved = "yes";
    user.isPending = "no";
    user.isRejected = "no";
  }
  if (req.body.role === "user") {
    user.isApproved = "no";
    user.isPending = "no";
    user.isRejected = "yes";
  }
  await user.save();

  res.status(200).json({
    success: true,
    message: `${user.name} has been approved for ${req.body.role} role`,
  });
});

// // Deleting a user (ADMIN)

exports.deleteUser = errorCatcherAsync(async (req, res, next) => {
  const user =
    (await Mentor.findById(req.params.id)) ||
    (await Student.findById(req.params.id));
  const userName = user.name;

  if (!user) {
    return next(
      new ErrorHandler(`User does not exsits with ID of ${req.params.id}`, 404)
    );
  }

  if (user._id.toString() === req.user._id.toString()) {
    return next(new ErrorHandler(`You cant delete yourself`, 400));
  }

  if (user.email === process.env.PRCTRMAIL) {
    const message = `A suspicious activity of deleting your account has been done by user ${req.user.name} having ${req.user.email} and ${req.user.id} as email and ID respectivly`;
    try {
      await activityMail({
        message,
      });

      return next(
        new ErrorHandler("Super Prevliged Admin can't be deleted", 403)
      );
    } catch (e) {
      return next(new ErrorHandler(e.message, 500));
    }
  }
  const imageId = user.avatar.public_ID;
  if (imageId !== "profilimage") {
    await cloudinary.v2.uploader.destroy(imageId);
  }
  user.isActive = false;
  user.idDeletedDate = new Date();
  await user.save();

  res.status(200).json({
    sucess: true,
    message: `${userName} removed successfully`,
  });
});

//(admin) all connection
exports.allConnection = errorCatcherAsync(async (req, res, next) => {
  const connection = await Connection.find();

  const currentDate = new Date(Date.now()).getTime();
  connection.forEach(async (item, i) => {
    if (item.expiresIn.getTime() < currentDate) {
      item.isActive = false;
      item.isConnected = false;
      const stu = await Student.findById(item.studentDetails._id);
      stu.activeAssignedMentors = null;
      await stu.save({ validateBeforeSave: false });
      await item.save({ validateBeforeSave: false });
    }
  });
  const connectionUpdated = await Connection.find({})
    .populate("studentDetails", "name avatar")
    .populate("mentorDetails", "name avatar")
    .exec();

  res.status(200).json({
    success: true,
    connection: connectionUpdated,
  });
});
//(admin) interpert connection
exports.assignConnection = errorCatcherAsync(async (req, res, next) => {
  const connection = await Connection.findById(req.params.id);
  connection.isActive = true;
  connection.isConnected = true;
  await connection.save({ validateBeforeSave: false });
  res.status(200).json({
    success: true,
  });
});
//(admin) remove connection
exports.removeConnection = errorCatcherAsync(async (req, res, next) => {
  const connection = await Connection.findById(req.body.id);
  connection.isActive = false;
  connection.isConnected = false;
  const user = await Student.findById(req.body.sid);
  user.activeAssignedMentors = null;
  await user.save({ validateBeforeSave: false });
  await connection.save({ validateBeforeSave: false });
  res.status(200).json({
    success: true,
  });
});

exports.allMentorConnection = errorCatcherAsync(async (req, res, next) => {
  const connection = await Connection.find({ mentorDetails: req.user.id });

  // connection
  res.status(200).json({
    success: true,
    connection,
  });
});

exports.createMentorReview = errorCatcherAsync(async (req, res, next) => {
  const { rating, comment, mentorId } = req.body;

  const review = {
    user: req.user._id,
    name: req.user.name,
    rating: Number(rating),
    comment,
  };

  const mentor = await Mentor.findById(mentorId);

  const isReviewed = mentor.reviews.find(
    (rev) => rev.user.toString() === req.user._id.toString()
  );

  if (isReviewed) {
    mentor.reviews.forEach((rev) => {
      if (rev.user.toString() === req.user._id.toString())
        (rev.rating = rating), (rev.comment = comment);
    });
  } else {
    mentor.reviews.push(review);
    mentor.numOfReviews = mentor.reviews.length;
  }

  let avg = 0;

  mentor.reviews.forEach((rev) => {
    avg += rev.rating;
  });

  mentor.ratings = avg / mentor.reviews.length;

  await mentor.save({ validateBeforeSave: false });

  res.status(200).json({
    success: true,
  });
});

exports.deleteReview = errorCatcherAsync(async (req, res, next) => {
  if (req.query.userId.toString() !== req.user._id.toString()) {
    return next(new ErrorHandler("Action not allowed", 401));
  }
  const mentor = await Mentor.findById(req.query.mentorId);
  if (!mentor) {
    return next(new ErrorHandler("Mentor not found", 404));
  }
  const reviews = mentor.reviews.filter(
    (rev) => rev._id.toString() !== req.query.id.toString()
  );
  let avg = 0;

  reviews.forEach((rev) => {
    avg += rev.rating;
  });

  let ratings = 0;

  if (reviews.length === 0) {
    ratings = 0;
  } else {
    ratings = avg / reviews.length;
  }

  const numOfReviews = reviews.length;

  await Mentor.findByIdAndUpdate(
    req.query.mentorId,
    {
      reviews,
      ratings,
      numOfReviews,
    },
    {
      new: true,
      runValidators: true,
      useFindAndModify: false,
    }
  );

  res.status(200).json({
    success: true,
  });
});

exports.getMentorReviews = errorCatcherAsync(async (req, res, next) => {
  const mentor = await Mentor.findById(req.query.mentorId).populate({
    path: "reviews",
    populate: {
      path: "user",
      select: "avatar", // Specify the fields you want to retrieve
    },
  });

  if (!mentor) {
    return next(new ErrorHandler("Mentor not found", 404));
  }

  res.status(200).json({
    success: true,
    reviews: mentor.reviews,
  });
});

//Generate OTP
const generateOtp = async (user) => {
  const otp = `${Math.floor(10000 + Math.random() * 90000)}`;

  //Send Mail
  const saltRound = 10;

  const hashedOtp = await bcryptjs.hash(otp, saltRound);
  const otpExists = await OTPGenerate.findOne({ userId: user._id });

  if (!otpExists) {
    await OTPGenerate.create({
      userId: user._id,
      otp: hashedOtp,
      expiresIn: Date.now() + 10 * 60 * 1000,
    });
  } else {
    otpExists.otp = hashedOtp;
    otpExists.expiresIn = Date.now() + 10 * 60 * 1000;
    await otpExists.save();
  }
  return otp;
  
};

exports.verifyOTP = errorCatcherAsync(async (req, res, next) => {
  const { otp } = req.body;
  if (!otp) {
    return next(new ErrorHandler("Please enter the otp", 400));
  }

  const userOTPVerification = await OTPGenerate.find({ userId: req.user._id });

  if (userOTPVerification.length <= 0) {
    return next(
      new ErrorHandler(
        "Account doesn't exists or already verified.Please login or signup"
      )
    );
  }
  const { expiresIn } = userOTPVerification[0];

  const hashedOTP = userOTPVerification[0].otp;

  if (expiresIn < Date.now()) {
    await OTPGenerate.deleteMany({ userId: req.user._id });
    return next(new ErrorHandler("Invalid OTP"));
  }

  const validOTP = await bcryptjs.compare(otp, hashedOTP);

  if (!validOTP) {
    return next(new ErrorHandler("Inavlid OTP. Please try again"));
  }

  await Mentor.updateOne({ _id: req.user._id }, { verified: true });
  await Student.updateOne({ _id: req.user._id }, { verified: true });

  await OTPGenerate.deleteMany({ userId: req.user._id });

  res.status(200).json({
    status: "success",
    message: "User verified successfully",
    role: req.user.role,
    user: req.user._id,
  });
});

exports.resendOTP = errorCatcherAsync(async (req, res, next) => {
  const user = req.user;
  const otp = await generateOtp(user);
  try {
    await sendMail({
      email: user.email,
      subject: `Verification OTP ${otp}`,
      html: `<p>Your OTP is<p><p><strong>${otp}</strong></p>`,
    });
  } catch (e) {
    return next(new ErrorHandler(e.message, 500));
  }
  res.status(200).json({
    status: "success",
    message: "OTP resent successfully",
  });
});

exports.sendOTP = errorCatcherAsync(async (req, res, next) => {
  const user = req.user;
  const otp = await generateOtp(user);
  try {
    await sendMail({
      email: user.email,
      subject: `Verification OTP ${otp}`,
      html: `<p>Your OTP is<p><p><strong>${otp}</strong></p>`,
    });
  } catch (e) {
    return next(new ErrorHandler(e.message, 500));
  }
  res.status(200).json({
    status: "success",
    message: "OTP sent successfully",
  });
});
