"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.wsServer = void 0;
const ws_1 = require("ws");
const https_1 = __importDefault(require("https"));
const fs_1 = __importDefault(require("fs"));
const wsServer = https_1.default.createServer({
    cert: fs_1.default.readFileSync("nginx/certs/selfsigned.crt"),
    key: fs_1.default.readFileSync("nginx/certs/selfsigned.key"),
});
exports.wsServer = wsServer;
const wss = new ws_1.WebSocketServer({ server: wsServer });
wss.on("connection", function connection(ws) {
    ws.on("message", function message(data) {
        console.log("received: %s", data);
    });
    ws.send("something");
    ws.on("close", () => {
        console.log("Client disconnected");
    });
});
