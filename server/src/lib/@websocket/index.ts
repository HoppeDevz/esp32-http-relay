import WebSocket from "ws";
import { v4 as uuidv4 } from 'uuid';

import { CONFIG } from "../../config";

import type { Server } from "ws";
import type { WebSocket as WebSocketClient } from "ws";


export class WebsocketServer {

    private socket: Server;
    private client: WebSocketClient | "NOT_CONNECTED_YET";

    constructor() {
        
        this.client = "NOT_CONNECTED_YET";

        this.socket = new WebSocket.Server({ port: CONFIG.WEBSOCKET_PORT });
        this.bindSocketEvents();
    }

    private bindSocketEvents() {

        this.socket.on("connection", (socket) => {

            console.log(`[WEBSOCKET-SERVER] - Client connected!`);

            this.client = socket;
        });

        this.socket.on("close", () => {

            console.log(`[WEBSOCKET-SERVER] - Client disconnected!`);

            this.client = "NOT_CONNECTED_YET";
        });
    }

    private sendMessage(eventName: string, data: unknown) {

        if (this.client === "NOT_CONNECTED_YET") 
            throw new Error("[WEBSOCKET-SERVER] - Client is not connected yet!");

        this.client.send(JSON.stringify({ eventName, data }));
    }

    public async relayHTTPRequest(path: string, method: string, headers: any, body: any, port: number): Promise<{ httpCode: number, data: unknown }> {

        return new Promise((resolve, reject) => {

            if (this.client === "NOT_CONNECTED_YET") {

                return reject(new Error("[WEBSOCKET-SERVER] - Client is not connected yet!"));
            }

            let timeoutId: NodeJS.Timeout | undefined;

            const timeout = 10000;
            const requestId = uuidv4();

            console.log(`[WEBSOCKET-SERVER] - Path: ${path} | Port: ${port} | ID: ${requestId}`);

            function listener(event: WebSocket.MessageEvent) {

                const message = event.data;

                console.log({ message });

                if (typeof message !== "string") return reject("message must be a string!");

                const parsedMessage = JSON.parse(message) as { eventName: string, data: unknown };

                if (parsedMessage.eventName === `http-request.${requestId}`) {

                    if (timeoutId)
                        clearTimeout(timeoutId);

                    const data = parsedMessage.data as { httpCode: number, data: unknown };
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
    }
}