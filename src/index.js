const express = require("express");
const http = require("http");
const cors = require("cors");
const cookieParser = require("cookie-parser");
const { Server } = require("socket.io");
const connectDB = require("./config/db");
const userRouter = require("./routes/userRoutes");
const connectionRouter = require("./routes/connectionRoutes");

const app = express();
const server = http.createServer(app); // Wrap Express in HTTP server

const io = new Server(server, {
  cors: {
    origin: "http://localhost:3000",
    credentials: true,
  },
});

// In-memory store for userId => socketId mapping
const users = new Map();

// Socket.IO connection handling
io.on("connection", (socket) => {
  console.log("Socket connected:", socket.id);

  // Register a user
  socket.on("register", (userId) => {
    users.set(userId, socket.id);
    console.log(`User ${userId} registered with socket ${socket.id}`);
  });

  // Handle sending private messages
  socket.on("send_message", ({ to, from, message }) => {
    const recipientSocket = users.get(to);
    if (recipientSocket) {
      io.to(recipientSocket).emit("receive_message", {
        from,
        message,
        timestamp: new Date().toISOString(),
      });
    }
  });

  // On disconnect
  socket.on("disconnect", () => {
    console.log("Socket disconnected:", socket.id);
    for (let [userId, sockId] of users.entries()) {
      if (sockId === socket.id) {
        users.delete(userId);
        break;
      }
    }
  });
});

// Middleware and Routes
app.use(cookieParser());
app.use(
  cors({
    origin: "http://localhost:3000",
    credentials: true,
  })
);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Your routes
app.use("/api", userRouter);
app.use("/api", connectionRouter);

// Connect to DB
connectDB();

// Start server
server.listen(8000, () => {
  console.log("Server is running on port 8000");
});
