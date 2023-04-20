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
exports.HttpRelay = void 0;
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
class HttpRelay {
    constructor(websocketServer, serverPort, localPort) {
        this.websocketServer = websocketServer;
        this.serverPort = serverPort;
        this.localPort = localPort;
        this.application = (0, express_1.default)();
        this.configureCORS();
        this.bindMiddleware();
        this.startServer();
    }
    configureCORS() {
        this.application.use((0, cors_1.default)({ origin: "*" }));
    }
    bindMiddleware() {
        this.application.use("*", (req, res) => __awaiter(this, void 0, void 0, function* () {
            var _a, _b;
            const path = req.originalUrl;
            const method = req.method;
            const headers = (_a = req.headers) !== null && _a !== void 0 ? _a : {};
            const body = (_b = req.body) !== null && _b !== void 0 ? _b : {};
            console.log({ body, headers });
            try {
                const response = yield this.websocketServer.relayHTTPRequest(path, method, headers, body, this.localPort);
                res.status(response.httpCode).send(response.data);
            }
            catch (err) {
                if (err instanceof Error)
                    res.status(500).send(err.message);
                else
                    res.status(500).send("HTTP RELAY UNEXPECTED ERROR");
            }
        }));
    }
    startServer() {
        this.application.listen(this.serverPort, () => {
            console.log(`[HTTP-RELAY-${this.localPort}] - Alive!`);
        });
    }
}
exports.HttpRelay = HttpRelay;
