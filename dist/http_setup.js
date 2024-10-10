"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.sslServer = void 0;
const https_1 = __importDefault(require("https"));
const express_1 = __importDefault(require("express"));
const fs_1 = __importDefault(require("fs"));
const api_route_1 = require("./routes/api_route");
const app = (0, express_1.default)();
const sslServer = https_1.default.createServer({
    cert: fs_1.default.readFileSync("nginx/certs/selfsigned.crt"),
    key: fs_1.default.readFileSync("nginx/certs/selfsigned.key"),
}, app);
exports.sslServer = sslServer;
app.use("/file", express_1.default.static("public"));
app.use(express_1.default.json());
app.use("/route", api_route_1.route);
app.get("/", (req, res) => {
    res.status(200).send("sdhfkaj");
});
app.get("/location", (req, res) => {
    console.log(`Location request received from ${req.ip}`);
    res.send("Location logged");
});
