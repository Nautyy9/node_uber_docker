import { Router } from "express"
import {
  countRoomMembers,
  findLocMinAgo,
  getRoomId,
} from "../utils/prismaQueries"
import { prisma } from "../config/prisma_config"

import { v4 as uuidv4 } from "uuid"
import { getClientIp } from "../utils/getClientIp"

const route = Router()

route.get("/status", async (req, res) => {
  const query = req.query
  const serverName = query.serverName as string
  console.log(serverName)
  const data = await findLocMinAgo(serverName)
  if (data) {
    res.status(200).json({ data: data })
  } else {
    res.status(200).json({ data: "No data added yet!" })
  }
})

route.get("/user", async (req, res) => {
  try {
    const room = req.query
    const roomName = room.room as string
    const room_id = await getRoomId(roomName)
    const ip = getClientIp(req)
    const userCountUnderSameRoom = await prisma.user.count({
      where: { roomId: room_id },
    })
    console.log(userCountUnderSameRoom)
    const user = await prisma.user.findFirst({
      where: {
        userIP: `${ip}`,
      },
      select: {
        name: true,
        partitionId: true,
        room: true,
        userIP: true,
      },
    })

    if (user) {
      return res
        .status(200)
        .json({ user: user, roomMemberCount: userCountUnderSameRoom })
    }
    if (room_id && !user) {
      if (userCountUnderSameRoom >= 4) {
        return res
          .status(403)
          .json({ error: "Room full please join another room" })
      }
      const user = await prisma.user.create({
        data: {
          roomId: room_id,
          partitionId: userCountUnderSameRoom,
          name: `user_${uuidv4()}`,
          userIP: `${ip}`,
        },
        select: {
          name: true,
          room: true,
          partitionId: true,
          userIP: true,
        },
      })

      return res
        .status(200)
        .json({ user: user, roomMemberCount: userCountUnderSameRoom })
    }
  } catch (err) {
    return res.status(500).json({ error: err })
  }
})

route.get("/countMembers", async (req, res) => {
  const rooms = await countRoomMembers(req)
  res.status(200).json({ count: rooms })
})
export { route }
