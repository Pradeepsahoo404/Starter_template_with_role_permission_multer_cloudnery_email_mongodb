import mongoose, { modelNames } from "mongoose";
const permissionSchema = new mongoose.Schema({
    permissionType : {
        type : String,
        require : true,
        unique : true,
    },
    description : {
        type : String,
        trim : true
    },
    adminId : {
        type : mongoose.Schema.Types.ObjectId,
        ref : "User"
    }

} , {timestamps : true})

const Permission = mongoose.model("Permission" , permissionSchema)
export default Permission