// import { resetOnce } from "../utils/fetchInInterval.js"
import { calculateDistance } from "../utils/haversine.js"
import { updateBuildingColor } from "./buildingColorChanger.js"
// import { Map } from "maplibre-gl"
// const map = new Map()
import { directions, map } from "./map_location.js"
import { once } from "../utils/once.js"
let geojsonData = {
  type: "FeatureCollection",
  features: [],
}
let currentPos
// let lastUpdateTime = 0
// const throttleTime = 1000
let serverName = localStorage.getItem("serverName")
let roomName = localStorage.getItem("roomName")
let partitionId = localStorage.getItem("partitionId")
const clear_waypoints = document.getElementById("clear_waypoints")
let isLocationEnabled = false // Track if the user's location services are enabled

const userLocations = new Map()
const serverCoords = new Map()

function checkInitialGeolocation() {
  navigator.geolocation.getCurrentPosition(
    (position) => {
      // User has location services enabled
      isLocationEnabled = true
    },
    (error) => {
      // User's location services are disabled or permission is denied
      if (error.code === error.PERMISSION_DENIED) {
        alert(
          "Location services are disabled. Please enable location services to continue."
        )
      }
    }
  )
}

checkInitialGeolocation()

if (!roomName || !serverName || !partitionId) {
  alert("please select the room ")
  window.location.replace("/")
}

const ws = new WebSocket("wss://192.168.29.142:8080")

ws.onopen = (msg) => {
  console.log("Connected to WebSocket server", msg)
}

ws.onclose = (msg) => {
  console.log("Disconnected from WebSocket server", msg)
}

ws.onerror = (error) => {
  console.log("WebSocket error:", error)
}

if (navigator.geolocation) {
  fetchUserLocation()
} else {
  alert("Geolocation is not supported by your browser")
}

function fetchUserLocation() {
  navigator.geolocation.watchPosition(
    () => {},
    (error) => {
      alert(error)
    },
    { enableHighAccuracy: true, maximumAge: 0, timeout: 10000 }
  )
}

document.addEventListener("userCoords", (e) => {
  const longitude = e.detail.userCoords[0]
  const latitude = e.detail.userCoords[1]
  updateBuildingColor(longitude, latitude)
  if (ws.readyState === WebSocket.OPEN) {
    // console.log(serverName, partitionId, "name , id")
    ws.send(
      JSON.stringify({
        lat: latitude,
        lng: longitude,
        serverName,
        roomName,
        partitionId,
      })
    )
  } else {
    console.error("WebSocket is not open, current state: ", ws.readyState)
  }
  // console.log("received by custom event and send to the server")
})

document.addEventListener("trackingOff", (e) => {
  if (!isLocationEnabled) {
    ws.close(1005, "Location service not found or unavailable")
  } else {
    ws.send(JSON.stringify({ serverName, message: `stopped sending` }))
  }
})

function addUsers(dataSendingServer, coordinates, id) {
  // const coords = [data["locationData"]["lng"], data["locationData"]["lat"]]
  if (directions) {
    // console.log(directions.waypoints)
    if (currentPos) {
      const distance = calculateDistance(
        currentPos[1],
        currentPos[0],
        coordinates[1],
        coordinates[0]
      )
      if (distance > 0.001) {
        updateLiveLocation(coordinates, id)
      }
    } else {
      updateLiveLocation(coordinates, id)
    }
  }
  // const source = map.getSource("user_loc")
  // const featuresData = source._data
  // // console.log(featuresData, dataSendingServer, "source data")
  // const featureExists = featuresData.features.some(
  //   (feature) =>
  //     feature.properties && feature.properties.name === dataSendingServer
  // )

  // if (!featureExists) {
  //   const coords = [data["locationData"]["lng"], data["locationData"]["lat"]]

  //   const json = {
  //     type: "Feature",
  //     properties: {
  //       name: dataSendingServer,
  //     },
  //     geometry: {
  //       type: "Point",
  //       coordinates: coords,
  //     },
  //   }
  //   geojsonData.features.push(json)
  //   if (source) {
  //     source.setData(geojsonData)
  //   }
  // }
}
function paintSchool(data) {
  // console.log(data, "from school")
  let expression = ["case"]
  let color = "rgba(128, 128, 128, 0.4)"
  data["nearbySchools"].forEach((place) => {
    if (parseFloat(place[1]) < 0.5) {
      color = "rgba(0, 255, 0, 0.4)" // Green for distances < 0.5 km
    } else if (parseFloat(place[1]) < 1) {
      color = "rgba(255, 255, 0, 0.4)" // Yellow for distances < 1 km
    }
    expression.push(["==", ["get", "name"], place[0]]) // Check if the feature's name matches
    expression.push(color) // Assign the corresponding color
  })
  expression.push("rgba(128, 128, 128, 0.4)")
  map.setPaintProperty("schools", "fill-color", expression)
}

