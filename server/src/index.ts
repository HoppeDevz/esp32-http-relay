import { CONFIG } from "./config";

import { WebsocketServer } from "./lib/@websocket";
import { HttpRelay } from "./lib/@http_relay";

const websocketServer = new WebsocketServer();
const httpRelays = {} as { [port in string]: HttpRelay };

for (const relayConfig of CONFIG.HTTP_RELAYS) {

    const httpRelay = new HttpRelay(websocketServer, relayConfig.from, relayConfig.to);

    httpRelays[relayConfig.to] = httpRelay;
}