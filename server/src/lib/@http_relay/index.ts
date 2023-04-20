import express from "express";
import cors from "cors";

import type { Application } from "express";
import type { WebsocketServer } from "../@websocket";

export class HttpRelay {

    private websocketServer: WebsocketServer;

    private serverPort: number;
    private localPort: number;

    private application: Application;

    constructor(websocketServer: WebsocketServer, serverPort: number, localPort: number) {

        this.websocketServer = websocketServer;

        this.serverPort = serverPort;
        this.localPort = localPort;

        this.application = express();

        this.configureCORS();
        this.bindMiddleware();

        this.startServer();
    }

    private configureCORS() {

        this.application.use(cors({ origin: "*" }));
    }

    private bindMiddleware() {

        this.application.use("*", async (req, res) => {

            const path = req.originalUrl;
            const method = req.method;
            const headers = req.headers ?? {};
            const body = req.body ?? {};

            console.log({ body, headers });

            try {

                const response = await this.websocketServer.relayHTTPRequest(path, method, headers, body, this.localPort);

                res.status(response.httpCode).send(response.data);

            } catch(err) {

                if (err instanceof Error)
                    res.status(500).send(err.message);
                else
                    res.status(500).send("HTTP RELAY UNEXPECTED ERROR");
            }
            
        });
    }

    private startServer() {

        this.application.listen(this.serverPort, () => {

            console.log(`[HTTP-RELAY-${this.localPort}] - Alive!`);
        });
    }
}