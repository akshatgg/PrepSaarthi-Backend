const Counter = require("../models/counterModel.js");
const errorCatcherAsync = require("../utils/errorCatcherAsync");
const ErrorHandler = require("../utils/errorHandeler.js");

exports.updateCount = errorCatcherAsync(async (req, res, next) => {
  try {
    const { type, ref } = req.body;
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
    const currLen = counter.visits.length;
    if (type === "visit") {
      if (currLen !== 0 && counter.visits[currLen - 1].date === dateIST) {
        if (ref === "yt") {
          counter.visits[currLen - 1].countsVisitYT += 1;
        } else if (ref === "lin") {
          counter.visits[currLen - 1].countsVisitLin += 1;
        } else if (ref === "insta") {
          counter.visits[currLen - 1].countsVisitInsta += 1;
        } else if (ref === "mail") {
          counter.visits[currLen - 1].countsVisitMail += 1;
        } else {
          counter.visits[currLen - 1].countsVisit += 1;
        }
      } else if (
        currLen === 0 ||
        counter.visits[currLen - 1].date !== dateIST
      ) {
        let newCount;
        if (ref === "yt") {
          newCount = {
            countsVisitYT: 1,
            date: dateIST,
          };
        } else if (ref === "lin") {
          newCount = {
            countsVisitLin: 1,
            date: dateIST,
          };
        } else if (ref === "insta") {
          newCount = {
            countsVisitInsta: 1,
            date: dateIST,
          };
        } else if (ref === "mail") {
          newCount = {
            countsVisitMail: 1,
            date: dateIST,
          };
        } else {
          newCount = {
            countsVisit: 1,
            date: dateIST,
          };
        }
        counter.visits.push(newCount);
      }
    } else if (type === "pageview") {
      if (currLen !== 0 && counter.visits[currLen - 1].date === dateIST) {
        counter.visits[currLen - 1].countsView += 1;
      } else if (
        currLen === 0 ||
        counter.visits[currLen - 1].date !== dateIST
      ) {
        newCount = {
          countsView: 1,
          date: dateIST,
        };

        counter.visits.push(newCount);
      }
    }
    await counter.save();
    res.json({
      message: "updated",
    });
  } catch (error) {
    next(new ErrorHandler("Error updating counts", 500));
  }
});
exports.getCount = errorCatcherAsync(async (req, res, next) => {
  try {
    let counter = await Counter.findOne();
    // if(req.user.role !== 'admin'){
    //   return res.status(401).json({
    //     message:'Not Found'
    //   })
    // }
    let maxMonth = "1990-01-01";
    let minMonth = "2100-01-01";
    if (!counter) {
      counter = new Counter();
    }

    function convertToSortableDate(dateStr) {
      const [day, month, year] = dateStr.split("/");
      return `${year}-${month}-${day}`;
    }
    function convertToNormalDate(dateStr) {
      const [year, month, day] = dateStr.split("-");
      return `${day}/${month}/${year}`;
    }

    const startDate = convertToSortableDate(req.query.startDate);
    const endDate = convertToSortableDate(req.query.endDate);
    const giveRange = (array, startDate, endDate) => {
      const filteredVisits = array.filter((visit) => {
        const visitDate = convertToSortableDate(visit.date);
        if (minMonth > visitDate) {
          minMonth = visitDate;
        }
        if (maxMonth < visitDate) {
          maxMonth = visitDate;
        }
        return visitDate >= startDate && visitDate <= endDate;
      });
      return filteredVisits;
    };

    const visits = giveRange(counter.visits, startDate, endDate);

    res.json({
      visits,
      maxMonth: convertToNormalDate(maxMonth),
      minMonth: convertToNormalDate(minMonth),
    });
  } catch (error) {
    next(new ErrorHandler(error, 500));
  }
});
