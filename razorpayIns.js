const Razorpay = require('razorpay');
const dotenv = require("dotenv");

dotenv.config({ path: "config.env" });

module.exports = new Razorpay({
    key_id: process.env.RAZORPAYID,
    key_secret:  process.env.RAZORPAYKEY,
});