ws.onmessage = async (msg) => {
  const data = JSON.parse(msg.data.toString("utf-8"))
  console.log("data received by ws on message ", data)
  const dataSendingServer = data["locationData"]["serverName"]
  const id = parseInt(data.locationData.partitionId)
  const coordinates = [data["locationData"]["lng"], data["locationData"]["lat"]]
  serverCoords.set(dataSendingServer, {
    coords: coordinates,
  })
  // if (dataSendingServer === serverName) {

  // } else {
  //   addUsers(dataSendingServer, coordinates, id)
  // }

  //! so i was thinking of creating a function that will be called every 3seconds to check if the distance difference is more than 50meters which is unreliable bcz for multiple servers it will be called every time which might be inefficiency
  //! instead of that we can use a timestamp within the map value object to check if the time elapsed is greater than 3 sec then it will check and update individual values
  // const fetchOsrm = resetOnce(computeLocation(data["locationData"]))
  const fetchOsrm = computeLocation(data["locationData"])
  const keysNum = [...userLocations.keys()].length
  // console.log(fetchOsrm, keysNum)
  if (fetchOsrm && keysNum > 1) {
    await wait(fetchOsrmData)
  }
  if (keysNum) {
    once(function () {
      directions.clear()
      directions.interative = false
      // directions.setWaypoints([[], [], [], []])
    })
    const [serverNameIndex, coords] = getLiveCoordsWithIndex(dataSendingServer)
    updateWaypoint(coords, serverNameIndex)
  }
  paintSchool(data)
}
async function wait(fn) {
  return new Promise((resolve, reject) => {
    setTimeout(resolve(fn.call({})), 2000)
  })
}

async function fetchOsrmData() {
  // timpassed += 1
  // console.log(timpassed)
  const allServer = [...userLocations.entries()]
  // console.log("inside fetchOsrmData ", allServer)
  const startLocation = []
  const endLocations = []
  for (let [key, value] of allServer) {
    // console.log(key, value, "inside fetchOsrmData checking all entries ")
    if (key !== serverName) {
      endLocations.push([value.lng, value.lat])
    } else {
      startLocation.push(value.lng, value.lat)
    }
  }
  try {
    console.log("startLocation", startLocation, "endLocation", endLocations)
    if (startLocation.length > 0 && endLocations.length > 0) {
      const driving = await fetch(
        `https://router.project-osrm.org/route/v1/driving/${startLocation.join(
          ","
        )};${endLocations
          .map((coords) => coords.join(","))
          .join(";")}?geometries=geojson`,
        {
          mode: "cors",
          // signal: controller.signal,
        }
      )

      const drivingData = await driving.json()
      // console.log("drivingData", drivingData)
      updateRouteLine(drivingData)
    }
  } catch (err) {
    console.log("error", err)
  }
}

function computeLocation(location) {
  const existingLocation = userLocations.get(location.serverName)
  // console.log(existingLocation, Date.now() - existingLocation?.timestamp)
  if (existingLocation) {
    const distance = calculateDistance(
      existingLocation.lat,
      existingLocation.lng,
      location.lat,
      location.lng
    )
    // console.log(
    //   "inside compute location ",
    //   distance,
    //   Date.now(),
    //   existingLocation.timestamp,
    //   Date.now() - existingLocation.timestamp
    // )
    // console.log(distance > 0.001)
    if (distance > 0.005 && Date.now() - existingLocation.timestamp >= 3000) {
      // console.log("updated the existing location")
      userLocations.set(location["serverName"], {
        lat: location["lat"],
        lng: location["lng"],
        timestamp: Date.now(),
      })
      return true
    }
  } else {
    //very first time
    userLocations.set(location["serverName"], {
      lat: location["lat"],
      lng: location["lng"],
      timestamp: Date.now(),
    })
    return true
  }
  return false
}

function updateRouteLine(routeData) {
  // console.log("from api wrong format", routeData)
  if (routeData && routeData.routes && routeData.routes.length > 0) {
    const routeCoords = routeData.routes[0].geometry.coordinates
    // console.log("from appii right format: ", routeCoords)
    map.getSource("lineStrip").setData({
      type: "FeatureCollection",
      features: [
        {
          type: "Feature",
          geometry: {
            type: "LineString",
            coordinates: routeCoords,
          },
        },
      ],
    })
  }
}

function updateWaypoint(coordinates, id) {
  if (directions) {
    // console.log(directions.waypoints)
    if (currentPos) {
      const distance = calculateDistance(
        currentPos[1],
        currentPos[0],
        coordinates[1],
        coordinates[0]
      )
      console.log(distance, "haversine distance")
      if (distance > 0.005) {
        updateLiveLocation(coordinates, id)
      }
    } else {
      updateLiveLocation(coordinates, id)
    }
  }
}

function updateLiveLocation(newLocation, id) {
  currentPos = newLocation
  console.log("Updating live location:", directions.waypoints, id)

  if (directions) {
    if (directions.waypoints[id]) {
      directions.removeWaypoint(id) // Remove current live location at index 0
    }
    directions.addWaypoint(currentPos, id) // Add updated live location at index 0
  }
}

function getLiveCoordsWithIndex(name) {
  const currSever = [...serverCoords.entries()]
  const serverNameIndex = currSever.findIndex((item) => item.includes(name))
  const currCords = serverCoords.get(name)
  return [serverNameIndex, currCords.coords]
}

clear_waypoints.addEventListener("click", () => {
  if (directions) {
    directions.clear()
    const [index, coords] = getLiveCoordsWithIndex(serverName)
    updateLiveLocation(coords, index)
  } else {
    alert("Click anywhere on map to add a location ")
  }
})
