const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const cors = require("cors");
const cookieParser = require("cookie-parser");
const dotenv = require("dotenv");
const dns = require("dns");

dns.setDefaultResultOrder("ipv4first");
dns.setServers(["8.8.8.8", "1.1.1.1"]);

dotenv.config();

const connectDb = require("./config/db");

connectDb()
  .then(() => {
    console.log("Database connection established");
  })
  .catch((error) => {
    console.error("Database connection failed:", error.message);
  });

const userRouter = require("./routes/userRouters");
const connectionRouter = require("./routes/connectionRoute");
const chatRouter = require("./routes/chatRoute");
const messageRouter = require("./routes/messageRoute");

const app = express();
const server = http.createServer(app);

// ===============================
// Environment Variables
// ===============================

const PORT = process.env.PORT || 8000;
const FRONTEND_URL = process.env.FRONTEND_URL;

console.log("Frontend URL:", FRONTEND_URL);

// ===============================
// Socket.IO
// ===============================

const io = new Server(server, {
  cors: {
    origin: FRONTEND_URL,
    credentials: true,
  },
});

// Make Socket.IO available inside routes
app.use((req, res, next) => {
  req.io = io;
  next();
});

// ===============================
// Middleware
// ===============================

app.use(cookieParser());

app.use(
  cors({
    origin: FRONTEND_URL,
    credentials: true,
  })
);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ===============================
// Routes
// ===============================

app.use("/api", userRouter);
app.use("/api", connectionRouter);
app.use("/api", chatRouter);
app.use("/api", messageRouter);

// ===============================
// Socket.IO Logic
// ===============================

const onlineUsers = new Map();

io.on("connection", (socket) => {
  console.log("New socket connected:", socket.id);

  // ===============================
  // Setup User
  // ===============================

  socket.on("setup", (userData) => {
    if (!userData?._id) return;

    socket.join(userData._id);

    onlineUsers.set(userData._id, socket.id);

    socket.broadcast.emit("user online", userData._id);

    socket.emit("connected");

    console.log(`User joined: ${userData.firstName}`);
  });

  // ===============================
  // Typing
  // ===============================

  socket.on("typing", (room) => {
    socket.in(room).emit("typing", room);
  });

  socket.on("stop typing", (room) => {
    socket.in(room).emit("stop typing", room);
  });

  // ===============================
  // Join Chat
  // ===============================

  socket.on("join chat", (roomId) => {
    if (!roomId) return;

    socket.join(roomId);

    console.log(`Joined chat room: ${roomId}`);
  });

  // ===============================
  // New Message
  // ===============================

  socket.on("new message", (message) => {
    const chat = message?.chat;

    if (!chat?.users) return;

    chat.users.forEach((user) => {
      if (user._id === message.sender._id) return;

      socket
        .to(user._id)
        .emit("message received", message);
    });
  });

  // ===============================
  // Disconnect
  // ===============================

  socket.on("disconnect", () => {
    for (const [userId, socketId] of onlineUsers.entries()) {
      if (socketId === socket.id) {
        onlineUsers.delete(userId);

        socket.broadcast.emit("user offline", userId);

        break;
      }
    }

    console.log("Socket disconnected:", socket.id);
  });
});

// ===============================
// Start Server
// ===============================

server.listen(PORT, () => {
  console.log(`Server Socket.IO running on port ${PORT}`);
});