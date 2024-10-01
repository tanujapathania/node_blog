const mongoose = require("mongoose");

// Define ChatMessage Schema
const verificationSchema = new mongoose.Schema({
    receiver: {
        type: String,
        required: true,
    },
    token: {
        type: String,
        required: true,
    },
    tokenExpires: {
        type: String,
        required: true,
    },
    timestamp: {
        type: Date,
        default: Date.now,
    },
});

// Create ChatMessage model
const EmailVerification = mongoose.model(
    "EmailVerification",
    verificationSchema
);

module.exports = EmailVerification;
