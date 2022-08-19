import mongoose from "mongoose";

const UserSchema = new mongoose.Schema(
    {
        nickname:{
            type: String,
            required: true,
        },
        email: {
            type: String,
            required: true,
        },
        passwordHash: {
            type: String,
            required: true
        },
        purchases: {
            type: Number,
            required: true
        }
    }, {
        timestamps: true
    }
)

export default mongoose.model("User", UserSchema)