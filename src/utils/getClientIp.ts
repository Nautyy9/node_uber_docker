export function getClientIp(req: any) {
  let ip: string =
    req.headers["user-agent"] ||
    req.headers["x-forwarded-for"] ||
    req.socket.remoteAddress
  return ip
}
