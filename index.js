import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import FeedbackSchema from "./Models/Feedback.js";
import StatsSchema from "./Models/Stats.js";

const app = express();

mongoose.connect("mongodb://localhost:27017/").then(() => console.log("connected")).catch(() => console.log("Error"))

app.use(express.json())
app.use(cors())

app.post("/api/addFeedback", async (req, res) => {
    try {
        const doc = new FeedbackSchema({
            name: req.body.name,
            text: req.body.text
        })
        const post = await doc.save();
        res.json(post)
        StatsSchema.findOneAndUpdate({
                name: "Отзывы"
            },
            {
                $inc: {count: 1}
            },
            (err, doc) => {
                if (err) {
                    console.log("Не получилось обновить количество отзывов")
                }
                console.log("Успешно обновили")
            }
        )
    } catch (error) {
        console.log(error)
        res.status(500).json({
            message: "Не удалось добавить отзыв"
        })
    }
})

app.post("/api/addStat/" , async (req,res) => {
    try {
        const doc = new StatsSchema({
            name: req.body.name,
            count: req.body.count
        })
        const post = await doc.save()
        res.json(post)
    } catch (error) {
        console.log(error)
        res.status(500).json({
            message: "Не удалось добавить новый раздел статистики"
        })

    }
})

app.get("/api/getFeedbacks", async (req, res) => {
    try {
        const feedBacks = await FeedbackSchema.find().exec()
        res.json(feedBacks)
    } catch (error) {
        console.log(error)
        res.status(500).json({
            message: "Не удалось добавить отзыв"
        })
    }
})

app.get("/api/getStats", async(req,res) => {
    try {
       const stats = await StatsSchema.find().exec()
       res.json(stats)
    } catch (error) {
        console.log(error)
        res.status(500).json({
            message: "Не удалось получить статистику"
        })
    }
})

app.listen(4444, (err) => {
    if (err) {
        return console.log("Error", err)
    } else {
        return console.log("We started")
    }
})