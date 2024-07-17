const Counter = require("../models/counterModel.js");
const errorCatcherAsync = require("../utils/errorCatcherAsync");
const ErrorHandler = require("../utils/errorHandeler.js");

exports.updateCount = errorCatcherAsync(async (req, res, next) => {
  try {
    const { type } = req.body;

    let counter = await Counter.findOne();
    if (!counter) {
      counter = new Counter();
    }
    
    const date = new Date();
    const options = {
      timeZone: "Asia/Kolkata",
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    };
    const dateIST = new Intl.DateTimeFormat("en-GB", options).format(date);
    
    if (type === "visit") {
      counter.visits.counts += 1;
      if (dateIST !== counter.visits.date[counter.visits.date.length - 1]) {
        counter.visits.date.push(dateIST);
      }
    } else if (type === "pageview") {
      counter.views.counts += 1;
      const dateIST = new Intl.DateTimeFormat("en-GB", options).format(date);
      if (dateIST !== counter.views.date[counter.views.date.length - 1]) {
        counter.views.date.push(dateIST);
      }
    }
    await counter.save();
    res.json({
      visits: { count: counter.visits.counts, date: counter.visits.date },
      views: { count: counter.views.counts, date: counter.visits.date },
    });
  } catch (error) {
    next(new ErrorHandler("Error updating counts", 500));
  }
});
