import mongoose from "mongoose";

const FeedbackSchema = new mongoose.Schema({
    name: {
        type: "string",
        required: true,
    },
    text: {
        type: "string",
        required: true
    }
},{
    timestamps: true,
})

export default mongoose.model("Feedback", FeedbackSchema)