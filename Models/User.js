import mongoose from "mongoose";

const UserSchema = new mongoose.Schema(
    {
        nickname:{
            type: String,
            required: true,
        },
        email: {
            type: String,
            required: false,
        },
        passwordHash: {
            type: String,
            required: true
        },
        purchases: {
            type: Number,
            required: true
        },
        tgId: {
            type: String,
            required: false
        }
    }, {
        timestamps: true
    }
)

export default mongoose.model("User", UserSchema)