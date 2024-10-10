"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.kafka = exports.getRedisClient = void 0;
const kafkajs_1 = require("kafkajs");
const redis_1 = require("redis");
const kafka = new kafkajs_1.Kafka({
    clientId: "custom_map",
    brokers: ["192.168.29.142:9092", "localhost:9092"],
});
exports.kafka = kafka;
let client;
const getRedisClient = () => {
    if (!client) {
        client = (0, redis_1.createClient)({
            url: "redis://redis:6379",
        });
        client.on("error", (err) => console.error("Redis Client Error", err));
        client.connect(); // Ensure it connects only once
    }
    return client;
};
exports.getRedisClient = getRedisClient;
