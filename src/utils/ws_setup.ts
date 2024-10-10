import { WebSocketServer } from "ws"
import https from "https"
import fs from "fs"
import { kafka } from "../config/kafkaClient"
import { client } from "../config/redisClient"
import { prisma } from "../config/prisma_config"
const wsServer = https.createServer({
  cert: fs.readFileSync("nginx/certs/selfsigned.crt"),
  key: fs.readFileSync("nginx/certs/selfsigned.key"),
})

const producer = kafka.producer()

const wss = new WebSocketServer({ server: wsServer })
wss.on("connection", async function connection(ws) {
  try {
    await producer.connect()
    console.log("producer connected")
    ws.on("message", async function message(data) {
      const locations = JSON.parse(data.toString("utf-8"))
      // wss.emit("location", data)
      console.log(locations)
      try {
        if (client && locations && Object.values(locations).length > 0) {
          if (locations.message) {
            const partId = await prisma.user.findFirst({
              where: {
                name: locations.serverName,
              },
              select: {
                partitionId: true,
              },
            })
            console.log(partId, locations)
            await client.publish(
              `${partId?.partitionId}`,
              JSON.stringify(locations)
            )
          } else {
            await client.publish(
              `${locations.partitionId}`,
              JSON.stringify(locations)
            )
          }
          // console.log("redis publish")
          // console.log("Published %s to %s", locations, locations.serverName)
          const producersend = await producer.send({
            topic: `location_updates_for_${locations.roomName}`,
            // acks: -1,
            messages: [
              {
                // partition: parseInt(locations.partitionId),
                key: locations.roomName,
                value: JSON.stringify(locations),
              },
            ],
          })
          // console.log(producersend, "???")
        }
      } catch (err) {
        console.log("error inside the on connection ", err)
      }
    })
    // ws.on("locations", (data) => {
    //   const locations = JSON.parse(data.toString("utf-8"))
    // })
    ws.on("close", (msg) => {
      console.log(
        "Client disconnected , closing the producer connection",
        JSON.parse(JSON.stringify(msg))
      )
    })
  } catch (error) {
    console.log("error hai bhai error hai", error)
  }
})
wss.on("close", async () => {
  await producer.disconnect()
  if (client) client.quit()
})

export { wsServer, wss }
