const express=require('express');
const userRouter = require('./routes/userRouters');
var cookieParser = require('cookie-parser')
require("./config/db");
const app=express();
const cors=require("cors");
const connectionRouter = require('./routes/connectionRoute');
const chatRouter = require('./routes/chatRoute');
const messageRouter = require('./routes/messageRoute');


app.use(cookieParser());
app.use(
  cors({
    credentials: true,
    origin: "http://localhost:3000",
  })
);
// middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));


// Api Routes
app.use("/api", userRouter);
app.use("/api",connectionRouter )
app.use("/api", chatRouter)
app.use("/api", messageRouter)
app.listen(8000,()=>{
  console.log("server is running on port 8000");
})