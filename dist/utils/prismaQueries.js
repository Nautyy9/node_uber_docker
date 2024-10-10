"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getUserId = getUserId;
exports.getRoomId = getRoomId;
exports.insertLocation = insertLocation;
exports.findLastInsertedLocation = findLastInsertedLocation;
exports.findLocMinAgo = findLocMinAgo;
exports.createRooms = createRooms;
exports.countRoomMembers = countRoomMembers;
const prisma_config_1 = require("../config/prisma_config");
async function getUserId(serverName) {
    const user = await prisma_config_1.prisma.user.findFirst({
        where: {
            name: serverName,
        },
        select: {
            id: true,
        },
    });
    return user;
}
async function getRoomId(roomName) {
    const roomId = await prisma_config_1.prisma.room.findUnique({
        where: {
            name: roomName,
        },
    });
    if (roomId) {
        return roomId?.id;
    }
}
async function insertLocation({ nearOneDistance, nearOneName, newLat, newLng, serverName, }) {
    const user = await getUserId(serverName);
    if (user) {
        const locInserted = await prisma_config_1.prisma.locations.create({
            data: {
                latitude: newLat,
                longitude: newLng,
                timestamp: new Date(),
                nearOneName,
                nearOneDistance,
                userId: user.id,
            },
        });
        if (locInserted) {
            console.log("added new location");
        }
    }
}
async function findLastInsertedLocation(serverName) {
    const user = await getUserId(serverName);
    if (user) {
        const loc = await prisma_config_1.prisma.locations.findFirst({
            where: {
                userId: user.id,
            },
            orderBy: {
                timestamp: "desc",
            },
        });
        // console.log("found last inserted location")
        return loc;
    }
    //# --------- OR -------
    // const users  = await prisma.user.findFirst({
    //   where : {
    //     serverId : serverName
    //   },
    //   include : {
    //     locations : {
    //       orderBy : {
    //         timestamp : "desc"
    //       },
    //     }
    //   }
    //   ,
    //   take: 1
    // }) // this will return user with serverId == serverName , with location of lastly inserted location
}
async function findLocMinAgo(serverName) {
    const user = await getUserId(serverName);
    // console.log(user, serverName)
    if (user) {
        const oneMinuteAgo = new Date(Date.now() - 60 * 1000);
        const location = await prisma_config_1.prisma.locations.findFirst({
            where: {
                userId: user.id,
                timestamp: {
                    lt: oneMinuteAgo, // Less than current time (no future timestamps)
                },
            },
            orderBy: {
                timestamp: "desc",
            },
        });
        console.log(location, "min ago");
        if (location) {
            const now = new Date(); // Current time
            const timestamp = new Date(location.timestamp); // Convert your timestamp to a Date object
            // Calculate the difference in milliseconds
            const diffInMs = now.getTime() - timestamp.getTime();
            // Calculate the difference in days, hours, minutes, and seconds
            const diffInSeconds = Math.floor((diffInMs / 1000) % 60);
            const diffInMinutes = Math.floor((diffInMs / 1000 / 60) % 60);
            const diffInHours = Math.floor((diffInMs / 1000 / 60 / 60) % 24);
            const seconds = String(diffInSeconds).padStart(2, "0");
            const minutes = String(diffInMinutes).padStart(2, "0");
            const hours = String(diffInHours).padStart(2, "0");
            const time = `${hours}:${minutes}:${seconds}`;
            console.log("Found user location about a minute ago");
            return `You were near ${location?.nearOneName} at a distance of ${location?.nearOneDistance} about a ${time} ago `;
        }
        return `NO data found ${location}`;
    }
}
async function createRooms() {
    const rooms = await prisma_config_1.prisma.room.createMany({
        data: [
            {
                name: "EAST",
            },
            {
                name: "NORTH",
            },
            {
                name: "SOUTH",
            },
            {
                name: "WEST",
            },
        ],
    });
    if (rooms) {
        return rooms;
    }
    else {
        return null;
    }
}
// ! create a fetch all room status , with checking every room connected  memenber
async function countRoomMembers(req) {
    const allRoomMembers = await prisma_config_1.prisma.room.findMany({
        include: {
            _count: true,
        },
    });
    return allRoomMembers;
}
