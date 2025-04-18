const mongoose = require("mongoose");

const notificationSchema = new mongoose.Schema({

    
      chatId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Chat",
        required: true,
      },
    chatUnread:{
        type:Number,
        default:0
    },
    notificationUnseen:{
        type:Number,
        default:0
    },
    unseenFor:{
        type: mongoose.Schema.Types.ObjectId,
        required:true
    },
    senderName:{
        type:String,
    },
    senderContent:{
        type:String,
    },
    senderAvatar:{
        type:String
    },
    senderId:{
        type:String
    }
});

module.exports = mongoose.model("Notification", notificationSchema);

