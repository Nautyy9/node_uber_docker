"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.wss = exports.wsServer = void 0;
const ws_1 = require("ws");
const https_1 = __importDefault(require("https"));
const fs_1 = __importDefault(require("fs"));
const kafkaClient_1 = require("../config/kafkaClient");
const redisClient_1 = require("../config/redisClient");
const prisma_config_1 = require("../config/prisma_config");
const wsServer = https_1.default.createServer({
    cert: fs_1.default.readFileSync("nginx/certs/selfsigned.crt"),
    key: fs_1.default.readFileSync("nginx/certs/selfsigned.key"),
});
exports.wsServer = wsServer;
const producer = kafkaClient_1.kafka.producer();
const wss = new ws_1.WebSocketServer({ server: wsServer });
exports.wss = wss;
wss.on("connection", async function connection(ws) {
    try {
        await producer.connect();
        console.log("producer connected");
        ws.on("message", async function message(data) {
            const locations = JSON.parse(data.toString("utf-8"));
            // wss.emit("location", data)
            console.log(locations);
            try {
                if (redisClient_1.client && locations && Object.values(locations).length > 0) {
                    if (locations.message) {
                        const partId = await prisma_config_1.prisma.user.findFirst({
                            where: {
                                name: locations.serverName,
                            },
                            select: {
                                partitionId: true,
                            },
                        });
                        console.log(partId, locations);
                        await redisClient_1.client.publish(`${partId?.partitionId}`, JSON.stringify(locations));
                    }
                    else {
                        await redisClient_1.client.publish(`${locations.partitionId}`, JSON.stringify(locations));
                    }
                    // console.log("redis publish")
                    // console.log("Published %s to %s", locations, locations.serverName)
                    const producersend = await producer.send({
                        topic: `location_updates_for_${locations.roomName}`,
                        // acks: -1,
                        messages: [
                            {
                                // partition: parseInt(locations.partitionId),
                                key: locations.roomName,
                                value: JSON.stringify(locations),
                            },
                        ],
                    });
                    // console.log(producersend, "???")
                }
            }
            catch (err) {
                console.log("error inside the on connection ", err);
            }
        });
        // ws.on("locations", (data) => {
        //   const locations = JSON.parse(data.toString("utf-8"))
        // })
        ws.on("close", (msg) => {
            console.log("Client disconnected , closing the producer connection", JSON.parse(JSON.stringify(msg)));
        });
    }
    catch (error) {
        console.log("error hai bhai error hai", error);
    }
});
wss.on("close", async () => {
    await producer.disconnect();
    if (redisClient_1.client)
        redisClient_1.client.quit();
});
