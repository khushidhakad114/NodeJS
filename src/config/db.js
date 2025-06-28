const mongoose=require("mongoose")

const connectDb=async()=>{
  try{
    await mongoose.connect(process.env.MONGODB_URL)
    console.log("mongoDb connected");
  }catch(error){
    console.error(error.message)
  }
}

connectDb()
  .then(()=>console.log("connected"))
  .catch(()=>console.log(error.message))
  
module.exports=connectDb
