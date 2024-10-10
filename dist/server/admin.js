"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.setUpAdmin = setUpAdmin;
const kafkaClient_1 = require("./kafkaClient");
async function setUpAdmin() {
    const admin = kafkaClient_1.kafka.admin();
    console.log("Admin connecting...");
    await admin.connect();
    console.log("Adming Connection Success...");
    await admin.createTopics({
        topics: [
            {
                topic: "location_updates",
                numPartitions: 4,
            },
        ],
    });
    console.log("Topic Created Success [location_updates]");
    console.log("Disconnecting Admin..");
    await admin.disconnect();
}
