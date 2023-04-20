import { CONFIG } from "./config";

import { WebsocketServer } from "./lib/@websocket";
import { HttpRelay } from "./lib/@http_relay";

const websocketServer = new WebsocketServer();
const httpRelays = {} as { [port in string]: HttpRelay };

for (const port of CONFIG.HTTP_RELAYS) {

    const httpRelay = new HttpRelay(websocketServer, port);

    httpRelays[port] = httpRelay;
}