const express=require('express');
require("./config/db");
const app=express();

app.get('/', (req, res)=>{
  res.send("Welcome! to my homepage");
})

app.get('/about', (req,res)=>{
  res.json({
    name: "Khushbu Chacholiya",
    age: "21",
    mobile: "8962610173",
  })
})

app.listen(8000,()=>{
  console.log("server is running on port 8000");
})