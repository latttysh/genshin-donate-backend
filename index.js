import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import FeedbackSchema from "./Models/Feedback.js";
import StatsSchema from "./Models/Stats.js";
import crypto from "crypto";
import axios from "axios"

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

app.get("/api/getBalance" , async(req,res) => {
    let ip = req.connection.remoteAddress
    console.log(ip)
    const api = "81e81e9681e06f238e641554c15c9d9d"
    let signature = crypto.createHmac("SHA256","81e81e9681e06f238e641554c15c9d9d").update("4|20586").digest("hex")
    console.log(signature)
})

app.get("/api/createPayForm", async (req,res) => {
    try {
        let data = Object.entries(req.body)
        let values = []
        data.sort().map((item,i) =>{
            values.push(item[1])
        })
        let str = values.join("|")
        console.log(str)
        let signature = crypto.createHmac("SHA256", "81e81e9681e06f238e641554c15c9d9d").update(str).digest("hex")
        axios.post("https://api.freekassa.ru/v1/orders/create",
            {
                shopId: req.body.shopId,
                nonce: req.body.nonce,
                i: req.body.i,
                email: req.body.email,
                ip: req.body.ip,
                currency: req.body.currency,
                amount: req.body.amount,
                signature: signature
            }).then(answer => {
                res.status(200).json(answer.data)
        }).catch(error => {
            console.log(error)
            res.status(500).json({
                message: "Произошла ошибка при создании формы оплаты"
            })
        })
    } catch (error){
        console.log(error)
        res.status(500).json({
            message: "Произошла ошибка при создании формы оплаты"
        })
    }
})

app.get("/api/paydone", async (req,res) => {
    try {
        console.log(req.body)
        res.status(200).json({
            message: "Данные об оплате успешно получены"
        })
    } catch (error) {
        res.status(500).json({
            message: "Не получилось получить данные об оплате"
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