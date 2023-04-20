"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.WebsocketServer = void 0;
const ws_1 = __importDefault(require("ws"));
const uuid_1 = require("uuid");
const config_1 = require("../../config");
class WebsocketServer {
    constructor() {
        this.client = "NOT_CONNECTED_YET";
        this.socket = new ws_1.default.Server({ port: config_1.CONFIG.WEBSOCKET_PORT });
        this.bindSocketEvents();
    }
    bindSocketEvents() {
        this.socket.on("connection", (socket) => {
            console.log(`[WEBSOCKET-SERVER] - Client connected!`);
            this.client = socket;
        });
        this.socket.on("close", () => {
            console.log(`[WEBSOCKET-SERVER] - Client disconnected!`);
            this.client = "NOT_CONNECTED_YET";
        });
    }
    sendMessage(eventName, data) {
        if (this.client === "NOT_CONNECTED_YET")
            throw new Error("[WEBSOCKET-SERVER] - Client is not connected yet!");
        this.client.send(JSON.stringify({ eventName, data }));
    }
    relayHTTPRequest(path, method, headers, body, port) {
        return __awaiter(this, void 0, void 0, function* () {
            return new Promise((resolve, reject) => {
                if (this.client === "NOT_CONNECTED_YET") {
                    return reject(new Error("[WEBSOCKET-SERVER] - Client is not connected yet!"));
                }
                let timeoutId;
                const timeout = 10000;
                const requestId = (0, uuid_1.v4)();
                console.log(`[WEBSOCKET-SERVER] - Path: ${path} | Port: ${port} | ID: ${requestId}`);
                function listener(event) {
                    const message = event.data;
                    console.log({ message });
                    if (typeof message !== "string")
                        return reject("message must be a string!");
                    const parsedMessage = JSON.parse(message);
                    if (parsedMessage.eventName === `http-request.${requestId}`) {
                        if (timeoutId)
                            clearTimeout(timeoutId);
                        const data = parsedMessage.data;
                        console.log("Received response!", data);
                        return resolve(data);
                    }
                }
                this.client.addEventListener("message", listener);
                this.sendMessage("http-request", { requestId, path, method, headers, body, port });
                timeoutId = setTimeout(() => {
                    if (this.client !== "NOT_CONNECTED_YET") {
                        this.client.removeEventListener("message", listener);
                    }
                    return reject(new Error(`[WEBSOCKET-SERVER] - Timeout after ${timeout} ms`));
                }, timeout);
            });
        });
    }
}
exports.WebsocketServer = WebsocketServer;
