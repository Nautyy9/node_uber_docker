"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const https_1 = __importDefault(require("https"));
const express_1 = __importDefault(require("express"));
const fs_1 = __importDefault(require("fs"));
const api_route_1 = require("./routes/api_route");
const path_1 = __importDefault(require("path"));
const cors_1 = __importDefault(require("cors"));
const ws_setup_1 = require("./utils/ws_setup");
const admin_1 = require("./config/admin");
const consumer_1 = require("./config/consumer");
const prismaQueries_1 = require("./utils/prismaQueries");
const prisma_config_1 = require("./config/prisma_config");
const port = 9999;
const wsPort = 8080;
const app = (0, express_1.default)();
const sslServer = https_1.default.createServer({
    cert: fs_1.default.readFileSync("nginx/certs/selfsigned.crt"),
    key: fs_1.default.readFileSync("nginx/certs/selfsigned.key"),
}, app);
// ! never forget to add this MF.
app.use((0, cors_1.default)({
    origin: "*",
}));
app.set("trust proxy", true);
app.use(express_1.default.json());
app.use("/api", api_route_1.route);
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
app.use("/", express_1.default.static("public"));
app.get("/file", async (req, res) => {
    res.sendFile(path_1.default.join(__dirname, "../", "public", "/ws_map.html")); // Adjust path to your HTML file
});
app.get("/location", (req, res) => {
    console.log(`Location request received from ${req.ip}`);
    res.send("Location logged");
});
async function addRoom() {
    const hasRooms = await prisma_config_1.prisma.room.findMany();
    if (hasRooms.length === 0) {
        await (0, prismaQueries_1.createRooms)();
    }
}
async function init() {
    await addRoom();
    await Promise.all([(0, consumer_1.consumerInit)(), (0, admin_1.setUpAdmin)()]);
    sslServer.listen(port, () => {
        console.log(`App started on https:localhost:${port}`);
    });
    ws_setup_1.wsServer.listen(wsPort, () => {
        console.log(`WebSocket server is running on wss://localhost:${wsPort}`);
    });
}
init();
