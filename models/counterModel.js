const mongoose = require("mongoose");

const counterSchema = new mongoose.Schema({
  visits:[ {
    countsVisit: { type: Number, default: 0 },
    countsVisitYT: { type: Number, default: 0 },
    countsVisitLin: { type: Number, default: 0 },
    countsVisitInsta: { type: Number, default: 0 },
    countsVisitMail: { type: Number, default: 0 },
    countsView: { type: Number, default: 0 },
    date:{ type:String},
    _id:false
  }]
});

module.exports = mongoose.model("Counter", counterSchema);
