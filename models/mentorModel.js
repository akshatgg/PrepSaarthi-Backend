const mongoose = require("mongoose");
const validate = require("validator");
const bcryptjs = require("bcryptjs");
const jwt = require("jsonwebtoken");
const crypto = require("crypto");
const { type } = require("os");
const mentorSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, "Please Enter Your Name"],
    maxLength: [50, "Length of your name should be less than 50 characters"],
    minLength: [3, "Length of your name should be more than 3 characters"],
  },

  verified:{
    type:Boolean,
    default:false,
    required:true,
  },
  numVerified:{
    type:Boolean,
    default:false,
    required:true,
  },
  
  email: {
    type: String,
    required: [true, "Please enter your email"],
    unique: true,
    validate: [validate.isEmail, "Please enter a valid email"],
  },

  collegeName : {
    type:String,
    require:[true, "Please tell us your college name"]
   },
   
  signedUpFor : {
    type:String,
    default:"user"
   },
  isStepLastCompleted : {
    type:Boolean,
    default:false
   },
   
  mobileNumber: {
    type: String,
    required: [true, "Please enter your mobile number"],
    minLength: [5, "Enter a valid mobile number"],
    maxLength: [10, "Enter a valid mobile number"],
  },

  password: {
    type: String,
    required: [true, "Please Enter Your password"],
    minLength: [8, "Password must have atleast 8 characters"],
    select: false,
  },
  avatar: {
    public_ID: {
      type: String,
      required:[true, "Please specify your public_id"],
      default:"profilimage"
    },
    public_URI: {
      type: String,
      required:[true, "Please specify your public_uri"],
      default:"/images/profile.png"
    },
  },
  coverImg: {
    public_ID: {
      type: String,
      required:[true, "Please specify your public_id"],
      default:"collegePhoto"
    },
    public_URI: {
      type: String,
      required:[true, "Please specify your public_uri"],
      default:"/images/cover.jpg"
    },
  },
  popUp:{
    type:Boolean,
  },
  updateRequest:{
    type:String,
    default:'no'
  },
  yearOfStudy: {
    type: Number,
  },
  branch: {
    type: String,
    
  },
  linkedin: {
    type: String,
    
  },
  
  about: {
    type: String,
    
  },
  
  desc: {
    type: String,
    
  },
  isPending:{
    type:String,
    default:'yes'
  },
  isRejected:{
    type:String,
    default:'no'
  },
  isApproved:{
    type:String,
    default:'no'
  },
  youtube: {
    type: String,
    
  },
  
  isDropper: {
    type: String,
    
  },
  studyMode: {
    type: String,
    
  },  
  userAssigned: {
    type: Array,
    default: [],
  },
  
  
  
  exam: {
    name: {
      type: String,
    },
    rank: {
      type: Number,
    }
  },
  idCard: {
    public_ID: {
      type: String,
    },
    public_URI: {
      type: String,
    },
  },
  idCardOld: {
   type:String
  },

  college: {
    public_ID: {
      type: String,
    },
    public_URI: {
      type: String,
    },
  },

  ratings: {
    type: Number,
    default: 0,
  },

  numOfReviews: {
    type: Number,
    default: 0,
  },
  reviews: [
    {
      user: {
        type: mongoose.Schema.ObjectId,
        ref: "Student",
        required: true,
      },
      name: {
        type: String,
        required: true,
      },
      rating: {
        type: Number,
        required: true,
      },
      comment: {
        type: String,
        required: true,
      },
    },
  ],
  
  mentoringStatus:{
   type: String,
   default:"inactive"
  },

  pricePerMonth: {
    type: Number,
    maxLength: [5, "Price cannot exceed 5 characters"],
  },
  pricePerDay: {
    type: Number,
    maxLength: [5, "Price cannot exceed 5 characters"],
  },
  pricePerMonthOld: {
    type: Number,
    maxLength: [5, "Price cannot exceed 5 characters"],
  },
  pricePerDayOld: {
    type: Number,
    maxLength: [5, "Price cannot exceed 5 characters"],
  },
  totalActiveMentee:{
    type:Number,
    default:0
  },
  role: {
    type: String,
    default: "user",
  },

  isHeadMentor:{
    type:Boolean,
    default:false
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  isActive:{
    type:Boolean,
    default:true
  },
  idDeletedDate:{
    type:Date,
  },
  resetPasswordToken: String,
  resetPasswordExpire: Date,
});

mentorSchema.pre("save", async function (next) {
  if (!this.isModified("password")) {
    next();
  }
  this.password = await bcryptjs.hash(this.password, 11);
});

mentorSchema.methods.getJWTToken = function () {
  return jwt.sign({ id: this._id }, process.env.JWT_SEC, {
    expiresIn: process.env.JWT_EXP,
  });
};

mentorSchema.methods.verifyPassword = async function (enteredPassword) {
  return await bcryptjs.compare(enteredPassword, this.password);
};

mentorSchema.methods.generateResetPasswordToken = function () {
  const resetToken = crypto.randomBytes(20).toString("hex");

  this.resetPasswordToken = crypto
    .createHash("sha256")
    .update(resetToken)
    .digest("hex");
  this.resetPasswordExpire = Date.now() + 10 * 60 * 1000;

  return resetToken;
};
module.exports = mongoose.model("Mentor", mentorSchema);

