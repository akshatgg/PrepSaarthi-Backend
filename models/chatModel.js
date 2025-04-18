const mongoose = require("mongoose");

const chatSchema = new mongoose.Schema({

    
      studentId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Student",
        required: true,
      },
      mentorId:{
        type: mongoose.Schema.Types.ObjectId,
        ref: "Mentor",
        required: true,
    },
 
    chatLeft:{
        type:Number,
        default:500
    },
    isSubscribed:{
      type:Boolean,
      default:false
    }

});

module.exports = mongoose.model("Chat", chatSchema);

