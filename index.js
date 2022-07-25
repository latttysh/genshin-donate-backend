import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import FeedbackSchema from "./Models/Feedback.js";

const app = express();

mongoose.connect("mongodb://localhost:27017/").then(() => console.log("connected")).catch(() => console.log("Error"))

app.use(express.json())
app.use(cors())


app.post("/hello", async (req, res) => {
    res.status(200).json({
        message: "Hi du de"
    })
})

app.post("/api/addFeedback", async (req, res) => {
    try {
        const doc = new FeedbackSchema({
            name: req.body.name,
            text: req.body.text
        })
        const post = await doc.save();
        res.json(post)
    } catch (error) {
        console.log(error)
        res.status(500).json({
            message: "Не удалось добавить отзыв"
        })
    }
})

app.get("/api/getFeedbacks", async (req,res) => {
    try {

    } catch (error) {

    }
})

app.listen(4444, (err) => {
    if (err) {
        return console.log("Error", err)
    } else {
        return console.log("We started")
    }
})