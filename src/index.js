const express = require("express");
const connectDB = require("./src/config/db");
const app = express();

app.get("/", (req, res) => {
  res.send("Hello World");
});
app.get("/about", (req, res) => {
  res.json({
    name: "John Doe",
    age: 30,
  });
});
app.listen(8000, () => {
  console.log("Server is running on port 8000");
});
