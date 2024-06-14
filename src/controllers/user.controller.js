import { asyncHandler } from "../utils/asyncHandler.js";
import User from "../models/user.model.js"
import jwt from "jsonwebtoken"
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js";

const generateAccessTokenAndRefreshToken = async(userId) => {
    try{
        const user = await User.findById(userId)
        const accessToken = await user.generateAccessToken()
        const refreshToken =  await user.generateRefreshToken()
  
        user.refreshToken = refreshToken
    await user.save({ValidateBeforeSave : false})

    return {
        accessToken,
        refreshToken
    }

    }catch(error){
        throw new ApiError(500, 'Failed to create token', error)
    }
}


export const registerUser = asyncHandler(async (req, res) => {
    const { userName, email, legalName, mobile, emergencyContact, password, role } = req.body;
console.log(req.body)
    // Check if any required fields are empty
    if ([userName, email, legalName, mobile, emergencyContact, password, role].some(field => !field || field.trim() === "")) {
        throw new ApiError(400, "All fields are required");
    }

    // Check if user with same userName or email already exists
    const existUser = await User.findOne({ $or: [{ userName }, { email }] });
    if (existUser) {
        throw new ApiError(409, "User with email or userName already exists");
    }

    // Upload profile picture to Cloudinary
    const profilePicture = req.files?.profilePicture[0]?.path;
    if (!profilePicture) {
        throw new ApiError(400, "Profile Picture is required");
    }
    const profileImage = await uploadOnCloudinary(profilePicture);
    if (!profileImage) {
        throw new ApiError(400, "Failed to upload profile Picture");
    }

    // Initialize coverImage variable
    let coverImage = "";

    // Upload cover image to Cloudinary if it exists in req.files
    if (req.files && Array.isArray(req.files.coverImage) && req.files.coverImage.length > 0) {
        const coverImageLocalPath = req.files.coverImage[0].path;
        const uploadedCoverImage = await uploadOnCloudinary(coverImageLocalPath);
        if (uploadedCoverImage) {
            coverImage = uploadedCoverImage.url;
        } else {
            throw new ApiError(400, "Failed to upload cover Image");
        }
    }

    // Create user in database
    const userData = await User.create({
        userName: userName.toLowerCase(),
        email,
        legalName,
        mobile,
        emergencyContact,
        password,
        role,
        profilePicture: profileImage.url,
        coverImage,
    });

    // Fetch created user data (excluding sensitive fields)
    const createdUser = await User.findById(userData._id).populate('role').select("-password -refreshToken");
    if (!createdUser) {
        throw new ApiError(500, "Failed to register user");
    }

    // Return success response
    return res.status(201).json(
        new ApiResponse(201, createdUser, "User registered successfully")
    );
});


export const loginUser = asyncHandler(async (req , res) => {

    const {userName , email , password} = req.body;
    if (!(userName || email)) {
        throw new ApiError(400 , "username or email is required")
    }

    const existUser = await User.findOne({
        $or : [{userName},{email}]
    })

    if(!existUser){
        throw new ApiError(404 , "User does not exist")
    }

   const isPasswordCorrect =  await existUser.isPasswordCorrect(password)

   if(!isPasswordCorrect){
    throw new ApiError(401 , "Invalid passwod")
   }

    const {accessToken , refreshToken} = await generateAccessTokenAndRefreshToken(existUser._id);

    const loggedUser = await User.findById(existUser._id).populate('role').select("-password -refreshToken")

    const options = {
        httpOnly : true,
        secure : true
    }

    return res
    .status(200)
    .cookie("accessToken" , accessToken , options)
    .cookie("refreshToken" ,refreshToken , options)
    .json(
        new ApiResponse(200, {user :loggedUser , refreshToken, accessToken} ,"user logged is successfully")
    )

})

export const logoutUser = asyncHandler( async(req ,res) => {
    await User.findByIdAndUpdate(req.user._id , {$set : {refreshToken : undefined}} , {new : true})

    const options = {
        httpOnly : true,
        secure : true
    }
    
    return res.status(200).clearCookie(req.cookies.accessToken , options).clearCookie(req.cookies.refreshToken ,options)
    .json(
        new ApiResponse(200 , {} , "user logged out successfully")
    )
})

