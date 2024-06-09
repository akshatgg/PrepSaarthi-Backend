const mongoose = require("mongoose");

const counterSchema = new mongoose.Schema({
  visits: {
    type: Number,
    default:0
},
views: {
    type: Number,
    default:0
  }
});

module.exports = mongoose.model("Counter", counterSchema);
