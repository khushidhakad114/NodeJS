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

const io = new Server(server, {
  cors: {
    origin: "http://localhost:3000",
    credentials: true,
  },
});

app.use((req, res, next) => {
  req.io = io;
  next();
});

// Middleware
app.use(cookieParser());

app.use(
  cors({
    origin: "http://localhost:3000",
    credentials: true,
  })
);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
app.use("/api", userRouter);
app.use("/api", connectionRouter);
app.use("/api", chatRouter);
app.use("/api", messageRouter);

// Socket.IO logic
const onlineUsers = new Map();

io.on("connection", (socket) => {
  console.log("New socket connected:", socket.id);

  socket.on("setup", (userData) => {
    socket.join(userData._id);

    onlineUsers.set(userData._id, socket.id);

    socket.broadcast.emit("user online", userData._id);

    socket.emit("connected");

    console.log(`User joined: ${userData.firstName}`);
  });

  socket.on("typing", (room) => {
    socket.in(room).emit("typing", room);
  });

  socket.on("stop typing", (room) => {
    socket.in(room).emit("stop typing", room);
  });

  socket.on("join chat", (roomId) => {
    socket.join(roomId);

    console.log(`Joined chat room: ${roomId}`);
  });

  socket.on("new message", (message) => {
    const chat = message.chat;

    if (!chat?.users) return;

    chat.users.forEach((user) => {
      if (user._id === message.sender._id) return;

      socket
        .to(user._id)
        .emit("message received", message);
    });
  });

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

// Start server
const PORT = process.env.PORT || 8000;

server.listen(PORT, () => {
  console.log(`Server with Socket.IO running on port ${PORT}`);
});