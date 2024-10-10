"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.route = void 0;
const express_1 = require("express");
const prismaQueries_1 = require("../utils/prismaQueries");
const prisma_config_1 = require("../config/prisma_config");
const uuid_1 = require("uuid");
const getClientIp_1 = require("../utils/getClientIp");
const route = (0, express_1.Router)();
exports.route = route;
route.get("/status", async (req, res) => {
    const query = req.query;
    const serverName = query.serverName;
    console.log(serverName);
    const data = await (0, prismaQueries_1.findLocMinAgo)(serverName);
    if (data) {
        res.status(200).json({ data: data });
    }
    else {
        res.status(200).json({ data: "No data added yet!" });
    }
});
route.get("/user", async (req, res) => {
    try {
        const room = req.query;
        const roomName = room.room;
        const room_id = await (0, prismaQueries_1.getRoomId)(roomName);
        const ip = (0, getClientIp_1.getClientIp)(req);
        const userCountUnderSameRoom = await prisma_config_1.prisma.user.count({
            where: { roomId: room_id },
        });
        console.log(userCountUnderSameRoom);
        const user = await prisma_config_1.prisma.user.findFirst({
            where: {
                userIP: `${ip}`,
            },
            select: {
                name: true,
                partitionId: true,
                room: true,
                userIP: true,
            },
        });
        if (user) {
            return res
                .status(200)
                .json({ user: user, roomMemberCount: userCountUnderSameRoom });
        }
        if (room_id && !user) {
            if (userCountUnderSameRoom >= 4) {
                return res
                    .status(403)
                    .json({ error: "Room full please join another room" });
            }
            const user = await prisma_config_1.prisma.user.create({
                data: {
                    roomId: room_id,
                    partitionId: userCountUnderSameRoom,
                    name: `user_${(0, uuid_1.v4)()}`,
                    userIP: `${ip}`,
                },
                select: {
                    name: true,
                    room: true,
                    partitionId: true,
                    userIP: true,
                },
            });
            return res
                .status(200)
                .json({ user: user, roomMemberCount: userCountUnderSameRoom });
        }
    }
    catch (err) {
        return res.status(500).json({ error: err });
    }
});
route.get("/countMembers", async (req, res) => {
    const rooms = await (0, prismaQueries_1.countRoomMembers)(req);
    res.status(200).json({ count: rooms });
});
