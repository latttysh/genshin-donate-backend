import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import FeedbackSchema from "./Models/Feedback.js";
import StatsSchema from "./Models/Stats.js";
import crypto from "crypto";
import axios from "axios"
import UserModel from "./Models/User.js"
import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt';

const require = createRequire(import.meta.url);
const app = express();
import {createRequire} from 'module';


const https = require('https');
const nodemailer = require('nodemailer');
const fs = require('fs');
mongoose.connect('mongodb+srv://admin:admin@cluster0.8tvjeha.mongodb.net/?retryWrites=true&w=majority').then(() => console.log("connected")).catch(() => console.log("Error"))

const transporter = nodemailer.createTransport({
    port: 465,               // true for 465, false for other ports
    host: "smtp.yandex.ru",
    auth: {
        user: 'genshindonat.com@yandex.ru',
        pass: '123Root123',
    },
    secure: true,
});

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
            reaction: req.body.reaction,
            user: req.body.userId
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

app.post("/api/addStat/", async (req, res) => {
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
        const feedBacks = (await FeedbackSchema.find().populate("user").exec()).reverse()

        res.json(feedBacks)
    } catch (error) {
        console.log(error)
        res.status(500).json({
            message: "Не удалось добавить отзыв"
        })
    }
})

app.get("/api/getStats", async (req, res) => {
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

app.get("/api/getBalance", async (req, res) => {
    const api = "81e81e9681e06f238e641554c15c9d9d"
    let signature = crypto.createHmac("SHA256", "81e81e9681e06f238e641554c15c9d9d").update("4|20586").digest("hex")
    console.log(signature)
})

app.post("/api/createPayForm", async (req, res) => {
    try {
        console.log(req.body)
        let signature = crypto.createHash("MD5").update(`20586:${req.body.price}:D34QLz}pnz9=mR3:RUB:${req.body.name}`).digest("hex")
        console.log(signature)
        res.status(200).json({
            formPay: `https://pay.freekassa.ru/?m=${20586}&oa=${req.body.price}&currency=${"RUB"}&o=${req.body.name}&s=${signature}&us_login=${req.body.login}&us_password=${req.body.password}&us_contact=${req.body.contact}&us_ref=${req.body.referal}&us_price=${req.body.price}&us_count=${req.body.count}`
        })
    } catch (error) {

    }
})

app.get("/api/paydone", async (req, res) => {
    try {
        console.log(req.query)
        let message = `❤️‍🔥 Оплачен новый заказ!
            Наименование: ${req.query.MERCHANT_ORDER_ID}\n
            💸 Денюшек: ${req.query.AMOUNT}p. | Комиссия: ${req.query.commission}р.

            🧛♀️ Login: ${req.query.us_login}
            🔑 Password: ${req.query.us_password}
            📲 Связь: ${req.query.us_contact}

            👨👦 Пригласивший: ${req.query.us_ref}`
        console.log("SENDING")
        axios.post(`https://api.telegram.org/bot2061278459:AAHUbcu_npM2WdlcJcUFtMM6FDa69o1T65g/sendMessage`, {
            chat_id: "-521043965",
            text: message
        }).then(res => console.log(res.data)).catch(err => console.log(err))

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
        if (!req.query.MERCHANT_ORDER_ID.includes("луны")) {
            StatsSchema.findOneAndUpdate({
                    name: "Кристаллов купили"
                },
                {
                    $inc: {count: parseInt(req.query.us_count, 10)}
                },
                (err, doc) => {
                    if (err) {
                        console.log("Не получилось обновить количество купленных кристаллов")
                    }
                    console.log("Успешно обновили")
                }
            )
        } else {

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
            )
        }
        StatsSchema.findOneAndUpdate({
                name: "Денежный оборот"
            },
            {
                $inc: {count: parseInt(req.query.us_price.replace(" ", ""), 10)}
            },
            (err, doc) => {
                if (err) {
                    console.log("Не получилось обновить денежный оборот")
                }
                console.log("Успешно обновили")
            }
        )
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

app.post("/api/sendcode", async(req,res) => {
    const email = req.body.email
    const mailData={
        from: "genshindonat.com@yandex.ru",
        to: email,
        subject: "Регистрация аккаунта",
        text: "Вы получили это письмо при регистрации аккаунта",
        html: "<b>Ваш код для регистрации</b> <br>"+
                "<b>123123</b>"

    }
    await transporter.sendMail(mailData, (error, info)=>{
        if (error) {
            console.log(error);
            return res.status(500).json({
                message: "Произошла ошибка при отправке письма"
            })
        }
        res.status(200).json({
            message: "Сообщение отправлено"
        })
    })

})

app.post("/api/auth/registration", async (req, res) => {
    try {
        const password = req.body.password;
        const salt = await bcrypt.genSalt(10);
        const passwordHash = await bcrypt.hash(password, salt);
        const doc = new UserModel({
            nickname: req.body.nickname,
            email: req.body.email,
            passwordHash,
        });

        const user = await doc.save();
        const token = jwt.sign(
            {
                _id: user._id,
            },
            "gEnShIn",
            {
                expiresIn: "30d"
            },
        );
        res.json({...user._doc, token})
    } catch (error) {
        console.log(error)
        res.status(500).json({
            message: "Не удалось зарегестрироваться",
        })

    }
})

app.post("/api/auth/login", async (req, res) => {
    try {
        const user = await UserModel.findOne({"email": req.body.email})
        if (!user) {
            return res.status(404).json({
                message: "Пользователя не существует"
            })
        }

        const isValidPass = await bcrypt.compare(req.body.password, user._doc.passwordHash);
        if (!isValidPass) {
            return res.status(404).json({
                    message: "Пароль не верный"
                }
            )
        }
        const token = jwt.sign(
            {
                _id: user._id,
            },
            "gEnShIn",
            {
                expiresIn: "30d"
            }
        );
        res.json({...user._doc, token})
    } catch (error) {
        res.status(500).json("Не удалось авторизоваться")
    }
})


httpsServer.listen(4444, () => {
    console.log('HTTPS Server running on port 4444');
});
