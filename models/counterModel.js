const mongoose = require("mongoose");

const counterSchema = new mongoose.Schema({
  visits: {
    counts: { type: Number, default: 0 },
    date:{ type:Array}
  },
  views: {
    counts: { type: Number, default: 0 },
    date:{ type:Array}
  },
});

module.exports = mongoose.model("Counter", counterSchema);
