import { nearbyLocationType } from "../../types"
import { haversine } from "../utils/haversine"
import {
  findLastInsertedLocation,
  insertLocation,
} from "../utils/prismaQueries"

export async function dbInit(
  nearbySchools: nearbyLocationType,
  locData: { lat: string; lng: string; serverName: string; roomName: string }
) {
  const [nearOneName, closestOneDist] = nearbySchools[0]
  let { lat, lng, serverName, roomName } = locData
  const newLat = parseFloat(lat)
  const newLng = parseFloat(lng)
  const nearOneDistance = parseFloat(closestOneDist)
  const user = await findLastInsertedLocation(serverName)
  if (user) {
    const { latitude: prevLat, longitude: prevlng } = user
    if (haversine(prevLat, prevlng, newLat, newLng) > 5) {
      insertLocation({
        serverName,
        roomName,
        newLat,
        newLng,
        nearOneDistance,
        nearOneName,
      })
    }
  } else {
    insertLocation({
      nearOneDistance,
      nearOneName,
      newLat,
      newLng,
      roomName,
      serverName,
    })
  }
  console.log("every 10 seconds until connections is on", nearbySchools[0])
}
