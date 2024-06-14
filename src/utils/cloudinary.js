import {v2 as cloudinary} from "cloudinary"
import fs from "fs";

cloudinary.config({ 
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME, 
    api_key: process.env.CLOUDINARY_API_KEY, 
    api_secret: process.env.CLOUDINARY_API_KEY_SECRET, 
  });

export const uploadOnCloudinary = async(localFilePath) => {
    try{
        if(!localFilePath){
            return null
            }
            
            const response = await cloudinary.uploader.upload(localFilePath , {
                resource_type : "auto"
                })
          
console.log(response , "response")
        // fs.unlink(localFilePath)
        
        return response

    }catch(err){
        fs.unlink(localFilePath)
        return null
    }
}