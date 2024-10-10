"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.dbInit = dbInit;
const haversine_1 = require("../utils/haversine");
const prismaQueries_1 = require("../utils/prismaQueries");
async function dbInit(nearbySchools, locData) {
    const [nearOneName, closestOneDist] = nearbySchools[0];
    let { lat, lng, serverName, roomName } = locData;
    const newLat = parseFloat(lat);
    const newLng = parseFloat(lng);
    const nearOneDistance = parseFloat(closestOneDist);
    const user = await (0, prismaQueries_1.findLastInsertedLocation)(serverName);
    if (user) {
        const { latitude: prevLat, longitude: prevlng } = user;
        if ((0, haversine_1.haversine)(prevLat, prevlng, newLat, newLng) > 5) {
            (0, prismaQueries_1.insertLocation)({
                serverName,
                roomName,
                newLat,
                newLng,
                nearOneDistance,
                nearOneName,
            });
        }
    }
    else {
        (0, prismaQueries_1.insertLocation)({
            nearOneDistance,
            nearOneName,
            newLat,
            newLng,
            roomName,
            serverName,
        });
    }
    console.log("every 10 seconds until connections is on", nearbySchools[0]);
}
