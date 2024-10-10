import { locationType } from "../../types"
import { kafka } from "./kafkaClient"
import { prisma } from "./prisma_config"
import { fetchNearby } from "../utils/fetchNearby"
import { wait } from "../utils/wait_for_it"
import { dbInit } from "../db/prisma_db"
import { wss } from "../utils/ws_setup"
import { Admin } from "kafkajs"
let admin: Admin | null = null

async function configureAdminConnection() {
  if (!admin) {
    admin = kafka.admin()
    console.log("Admin connecting...")

    await admin.connect()
    console.log("Adming Connection Success...")
  }
}

export async function setUpAdmin() {
  await configureAdminConnection()
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
    })
    const topic = "location_updates_for_NORTH"
    const timestamp = Date.now() - 60 * 1000 // 1 day ago

    // Fetch the offset for a specific timestamp
    const offsets = await admin.fetchTopicOffsetsByTimestamp(topic, timestamp)

    console.log("Offsets:", offsets)
    console.log("Topic Created Success [location_updates]")

    console.log("Disconnecting Admin..")
  }
}
export async function handleClientDisconnect() {
  await configureAdminConnection()
  if (admin) {
    console.log("admin connected again")
    const topics = [
      "location_updates_for_NORTH",
      "location_updates_for_EAST",
      "location_updates_for_WEST",
      "location_updates_for_SOUTH",
    ]
    topics.forEach(async (topic) => {
      await admin!.resetOffsets({
        groupId: topic,
        topic,
        earliest: true,
      })
    })
  }
  const groups = await prisma.room.findMany()
  console.log("found groups", groups)
  console.log("added reset offsets")
  groups.forEach(async (group) => {
    const consumer = kafka.consumer({ groupId: group.name })
    // const logger = kafka.logger()
    // console.log(logger)
    console.log("inside consumer")
    if (consumer) {
      try {
        await consumer.connect()
        console.log(" consumer connected")

        await consumer.subscribe({
          topic: `location_updates_for_${group.name}`,
          fromBeginning: false,
        })
        console.log("consumer subscription successful")

        await consumer.run({
          eachMessage: async ({
            topic,
            partition,
            message,
            heartbeat,
            pause,
          }) => {
            const locationData: locationType = JSON.parse(
              message.value!.toString("utf-8")
            )
            console.log(
              `${group.name}: [${topic}]: PART:${partition}:`,
              locationData
            )
            // if (!flag) {
            //   console.log("pausing the consumption")
            //   pause()
            // }
            const nearbySchools = await fetchNearby(locationData)
            await wait(dbInit(nearbySchools, locationData), 5000)
            console.log("resuming the consumption")
            // consumer.resume([
            //   { topic: `location_updates_for_WEST` },
            //   { topic: `location_updates_for_SOUTH` },
            //   { topic: `location_updates_for_NORTH` },
            //   { topic: `location_updates_for_EAST` },
            // ])

            if (nearbySchools.length > 0) {
              await wait(
                wss.clients.forEach((client) => {
                  if (client.readyState === client.OPEN) {
                    client.send(
                      JSON.stringify({
                        locationData: locationData,
                        nearbySchools: nearbySchools,
                      })
                    ) // Send location data to all clients
                  }
                }),
                5000
              )
            }
          },
        })
      } catch (err) {
        console.log(err)
      }
    } else {
      console.log("iasdfowieasdksdfioerkjiore")
    }
  })
}

process.on("SIGTERM", async () => {
  if (admin) {
    await admin.disconnect()
    console.log("Admin disconnected")
  }
})
