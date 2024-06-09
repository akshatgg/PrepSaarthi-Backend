const express = require("express");
const app = express();
const mentorRoute = require("./routes/metorRoute");
const studentRoute = require("./routes/studentRoute");
const counter = require("./routes/counter.js");
const paymentRoute = require("./routes/paymentRoute");
const bodyParser = require("body-parser");
const fileUpload = require("express-fileupload");
const errorCatcher = require("./utils/errorCatcher");
const cookieParser = require("cookie-parser");
const cors = require("cors");

const allowedOrigin = [process.env.ALLOWEDORIGIN1,process.env.ALLOWEDORIGIN2]; 
app.use(   cors({
    credentials: true,
  origin: allowedOrigin,
}));
app.use(cookieParser());

app.use((req, res, next) => {
  res.header("Access-Control-Allow-Credentials", "true");
  next();
});
app.use(express.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(fileUpload());
// Route Import

app.use("/v1", counter);
app.use("/v1", mentorRoute);
app.use("/v1", studentRoute);
app.use("/v1", paymentRoute);
app.use(errorCatcher);

module.exports = app;
