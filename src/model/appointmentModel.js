const mongoose = require("mongoose")

const appointmentSchema = new mongoose.Schema(
    {
        fullName: {
            type: String,
            require: true,
        },
        emailId: {
            type: String,
            required: true,
        },
        phoneNo: {
            type: String,
            require: true,
        },
        PurposeOfTheMeeting: {
            type: String,
            require: true,
        },
        DateAndTime: {
            type: Date,
            require: true
        }
    },
    { timestamps: true }
)

module.exports = mongoose.model("appointment",appointmentSchema);