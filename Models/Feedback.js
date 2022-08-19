import mongoose from "mongoose";

const FeedbackSchema = new mongoose.Schema({
    name: {
        type: "string",
        required: true,
    },
    reaction: {
        type: "number",
        required: true
    },
    text: {
        type: "string",
        required: true
    },
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true
    }
},{
    timestamps: true,
})

export default mongoose.model("Feedback", FeedbackSchema)