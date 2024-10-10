"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const client_1 = require("./client");
const uuid_1 = require("uuid");
const sub = (0, client_1.getRedisClient)();
const group = `consumer-group-${(0, uuid_1.v4)()}`;
sub.on("error", (err) => console.log("Redis Subscriber Error", err));
async function init() {
    await sub.connect();
    sub.subscribe("selected_server", (listen) => {
        console.log("subscribed to redis with listner", listen);
    });
    sub.on("message", (channel, message) => {
        console.log("received message from redis", channel, message);
    });
    const consumer = client_1.kafka.consumer({ groupId: group });
    await consumer.connect();
    await consumer.subscribe({
        topics: ["location_updates"],
        fromBeginning: true,
    });
    await consumer.run({
        eachMessage: async ({ topic, partition, message, heartbeat, pause }) => {
            console.log(`${group}: [${topic}]: PART:${partition}:`, message.value?.toString());
        },
    });
}
init();
