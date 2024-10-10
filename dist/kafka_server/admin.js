"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.setUpAdmin = setUpAdmin;
const client_1 = require("./client");
async function setUpAdmin() {
    const admin = client_1.kafka.admin();
    console.log("Admin connecting...");
    await admin.connect();
    console.log("Adming Connection Success...");
    await admin.createTopics({
        topics: [
            {
                topic: "location_updates",
                numPartitions: 2,
            },
        ],
    });
    console.log("Topic Created Success [rider-updates]");
    console.log("Disconnecting Admin..");
    await admin.disconnect();
}
