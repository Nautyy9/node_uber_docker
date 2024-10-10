import { Kafka } from "kafkajs"
const kafka = new Kafka({
  clientId: "custom_map",
  brokers: ["kafka:9092"],
})

export { kafka }
