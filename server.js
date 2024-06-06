const instance = require('./razorpayIns');
const app = require('./app')
const dotenv = require("dotenv");
const cloudinary = require("cloudinary"); 

const dbConnection = require("./utils/dbms.connection"); 

dotenv.config({ path: "config.env" });

dbConnection();

cloudinary.config({
    cloud_name: process.env.CLOUDINARY_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret:process.env.CLOUDINARY_API_SECRET
  });

  module.exports = instance;

const server = app.listen(process.env.PORT, () => {
  console.log(`Server is running on localhost:${process.env.PORT}`);
});

process.on("uncaughtException", (err) => {
    console.log(`Error  : ${err.message}`);
    console.log(`Shutting Down The server due to Uncaught Exception Error`);
  
    process.exit(1);
  });

process.on("unhandledRejection", (err) => {
  console.log(`Error : ${err.message}`);
  console.log(`Shutting Down The server due to Unhandled Promise Rejection`);

  server.close(() => {
    process.exit(1);
  });
});
 