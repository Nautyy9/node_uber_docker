"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.setUpAdmin = setUpAdmin;
exports.handleClientDisconnect = handleClientDisconnect;
const kafkaClient_1 = require("./kafkaClient");
const prisma_config_1 = require("./prisma_config");
const fetchNearby_1 = require("../utils/fetchNearby");
const wait_for_it_1 = require("../utils/wait_for_it");
const prisma_db_1 = require("../db/prisma_db");
const ws_setup_1 = require("../utils/ws_setup");
let admin = null;
async function configureAdminConnection() {
    if (!admin) {
        admin = kafkaClient_1.kafka.admin();
        console.log("Admin connecting...");
        await admin.connect();
        console.log("Adming Connection Success...");
    }
}
async function setUpAdmin() {
    await configureAdminConnection();
    if (admin) {
        await admin.createTopics({
            topics: [
                {
                    topic: "location_updates",
                    numPartitions: 4,
                },
            ],
            // timeout: 5000,
            waitForLeaders: true,
        });
        const topic = "location_updates_for_NORTH";
        const timestamp = Date.now() - 60 * 1000; // 1 day ago
        // Fetch the offset for a specific timestamp
        const offsets = await admin.fetchTopicOffsetsByTimestamp(topic, timestamp);
        console.log("Offsets:", offsets);
        console.log("Topic Created Success [location_updates]");
        console.log("Disconnecting Admin..");
    }
}
async function handleClientDisconnect() {
    await configureAdminConnection();
    if (admin) {
        console.log("admin connected again");
        const topics = [
            "location_updates_for_NORTH",
            "location_updates_for_EAST",
            "location_updates_for_WEST",
            "location_updates_for_SOUTH",
        ];
        topics.forEach(async (topic) => {
            await admin.resetOffsets({
                groupId: topic,
                topic,
                earliest: true,
            });
        });
    }
    const groups = await prisma_config_1.prisma.room.findMany();
    console.log("found groups", groups);
    console.log("added reset offsets");
    groups.forEach(async (group) => {
        const consumer = kafkaClient_1.kafka.consumer({ groupId: group.name });
        // const logger = kafka.logger()
        // console.log(logger)
        console.log("inside consumer");
        if (consumer) {
            try {
                await consumer.connect();
                console.log(" consumer connected");
                await consumer.subscribe({
                    topic: `location_updates_for_${group.name}`,
                    fromBeginning: false,
                });
                console.log("consumer subscription successful");
                await consumer.run({
                    eachMessage: async ({ topic, partition, message, heartbeat, pause, }) => {
                        const locationData = JSON.parse(message.value.toString("utf-8"));
                        console.log(`${group.name}: [${topic}]: PART:${partition}:`, locationData);
                        // if (!flag) {
                        //   console.log("pausing the consumption")
                        //   pause()
                        // }
                        const nearbySchools = await (0, fetchNearby_1.fetchNearby)(locationData);
                        await (0, wait_for_it_1.wait)((0, prisma_db_1.dbInit)(nearbySchools, locationData), 5000);
                        console.log("resuming the consumption");
                        // consumer.resume([
                        //   { topic: `location_updates_for_WEST` },
                        //   { topic: `location_updates_for_SOUTH` },
                        //   { topic: `location_updates_for_NORTH` },
                        //   { topic: `location_updates_for_EAST` },
                        // ])
                        if (nearbySchools.length > 0) {
                            await (0, wait_for_it_1.wait)(ws_setup_1.wss.clients.forEach((client) => {
                                if (client.readyState === client.OPEN) {
                                    client.send(JSON.stringify({
                                        locationData: locationData,
                                        nearbySchools: nearbySchools,
                                    })); // Send location data to all clients
                                }
                            }), 5000);
                        }
                    },
                });
            }
            catch (err) {
                console.log(err);
            }
        }
        else {
            console.log("iasdfowieasdksdfioerkjiore");
        }
    });
}
process.on("SIGTERM", async () => {
    if (admin) {
        await admin.disconnect();
        console.log("Admin disconnected");
    }
});
