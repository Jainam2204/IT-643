const express = require("express");
const cors = require("cors");
const cookieParser = require("cookie-parser");
const authRoutes = require("./routes/auth");
const userRoutes = require("./routes/user");
const suggestionsRoute = require("./routes/connect");
const meetingRoutes = require("./routes/meeting");
const chatRoutes = require('./routes/chat');
const subscriptionRoutes = require('./routes/subscription');
const reportRoutes = require('./routes/report');

const app = express();

app.use(
  cors({
    origin: "http://localhost:5173",
    credentials: true,              
  })
);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use("/uploads", express.static("uploads"));

app.get("/", (req, res) => res.send("API is Running"));

app.use("/auth", authRoutes);
app.use("/user", userRoutes);
app.use("/connect", suggestionsRoute);
app.use("/meetings", meetingRoutes);
app.use('/chat', chatRoutes);
app.use('/subscription', subscriptionRoutes);
app.use('/report', reportRoutes);

module.exports = app;