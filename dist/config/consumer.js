"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.consumerInit = consumerInit;
const ioredis_1 = require("ioredis");
const kafkaClient_1 = require("./kafkaClient");
const ws_setup_1 = require("../utils/ws_setup");
const fetchNearby_1 = require("../utils/fetchNearby");
const wait_for_it_1 = require("../utils/wait_for_it");
const prisma_db_1 = require("../db/prisma_db");
const prisma_config_1 = require("./prisma_config");
// import { handleClientDisconnect } from "./admin"
const subscriber = new ioredis_1.Redis({
    host: "redis",
    port: 6379,
});
function isErrorType(obj) {
    return (typeof obj === "object" &&
        obj !== null &&
        "message" in obj &&
        "serverName" in obj);
}
// Type guard function for LocationType
function isLocationType(obj) {
    return (typeof obj === "object" &&
        obj !== null &&
        "lat" in obj &&
        "lng" in obj &&
        "roomName" in obj &&
        "serverName" in obj);
}
function sendDownToClient(locationData, location) {
    ws_setup_1.wss.clients.forEach((client) => {
        if (client.readyState === client.OPEN) {
            if (isErrorType(locationData)) {
                client.send(JSON.stringify({
                    locationData,
                    location,
                }));
            }
            else {
                client.send(JSON.stringify({
                    locationData: locationData,
                    location: location,
                })); // Send location data to all clients
            }
        }
    });
}
async function consumerInit() {
    try {
        // let consumer: Consumer | undefined
        // flag = false
        if (subscriber) {
            try {
                const subscribed = await subscriber.subscribe("0", "1", "2", "3", (err, count) => {
                    if (err) {
                        console.error("redis failed to recieve", err);
                    }
                    else {
                        console.log(`subscribed This subscriber is currently subscribed to ${count} channels`);
                    }
                });
                console.log("SUbscribed by redis ", subscribed);
                subscriber.on("message", async (channel, message) => {
                    const locationData = JSON.parse(message);
                    await (0, wait_for_it_1.wait)(undefined, 3000);
                    if (isErrorType(locationData)) {
                        //@ handleClientDisconnect()
                        const lastLocationInserted = await prisma_config_1.prisma.locations.findFirst({
                            where: {
                                user: {
                                    name: locationData.serverName,
                                },
                            },
                        });
                        sendDownToClient(locationData, lastLocationInserted);
                    }
                    else if (isLocationType(locationData)) {
                        const nearbySchools = await (0, fetchNearby_1.fetchNearby)(locationData);
                        (0, prisma_db_1.dbInit)(nearbySchools, locationData);
                        sendDownToClient(locationData, nearbySchools);
                    }
                    else {
                        console.log("invalid type");
                    }
                    // console.log(locationData)
                });
            }
            catch (e) {
                console.log("Error in redis subscriber", e);
            }
            subscriber.on("close", () => {
                console.log("redis subscriber closed");
            });
            subscriber.on("end", () => {
                console.log("redis subscriber ended");
            });
            subscriber.on("reconnecting", () => {
                console.log("redis subscriber reconnecting");
            });
        }
        // subscriber.on("messageBuffer", (channel, message) => {
        //   // Both `channel` and `message` are buffers.
        //   console.log(channel, message)
        // })
        const groups = await prisma_config_1.prisma.room.findMany();
        groups.forEach(async (group) => {
            const consumer = kafkaClient_1.kafka.consumer({ groupId: group.name });
            // const logger = kafka.logger()
            // console.log(logger)
            if (consumer) {
                try {
                    await consumer.connect();
                    await consumer.subscribe({
                        topic: `location_updates_for_${group.name}`,
                        fromBeginning: false,
                    });
                    await consumer.run({
                        eachMessage: async ({ topic, partition, message, heartbeat, pause, }) => {
                            const locationData = JSON.parse(message.value.toString("utf-8"));
                            console.log(`${group.name}: [${topic}]: PART:${partition}:`, locationData);
                            // if (!flag) {
                            //   console.log("pausing the consumption")
                            //   pause()
                            // }
                            // const nearbySchools = await fetchNearby(locationData)
                            // await wait(dbInit(nearbySchools, locationData), 5000)
                            // if (nearbySchools.length > 0) {
                            //   sendDownToClient(locationData, nearbySchools)
                            // }
                        },
                    });
                    consumer.on(consumer.events.DISCONNECT, async () => {
                        console.error("Kafka consumer disconnected, retrying...");
                        await (0, wait_for_it_1.wait)(undefined, 5000); // wait before reconnecting
                        await consumer.connect(); // attempt to reconnect
                    });
                }
                catch (err) {
                    console.log("Error in Kafka Consumer ", err);
                }
            }
            else {
                console.log("iasdfowieasdksdfioerkjiore");
            }
        });
    }
    catch (err) {
        console.log("In Consumer Error:  ", err);
    }
}
