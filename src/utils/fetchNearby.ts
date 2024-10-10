import { nearbyLocationType } from "../../types"
import { client } from "../config/redisClient"
export async function fetchNearby(locationData: { lng: string; lat: string }) {
  const withinRadius = (await client.geosearch(
    "school:nearby",
    "FROMLONLAT",
    parseFloat(locationData.lng),
    parseFloat(locationData.lat),
    "BYRADIUS",
    1,
    "km",
    "ASC",
    "WITHDIST"
  )) as nearbyLocationType

  return withinRadius
}
