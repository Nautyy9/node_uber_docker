import { PrismaClient } from "@prisma/client"
export const prisma = new PrismaClient({
  log: [
    { level: "warn", emit: "event" },
    { level: "info", emit: "event" },
    { level: "error", emit: "event" },
  ],
  errorFormat: "pretty",
})
prisma.$on("warn", (e) => {
  console.log(e)
})

prisma.$on("info", (e) => {
  console.log(e)
})

prisma.$on("error", (e) => {
  console.log(e)
})
