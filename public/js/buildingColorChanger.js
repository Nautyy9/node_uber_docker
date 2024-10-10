// import maplibregl from "maplibre-gl"
// const map = new  maplibregl.Map()
import { map } from "./map_location.js"
import { calculateDistance } from "../utils/haversine.js"
const buildingCoords = {
  lon: 77.3338347644949,
  lat: 28.670075616705574,
}

export function updateBuildingColor(userLon, userLat) {
  const distance = calculateDistance(
    userLat,
    userLon,
    buildingCoords.lat,
    buildingCoords.lon
  )
  // console.log("building distance from your current location", distance)
  let color = "rgba(255,0, 0, 0.5)" // Default color for far away
  if (distance < 0.5) {
    // Less than 0.5 km, make it green
    color = "rgba(0, 255, 0, 0.5)"
  } else if (distance < 1) {
    // Less than 1 km, make it yellow
    color = "rgba(255, 255, 0, 0.5)"
  }

  // Update the building's color based on distance
  map.setPaintProperty("building-layer", "circle-color", color)
}
