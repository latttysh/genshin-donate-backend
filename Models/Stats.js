import mongoose from "mongoose";

const StatsSchema = new mongoose.Schema({
    name: {
        type: "string",
        required: true,
    },
    count: {
        type: "number",
        required: true
    }
},{
    timestamps: true,
})

export default mongoose.model("Stats", StatsSchema)