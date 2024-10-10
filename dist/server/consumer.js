"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.consumerInit = consumerInit;
const ioredis_1 = require("ioredis");
const kafkaClient_1 = require("./kafkaClient");
const ws_setup_1 = require("../utils/ws_setup");
const fetchNearby_1 = require("../utils/fetchNearby");
const wait_for_it_1 = require("../utils/wait_for_it");
const prisma_db_1 = require("../db/prisma_db");
const subscriber = new ioredis_1.Redis({
    host: "redis",
    port: 6379,
});
async function consumerInit() {
    try {
        const consumer = kafkaClient_1.kafka.consumer({ groupId: "group_id" });
        if (subscriber) {
            const subscribed = await subscriber.subscribe("server1", "server2", "server3", "server4", (err, count) => {
                if (err) {
                    console.error("redis failed to recieve", err);
                }
                else {
                    console.log(`subscribed This subscriber is currently subscribed to ${count} channels`);
                }
            });
            console.log("SUbscribed by redis ", subscribed);
            subscriber.on("message", (channel, message) => {
                console.log(`Received ${message} from ${channel}`);
            });
        }
        // subscriber.on("messageBuffer", (channel, message) => {
        //   // Both `channel` and `message` are buffers.
        //   console.log(channel, message)
        // })
        await consumer.connect();
        await consumer.subscribe({
            topic: "location_updates",
            fromBeginning: true,
        });
        await consumer.run({
            eachMessage: async ({ topic, partition, message, heartbeat, pause }) => {
                const locationData = JSON.parse(message.value.toString("utf-8"));
                console.log(`group_id: [${topic}]: PART:${partition}:`, locationData);
                const nearbySchools = await (0, fetchNearby_1.fetchNearby)(locationData);
                await (0, wait_for_it_1.wait)((0, prisma_db_1.dbInit)(nearbySchools, locationData), 10000);
                if (nearbySchools.length > 0) {
                    ws_setup_1.wss.clients.forEach((client) => {
                        if (client.readyState === client.OPEN) {
                            client.send(JSON.stringify({
                                locationData: locationData,
                                nearbySchools: nearbySchools,
                            })); // Send location data to all clients
                        }
                    });
                }
            },
        });
    }
    catch (err) {
        console.log("In Consumer Error:  ", err);
    }
}
