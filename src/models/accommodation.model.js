import mongoose from "mongoose";

const accommodationSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true
    },
    description: {
        type: String
    },
    location: {
        type: String,
        required: true
    },
    price: {
        type: Number,
        required: true
    },
    availability: {
        type: Boolean,
        default: true
    },
    host: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    services: {
        type: [String]//Wi-Fi, TV, air conditioning, heating, kitchen, free parking, pool, gym, washer, dryer, and more.
    },
    photos: {
        type: [String]
    },
    type: {
        type: String
    },
    maxGuests: {
        type: Number
    },
    bedrooms: {
        type: Number
    },
    bathrooms: {
        type: Number
    }
}, { timestamps: true });

const Accommodation = mongoose.model("Accommodation", accommodationSchema);

export default Accommodation;
