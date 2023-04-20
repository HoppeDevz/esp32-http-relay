"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const config_1 = require("./config");
const _websocket_1 = require("./lib/@websocket");
const _http_relay_1 = require("./lib/@http_relay");
const websocketServer = new _websocket_1.WebsocketServer();
const httpRelays = {};
for (const port of config_1.CONFIG.HTTP_RELAYS) {
    const httpRelay = new _http_relay_1.HttpRelay(websocketServer, port);
    httpRelays[port] = httpRelay;
}
