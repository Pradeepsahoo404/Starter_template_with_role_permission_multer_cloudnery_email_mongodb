import mongoose from "mongoose";
import { DB_NAME } from "../constant.js"

export const connectDB = async()=>{
    try{
        const connectionIntense =  await  mongoose.connect(`${process.env.MONGODB_URI}${DB_NAME}`)
        console.log(`MongoDB Connected...!! DB HOST : ${connectionIntense.connection.host}`);  
    }catch(err){
        console.log("MONGODB connection Failed" ,err)
        process.exit(1);
    }
}