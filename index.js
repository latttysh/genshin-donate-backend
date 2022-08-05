import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import FeedbackSchema from "./Models/Feedback.js";
import StatsSchema from "./Models/Stats.js";
import crypto from "crypto";
import axios from "axios"

const require = createRequire(import.meta.url);
const app = express();
import { createRequire } from 'module';


const https = require('https');
const fs = require('fs');
mongoose.connect('mongodb+srv://admin:admin@cluster0.8tvjeha.mongodb.net/?retryWrites=true&w=majority').then(() => console.log("connected")).catch(() => console.log("Error"))


const httpsServer = https.createServer({
    key: fs.readFileSync('./privkey.pem'),
    cert: fs.readFileSync('./cert.pem'),
}, app);

app.use(express.json())
app.use(cors())

app.post("/api/addFeedback", async (req, res) => {
    try {
        const doc = new FeedbackSchema({
            name: req.body.name,
            text: req.body.text,
            reaction: req.body.reaction
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
        const feedBacks = (await FeedbackSchema.find().exec()).reverse()

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
        StatsSchema.findOneAndUpdate({
                name: "Посещений"
            },
            {
                $inc: {count: 1}
            },
            (err, doc) => {
                if (err) {
                    console.log("Не получилось обновить количество купленных кристаллов")
                }
                console.log("Успешно обновили")
            }
        )
       res.json(stats)
    } catch (error) {
        console.log(error)
        res.status(500).json({
            message: "Не удалось получить статистику"
        })
    }
})

app.get("/api/getBalance" , async(req,res) => {
    const api = "81e81e9681e06f238e641554c15c9d9d"
    let signature = crypto.createHmac("SHA256","81e81e9681e06f238e641554c15c9d9d").update("4|20586").digest("hex")
    console.log(signature)
})

app.post("/api/createPayForm", async (req,res) => {
    try {
        console.log(req.body)
        let signature = crypto.createHash("MD5").update(`20586:${req.body.price}:D34QLz}pnz9=mR3:RUB:${req.body.name}`).digest("hex")
        console.log(signature)
        res.status(200).json({
            formPay: `https://pay.freekassa.ru/?m=${20586}&oa=${req.body.price}&currency=${"RUB"}&o=${req.body.name}&s=${signature}&us_login=${req.body.login}&us_password=${req.body.password}&us_contact=${req.body.contact}&us_ref=${req.body.referal}&us_price=${req.body.price}&us_count=${req.body.count}`
        })
    }catch (error) {

    }
})

app.get("/api/paydone", async (req,res) => {
    try {
        console.log(req.query)
        StatsSchema.findOneAndUpdate({
                name: "Покупки"
            },
            {
                $inc: {count: 1}
            },
            (err, doc) => {
                if (err) {
                    console.log("Не получилось обновить количество покупок")
                }
                console.log("Успешно обновили")
            }
        )
	if (!req.query.MERCHANT_ORDER_ID.includes("луны")){
        StatsSchema.findOneAndUpdate({
                name: "Кристаллов купили"
            },
            {
                $inc: {count: parseInt(req.query.us_count,10)}
            },
            (err, doc) => {
                if (err) {
                    console.log("Не получилось обновить количество купленных кристаллов")
                }
                console.log("Успешно обновили")
            }
        )} else {

	StatsSchema.findOneAndUpdate({
                name: "Лун купили"
            },
            {
                $inc: {count: 1}
            },
            (err, doc) => {
                if (err) {
                    console.log("Не получилось обновить количество купленных кристаллов")
                }
                console.log("Успешно обновили")
            }
        )}
        StatsSchema.findOneAndUpdate({
                name: "Денежный оборот"
            },
            {
                $inc: {count: parseInt(req.query.us_price.replace(" ",""),10)}
            },
            (err, doc) => {
                if (err) {
                    console.log("Не получилось обновить денежный оборот")
                }
                console.log("Успешно обновили")
            }
        )
        let message = `❤️‍🔥 Оплачен новый заказ! 
            Наименование: ${req.query.MERCHANT_ORDER_ID}\n
            💸 Денюшек: ${req.query.AMOUNT}p. | Комиссия: ${req.query.commission}р.

            🧛‍♀️ Login: ${req.query.us_login}
            🔑 Password: ${req.query.us_password}
            📲 Связь: ${req.query.us_contact}

            👨‍👦 Пригласивший: ${req.query.us_ref}`
        console.log("SENDING")
        axios.post(`https://api.telegram.org/bot2061278459:AAHUbcu_npM2WdlcJcUFtMM6FDa69o1T65g/sendMessage`,{chat_id: "-521043965", text:message}).then(res => console.log(res.data)).catch(err => console.log(err))
        return res.status(200).json({
            message: "Данные об оплате успешно получены"
        })
    } catch (error) {
        console.log()
        return res.status(500).json({
            message: "Не получилось получить данные об оплате"
        })
    }
})


httpsServer.listen(4444, () => {
    console.log('HTTPS Server running on port 4444');
});
