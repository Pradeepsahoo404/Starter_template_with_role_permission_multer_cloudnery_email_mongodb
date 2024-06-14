import mongoose from "mongoose";
const roleSchema = new mongoose.Schema({
    roleType : {
        type : String,
        require : true,
        unique : true,
    },
    description : {
        type : String,
        trim : true
    },
    permission : [{
        type : mongoose.Schema.Types.ObjectId,
        ref : "Permission"
    }]

} , {timestamps : true})

const Role = mongoose.model("Role" , roleSchema)
export default Role