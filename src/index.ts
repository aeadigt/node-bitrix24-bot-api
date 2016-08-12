import {B24Bot} from "./B24Bot";
import * as express from "express";
import * as bodyParser from "body-parser";
import * as log4js from "log4js";
import * as fs from "fs";

let logger = log4js.getLogger();
let settings = {
    "CODE":  "", // example "chatBotName"
    "TYPE": "B",
    "EVENT_MESSAGE_ADD": "",
    "EVENT_WELCOME_MESSAGE": "",
    "EVENT_BOT_DELETE": "",
    "PROPERTIES": {
        "NAME": "", // example "chatBotName"
        "LAST_NAME": "",
        "COLOR": "", // example AQUA
        "EMAIL": "", // example "no@mail.com"
        "PERSONAL_BIRTHDAY": "", // example "2016-03-23"
        "WORK_POSITION": "", // example "chatBotWORK_POSITION"
        "PERSONAL_WWW": "",
        "PERSONAL_GENDER": "", // example M
        "PERSONAL_PHOTO": "" // url image Example:
    }
};
let clientId = ""; // Bitrix24 client_id
let clientSecret = ""; // Bitrix24 client_secret

// Создание экземпляра прокси чат бот 
let b24Bot: B24Bot = new B24Bot(clientId, clientSecret, settings);

// Добавленяем прослушку событий
b24Bot.on("install", function (req: any) {
    logger.trace("Install: " + req.body.event + "\n");
});
b24Bot.on("join", function (req: any) {
    logger.trace("join: " + req.body.event + "\n");
});
b24Bot.on("message", function (req: any) {
    logger.trace("message: " + req.body.event + "\n");
    let msg = "Ответ чат бота на сообщение: " + req.body["data"]["PARAMS"]["MESSAGE"];
    b24Bot.sendMessage(msg, req);
});
b24Bot.on("delete", function (req: any) {
    logger.trace("delete: " + req.body.event + "\n");
});
b24Bot.on("update", function (req: any) {
    logger.trace("update: " + req.body.event + "\n");
});
b24Bot.on("command", function (req: any) {
    logger.trace("command: " + req.body.event + "\n");
});

function queryHandler(req: any, res: any) {
    b24Bot.onBitrix24(req);
}

// https server
let port_ssl = 8000;
let options = {
    key: fs.readFileSync(""),
    cert: fs.readFileSync("")
};

let app_ssl = express.createServer(options);
app_ssl.use( bodyParser() );
app_ssl.all("/", function (req: any, res: any) {
    logger.trace("HTTPS request");
    queryHandler(req, res);
});
app_ssl.listen(port_ssl);

// http server
let port = 8080;
let app = express.createServer();
app.use( bodyParser() );
app.all("/", function (req: any, res: any) {
    logger.trace("HTTP request");
    queryHandler(req, res);
});
app.listen(port);