"use strict";
const B24Bot_1 = require("./B24Bot");
const express = require("express");
const bodyParser = require("body-parser");
const log4js = require("log4js");
const fs = require("fs");
let logger = log4js.getLogger();
let settings = {
    "CODE": "chatBotName",
    "TYPE": "B",
    "EVENT_MESSAGE_ADD": "",
    "EVENT_WELCOME_MESSAGE": "",
    "EVENT_BOT_DELETE": "",
    "PROPERTIES": {
        "NAME": "chatBotName",
        "LAST_NAME": "",
        "COLOR": "AQUA",
        "EMAIL": "no@mail.com",
        "PERSONAL_BIRTHDAY": "2016-03-23",
        "WORK_POSITION": "chatBotWORK_POSITION",
        "PERSONAL_WWW": "",
        "PERSONAL_GENDER": "M",
        "PERSONAL_PHOTO": "http://static.giantbomb.com/uploads/scale_small/9/95666/1881017-pichu5.gif" // url image
    }
};
let clientId = "app.578f89ae6468b7.99154423"; // client_id Bitrix24
let clientSecret = "P1iTJcKvhIew6D1796D13nwwKapRd6n58T47HWjLdIkRylofdV"; // client_secret Bitrix24
// Создание экземпляра прокси чат бот 
let b24Bot = new B24Bot_1.B24Bot(clientId, clientSecret, settings);
// Добавленяем прослушку событий
b24Bot.on("install", function (req) {
    logger.trace("Install: " + req.body.event + "\n");
});
b24Bot.on("join", function (req) {
    logger.trace("join: " + req.body.event + "\n");
});
b24Bot.on("message", function (req) {
    logger.trace("message: " + req.body.event + "\n");
    let msg = "Ответ чат бота на сообщение: " + req.body["data"]["PARAMS"]["MESSAGE"];
    b24Bot.sendMessage(msg, req);
});
b24Bot.on("delete", function (req) {
    logger.trace("delete: " + req.body.event + "\n");
});
b24Bot.on("update", function (req) {
    logger.trace("update: " + req.body.event + "\n");
});
b24Bot.on("command", function (req) {
    logger.trace("command: " + req.body.event + "\n");
});
function queryHandler(req, res) {
    b24Bot.onBitrix24(req);
}
// https server
let port_ssl = 8443;
let options = {
    key: fs.readFileSync("/opt/www/ssl/private_key.pem"),
    cert: fs.readFileSync("/opt/www/ssl/kloudone.pem")
};
let app_ssl = express.createServer(options);
app_ssl.use(bodyParser());
app_ssl.all("/", function (req, res) {
    logger.trace("HTTPS request");
    queryHandler(req, res);
});
app_ssl.listen(port_ssl);
// http server
let port = 8000;
let app = express.createServer();
app.use(bodyParser());
app.all("/", function (req, res) {
    logger.trace("HTTP request");
    queryHandler(req, res);
});
app.listen(port);
