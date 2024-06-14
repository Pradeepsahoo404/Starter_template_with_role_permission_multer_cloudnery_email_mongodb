import mongoose from "mongoose";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";

// Define a sub-schema for Address
const addressSchema = new mongoose.Schema({
    line1: {
        type: String,
        default : "",
    },
    line2: {
        type: String,
        default : "",
    },
    landmark: {
        type: String,
        default : "",
    },
    city: {
        type: String,
        required: true
    },
    state: {
        type: String,
        required: true
    },
    postalCode: {
        type: Number,
        required: true
    },
    country: {
        type: String,
        required: true
    }
});

// Define the user schema
const userSchema = new mongoose.Schema({
    userName : {
        type : String,
        required: true,
        unique : true,
        lowercase : true,
        trim : true,
        index : true,
    },
    email : {
        type : String,
        required: [true , "email is required"],
        unique : true,
        lowercase : true,
        trim : true,
        validate : {
            validator : function(v){
                return /^\S+@\S+\.\S+$/.test(v);
            },
            message : props => `${props.value} is not a valid email address`
        }
    },
    legalName : {
        type : String,
        required: true,
        trim : true,
        index : true,
    },
    mobile: {
        type: Number,
        required: [true , "number is required"],
        validate : {
            validator : function(v){
                return /^\d{10}$/.test(v);
            },
            message: props => `${props.value} is not a valid mobile number! Must be 10 digits.`
        }
    },
    emergencyContact: {
        type: Number,
        required: [true , " emergency number is required"],
        validate : {
            validator : function(v){
                return /^\d{10}$/.test(v);
            },
            message: props => `${props.value} is not a valid emergency contact number! Must be 10 digits.`
        }
    },
    profilePicture: {
        type: String,
    },
    coverImage : {
        type : String
    },
    panCard: {
        type: String,
    },
    AddharCard: {
        type: String,
    },
    address: [addressSchema], // Embed the address sub-schema as an array
    password: {
        type: String,
        required: [true, 'Password is required'],
        minlength: [8, 'Password must be at least 8 characters long'],
        validate: {
            validator: function(v) {
                return /^(?=.*[!@#$%^&*(),.?":{}|<>]).{8,}$/.test(v);
            },
            message: props => 'Password must be at least 8 characters long and contain at least one special character'
        }
    },
    refreshToken : {
        type : String,
    },
    role : {
        type : mongoose.Schema.Types.ObjectId,
        ref : "Role"
    }
}, { timestamps: true });

userSchema.pre("save" , async function(next){
    if(this.isModified("password")){
        this.password = await bcrypt.hash(this.password , 10)
    }
    else 
    return next();
})

userSchema.methods.isPasswordCorrect = async function(password){
    return await bcrypt.compare(password , this.password)
}

userSchema.methods.generateAccessToken = async function(){
    return jwt.sign({
        _id : this._id,
        email : this.email,
        userName : this.userName,
        legalName :this.legalName,
        role : this.role
    },
    process.env.ACCESS_TOKEN_SECRET,
    {expiresIn : process.env.ACCESS_TOKEN_EXPIRY}
    )
}

userSchema.methods.generateRefreshToken = function(){
    return jwt.sign(
        {
            _id : this._id,
        },
        process.env.REFRESH_TOKEN_SECRET,
        {
            expiresIn : process.env.REFRESH_TOKEN_EXPIRY
        }
    )
}

const User = mongoose.model("User", userSchema);

export default User;
