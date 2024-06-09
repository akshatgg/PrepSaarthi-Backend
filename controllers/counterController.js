const Counter = require('../models/counterModel.js');
const errorCatcherAsync = require("../utils/errorCatcherAsync");
const ErrorHandler = require("../utils/errorHandeler.js");

exports.updateCount = errorCatcherAsync(async (req, res, next) => {
  try {
    const { type } = req.body;

    let counter = await Counter.findOne(); 

    if (!counter) {
      counter = new Counter();
    }

    if (type === 'visit') {
      counter.visits += 1;
    } else if (type === 'pageview') {
      counter.views += 1;
    }

    await counter.save();
    res.json({ visits: counter.visits, views: counter.views });
  } catch (error) {
    next(new ErrorHandler('Error updating counts', 500));
  }
});
