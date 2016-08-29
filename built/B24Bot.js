"use strict";
const events_1 = require("events");
const request = require("request");
const log4js = require("log4js");
const node_base64_image_1 = require("node-base64-image");
let logger = log4js.getLogger();
// Прокси приложений bitrix24 
class B24Bot extends events_1.EventEmitter {
    constructor(clientId, clientSecret, settings) {
        super();
        this.url = "";
        let self = this;
        node_base64_image_1.encode(settings.PROPERTIES.PERSONAL_PHOTO, { string: true, local: false }, function (err, data) {
            if (err) {
                logger.error("err: ", err);
            }
            self.clientId = clientId;
            self.clientSecret = clientSecret;
            settings.PROPERTIES.PERSONAL_PHOTO = data || "";
            self.settings = settings;
            logger.trace("Create B24Bot");
        });
    }
    // Обработчик команд Bitrix24
    onBitrix24(req) {
        if (("headers" in req) && ("host" in req.headers) && ("path" in req) && ("protocol" in req)) {
            this.url = req.protocol + "://" + req.headers.host + req.path;
            this.settings["EVENT_MESSAGE_ADD"] = this.url;
            this.settings["EVENT_WELCOME_MESSAGE"] = this.url;
            this.settings["EVENT_BOT_DELETE"] = this.url;
            if ("code" in req.query) {
                this.onOAuth(req);
            }
        }
        if (("body" in req) && ("event" in req.body)) {
            switch (req.body["event"]) {
                case "ONAPPINSTALL":
                    this.onAppInstall(req);
                    this.emit("install", req);
                    break;
                case "ONIMBOTJOINCHAT":
                    this.onImbotJoinChat(req);
                    this.emit("join", req);
                    break;
                case "ONIMBOTMESSAGEADD":
                    this.onImbotMessageAdd(req);
                    this.emit("message", req);
                    break;
                case "ONIMBOTDELETE":
                    this.onImbotDelete(req);
                    this.emit("delete", req);
                    break;
                case "ONAPPUPDATE":
                    this.onAppUpdate(req);
                    this.emit("update", req);
                    break;
                case "ONIMCOMMANDADD":
                    this.onImCommandAdd(req);
                    this.emit("command", req);
                    break;
                default:
                    logger.trace("default: " + req.body["event"]);
                    break;
            }
        }
    }
    // Отправить команду Bitrix24
    sendCommand(method, params, auth) {
        let queryUrl = "https://" + auth["domain"] + "/rest/" + method;
        params["access_token"] = auth["access_token"];
        request.post(queryUrl, { form: params }, function (err, res, data) {
            if (err) {
                return logger.error("Request err: ", err);
            }
            logger.trace(data);
        });
    }
    // Отправить сообщение Bitrix24
    sendMessage(msg, req) {
        let answer = {
            "DIALOG_ID": req.body["data"]["PARAMS"]["DIALOG_ID"],
            "MESSAGE": msg
        };
        this.sendCommand("imbot.message.add", answer, req.body["auth"]);
    }
    // На установку приложения
    onAppInstall(req) {
        logger.trace("Установка приложения EVENT_MESSAGE_ADD:" + this.settings["EVENT_MESSAGE_ADD"] + " EVENT_WELCOME_MESSAGE: " + this.settings["EVENT_WELCOME_MESSAGE"] + " EVENT_BOT_DELETE " + this.settings["EVENT_BOT_DELETE"]);
        this.sendCommand("imbot.register", this.settings, req.body["auth"]);
    }
    // На присоединение
    onImbotMessageAdd(req) {
        logger.trace("Сообщение от приложения");
    }
    // На присоединение
    onImbotJoinChat(req) {
        logger.trace("Присоединение к чату");
    }
    // На удаление приложения
    onImbotDelete(req) {
        logger.trace("Удаление приложения");
    }
    // На обновление приложения
    onAppUpdate(req) {
        logger.trace("Обновление приложения");
    }
    // Обработчик на команды
    onImCommandAdd(req) {
        logger.trace("Обработчик команд");
    }
    // Авторизация OAuth 2.0
    onOAuth(req) {
        let self = this;
        if (("code" in req.query) && ("state" in req.query) &&
            ("domain" in req.query) && ("member_id" in req.query) &&
            ("scope" in req.query)) {
            let urlReq = "https://" + req.query["domain"] + "/oauth/token/?client_id=" + this.clientId +
                "&grant_type=authorization_code&client_secret=" + this.clientSecret + "&redirect_uri=" + this.url +
                "&code=" + req.query["code"] + "&scope=" + req.query["scope"];
            request(urlReq, function (err, res, data) {
                if (err) {
                    logger.trace("Bitrix24 onOAuth request error: " + err);
                }
                else {
                    logger.trace("Bitrix24 onOAuth response: " + data);
                    data = JSON.parse(data);
                    let auth = {
                        domain: data["domain"],
                        access_token: data["access_token"]
                    };
                    let reqInstall = {
                        "body": {
                            "auth": auth,
                            "event": "ONAPPINSTALL"
                        }
                    };
                    self.onAppInstall(reqInstall);
                }
            });
        }
    }
}
exports.B24Bot = B24Bot;