export const refreshAccessToken = asyncHandler( async (req , res) => {
    const incomingRefeshToken = req.cookies.refreshToken || req.body.refreshToken;

    if (!incomingRefeshToken) {
        throw new ApiError(403 , 'No token provided')
    }

    try {
        const decodedToken =jwt.verify(incomingRefeshToken , process.env.REFRESH_TOKEN_SECRET);
    
        const user = await User.findById(decodedToken._id)
        if (!user) {
            throw new ApiError(403 , 'Invalid refresh token')
        }
        
        if(incomingRefeshToken !== user?.refreshToken){
            throw new ApiError(401 , "Refresh token is used or expired")
        }
    
        const options = {
            httpOnly : true,
            secure : true
        }
    
        const {accessToken , refreshToken} = await generateAccessTokenAndRefreshToken(user._id)

        return res.status(200)
        .cookie("accessToken" , accessToken , options)
        .cookie("refreshToken" ,refreshToken , options)
        .json(
            new ApiResponse(200 ,{accessToken ,refreshToken : refreshToken} , "AccessToken refreshed"
        ))
    
    } catch (error) {
        throw new ApiError(401 , error?.message || "Invalid refresh token")
    }
})

export const changeCurrentPassword = asyncHandler(async (req , res)=> {
    const {oldPassword , newPassword , confirmPassword} = req.body;

    if(!(newPassword === confirmPassword)){
        throw new ApiError(400 ,"New password and Confirm Password are not the same");
    }

    const user = await User.findById(req.user?._id)
    const isPasswordCorrect = await user.isPasswordCorrect(oldPassword)
    if(!isPasswordCorrect) {
        throw new ApiError(400 , "Old password is incorrect");
    }

    user.password = newPassword
    await user.save({ValidateBeforeSave : false})

    return res.status(200).json(
        new ApiResponse(200 , {} ,"Password has been changed successfully")
    )
})

export const updateAccountDetail = asyncHandler(async (req ,res)=>{
    const userDetail = await User.findByIdAndUpdate(req.user?._id , req.body , {new : true}).select(["-password", "-refreshToken"]);

    return res.status(200).json(
        new ApiResponse(200 , userDetail , "user updated successfully")
    )
})

export const updateProfilePicture = asyncHandler(async (req , res) => {
    const profileImageLocalPath = req.file?.path;
    if(!profileImageLocalPath){
        throw new ApiError(400 , "Image Field cannot be empty")
    }

    const profilePicture = await uploadOnCloudinary(profileImageLocalPath)
    if(!profilePicture.url){
        throw new ApiError(500 , "Something went wrong while image uploading");
    }

    const userDetail = await User.findByIdAndUpdate(req.user?._id , {$set : {profilePicture : profilePicture.url}} , {new : true}).select("-password")
    return res.status(200).json(
        new ApiResponse(200 , userDetail , "user updated successfully")
    )
})

export const updateCoverImage = asyncHandler( async (req , res) => {
    const coverImage = req.file?.path;
    
    if(!coverImage){
        throw new ApiError(400 , "cover Image field cannot be empty");
    }

    const coverImageUrl =  await uploadOnCloudinary(coverImage);

    if(!coverImageUrl.url){
        throw new ApiError(400 ,"Something went wrong while image uploading");
    }

    const userDetail = await User.findByIdAndUpdate(req.user?._id , {$set : {coverImage : coverImageUrl.url}} , {new : true}).select("-password")

    return res.status(200).json(
        new ApiResponse(200 , userDetail , "user updated successfully")
    )
})


export const forgetPassword = asyncHandler(async (req, res) => {
    const { email, password, re_typePassword } = req.body;

    if (!email) {
        throw new ApiError(400, "Email is required.");
    }

    const existUser = await User.findOne({ email });

    if (!existUser) {
        throw new ApiError(404, "Email is not registered.");
    }

    if (password !== re_typePassword) {
        throw new ApiError(400, "New password and re-type password do not match.");
    }

    // Set the new password
    existUser.password = password;
    await existUser.save({ validateBeforeSave: false });

    return res.status(200).json(
        new ApiResponse(200, {}, "Password updated successfully.")
    );
});
