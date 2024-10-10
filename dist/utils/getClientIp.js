"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getClientIp = getClientIp;
function getClientIp(req) {
    let ip = req.headers["user-agent"] ||
        req.headers["x-forwarded-for"] ||
        req.socket.remoteAddress;
    return ip;
}
