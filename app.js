const { createServer } = require("http");
const { Server } = require("socket.io");
const express = require("express");
const app = express();
const server = createServer(app);
const cors = require("cors");
const cookieParser = require("cookie-parser");
const bodyParser = require("body-parser"); 

const allowedOrigin = [
  process.env.ALLOWEDORIGIN1 || "http://localhost:3000",  // fallback
  process.env.ALLOWEDORIGIN2 || "http://194.238.17.200:5050"
];

// ✅ 1. Configure CORS early and properly
app.use(
  cors({
    credentials: true,
    origin: [

      "https://newf.prepsaarthi.com",
      "http://194.238.17.200:5050",
    ],
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
  })
);

// ✅ 2. Set this explicitly to allow sending cookies
app.use((req, res, next) => {
  res.header("Access-Control-Allow-Credentials", "true");
  res.header("Access-Control-Allow-Origin", req.headers.origin); // important
  next();
});

// ✅ 3. Middleware setup
app.use(cookieParser());
app.use(express.json());
app.use(bodyParser.urlencoded({ extended: true }));

// ✅ 4. Routes
const mentorRoute = require("./routes/metorRoute");
const studentRoute = require("./routes/studentRoute");
const counter = require("./routes/counter.js");
const paymentRoute = require("./routes/paymentRoute");
const errorCatcher = require("./utils/errorCatcher");

app.get('/v1/health', (req, res) => {
  res.status(200).json({ message: 'Backend is connected!' });
});

app.use("/v1", counter);
app.use("/v1", mentorRoute);
app.use("/v1", studentRoute);
app.use("/v1", paymentRoute);

// 👇 Socket.IO setup
const io = new Server(server, {
  cors: {
    origin: [
      "https://newf.prepsaarthi.com",
      "http://194.238.17.200:5050",
    ],
    credentials: true,
    methods: ["GET", "POST"],
  },
});

const { chatService } = require("./chatService/chatController.js");
const connectedUsers = new Map();
const onlineUsers = new Map();
const openedChat = new Map();

io.on("connection", (socket) => {
  chatService({ io, socket, openedChat, connectedUsers, onlineUsers });
});

app.use(errorCatcher);

module.exports = server;
