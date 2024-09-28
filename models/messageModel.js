const mongoose = require('mongoose')

const messageSchema = new mongoose.Schema({
    senderId:{
        type:mongoose.Schema.Types.ObjectId,
        required:true
    },
    reciverId:{
        type:mongoose.Schema.Types.ObjectId,
        required:true
    },
    content:{
        type:String,
        required:true
    },
    timeStamp:{
        type:Date,
        default:Date.now,
        required:true
    },
    deliveredAt:{
        type:Date,
    },
    seenAt:{
        type:Date,
    },
    delivered:{
        type:Boolean,
        default:false
    },
    seen:{
        type:Boolean,
        default:false
    },
    chatId:{
        type:mongoose.Schema.Types.ObjectId,
        required:true
    },
    reply:{
        type:String
    }
})

module.exports = mongoose.model("Message", messageSchema);
