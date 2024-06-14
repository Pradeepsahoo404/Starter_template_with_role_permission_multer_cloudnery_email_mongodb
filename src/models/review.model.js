import mongoose from "mongoose";

const reviewSchema = new mongoose.Schema({
    accommodation: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Accommodation',
        required: true
    },
    guest: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    rating: {
        type: Number,
        min: 1,
        max: 5,
        required: true
    },
    comment:{
        type : String,
    }
}, { timestamps: true });

const Review = mongoose.model("Review", reviewSchema);

export default Review;
