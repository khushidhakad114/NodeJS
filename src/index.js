const express = require("express");
const app = express();
const connectDB = require("./config/db");
const userRouter = require("./routes/userRoutes");

app.use((req, res, next) => {
  console.log("Time:", Date.now());
  next();
});

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use("/api", userRouter);

app.listen(8000, () => {
  console.log("Server is running on port 8000");
});
