"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.fetchNearby = fetchNearby;
const redisClient_1 = require("../config/redisClient");
async function fetchNearby(locationData) {
    const withinRadius = (await redisClient_1.client.geosearch("school:nearby", "FROMLONLAT", parseFloat(locationData.lng), parseFloat(locationData.lat), "BYRADIUS", 1, "km", "ASC", "WITHDIST"));
    return withinRadius;
}
