const express = require("express");
const app = express();
const mentorRoute = require("./routes/metorRoute");
const studentRoute = require("./routes/studentRoute");
const paymentRoute = require("./routes/paymentRoute");
const bodyParser = require("body-parser");
const fileUpload = require("express-fileupload");
const errorCatcher = require("./utils/errorCatcher");
const cookieParser = require("cookie-parser");
const cors = require("cors");

const allowedOrigin = "http://192.168.1.1"; // Allow requests from this origin

const corsOptions = {
    origin: (origin, callback) => {
      // Allow requests with no origin (like mobile apps or curl requests)
      if (!origin) return callback(null, true);
      // Allow all origins
      return callback(null, true);
    },
    credentials: true, // Allow credentials
  };
app.use(cors(corsOptions));
app.use(cookieParser());

app.use((req, res, next) => {
  res.header("Access-Control-Allow-Credentials", "true");
  next();
});
app.use(express.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(fileUpload());
// Route Import

app.use("/v1", mentorRoute);
app.use("/v1", studentRoute);
app.use("/v1", paymentRoute);
app.use(errorCatcher);

module.exports = app;
