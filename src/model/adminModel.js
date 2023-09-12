const mongoose = require("mongoose")

const adminSchema = new mongoose.Schema(
    {
        emailId: {
            type: String,
            required: true,
            unique: true
        },
          password: {
            type: String,
            required: true
        },
    },
    { timestamps: true }
)

module.exports = mongoose.model("admin",adminSchema)