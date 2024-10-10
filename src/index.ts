import https from "https"
import express from "express"
import fs from "fs"
import { route } from "./routes/api_route"
import path from "path"
import cors from "cors"
import { wsServer } from "./utils/ws_setup"
import { setUpAdmin } from "./config/admin"
import { consumerInit } from "./config/consumer"
import { createRooms } from "./utils/prismaQueries"
import { prisma } from "./config/prisma_config"

const port = 9999
const wsPort = 8080

const app = express()

const sslServer = https.createServer(
  {
    cert: fs.readFileSync("nginx/certs/selfsigned.crt"),
    key: fs.readFileSync("nginx/certs/selfsigned.key"),
  },
  app
)
// ! never forget to add this MF.
app.use(
  cors({
    origin: "*",
  })
)
app.set("trust proxy", true)
app.use(express.json())
app.use("/api", route)

// app.get("/", async (req, res) => {
//   const ip = getClientIp(req) as string

//   const protocol = req.protocol // 'http' or 'https'
//   const host = req.get("host") // Hostname + port (if any)
//   console.log(protocol, host)

//   const user = await prisma.user.findFirst({
//     where: {
//       userIP: ip.toString(),
//     },
//     select: {
//       room: true,
//       partitionId: true,
//       name: true,
//     },
//   })

//   if (user) {
//     res.sendFile(
//       path.join(__dirname, "../", "public", "ws_map.html"),
//       (err) => {
//         if (err) {
//           console.error(err)
//           res.status(500).send("Error loading the ws_map.html page.")
//         } else {
//           // Send user data after serving the page
//           res.json({
//             data: user,
//             fileUrl: `file`,
//           })
//         }
//       }
//     )
//   } else {
//     // If user is not found, serve index.html
//     res.sendFile(path.join(__dirname, "../", "public", "index.html"), (err) => {
//       if (err) {
//         console.error(err)
//         res.status(500).send("Error loading the index.html page.")
//       } else {
//         // Send empty data or a message after serving the page
//         res.json({
//           message: "User not found",
//           fileUrl: `join_room`,
//         })
//       }
//     })
//   }
// })
app.use("/", express.static("public"))
app.get("/file", async (req, res) => {
  res.sendFile(path.join(__dirname, "../", "public", "/ws_map.html")) // Adjust path to your HTML file
})

app.get("/location", (req, res) => {
  console.log(`Location request received from ${req.ip}`)
  res.send("Location logged")
})
async function addRoom() {
  const hasRooms = await prisma.room.findMany()
  if (hasRooms.length === 0) {
    await createRooms()
  }
}
async function init() {
  await addRoom()

  await Promise.all([consumerInit(), setUpAdmin()])
  sslServer.listen(port, () => {
    console.log(`App started on https:localhost:${port}`)
  })
  wsServer.listen(wsPort, () => {
    console.log(`WebSocket server is running on wss://localhost:${wsPort}`)
  })
}

init()
