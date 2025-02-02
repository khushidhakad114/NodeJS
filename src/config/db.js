const mongoose=require("mongoose")

const connectDb=async()=>{
  try{
    await mongoose.connectDb("mongodb+srv://22cs10kh128:go7EaDH7ekJnWnZJ@cluster0.7t7tf.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0")
    console.log("mongoDb connected");
  }catch(error){
    console.error(error.message)
  }
}

connectDb()
  .then(()=>console.log("connected"))
  .catch(()=>console.log(error.message))
module.exports=connectDb
