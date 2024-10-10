import "./map_styles.js"
import { geocoderApi } from "./geocodeApi.js"
let control
let position = "top-left"

import MapLibreGlDirections, {
  layersFactory,
  LoadingIndicatorControl,
  // MapLibreGlDirectionsWaypointEvent,
} from "https://unpkg.com/@maplibre/maplibre-gl-directions@0.7.1/dist/maplibre-gl-directions.js"
import { addSourceAndLayer } from "./sourceAndLayer.js"
import { customlayers } from "../assets/layers.js"

import {
  DistanceMeasurementMapLibreGlDirections,
  config,
} from "../utils/maplibreConfig.js"
const deleteWaypoint = document.getElementById("delete_waypoint")
let mainRouteDist = 0
let altRouteDist = 0
let directions
let isDirectionEnabled = false
let coordinates
let currentPos
const alt_dist = document.getElementById("alt_dist")
const ttl_dist = document.getElementById("ttl_dist")

let map = new maplibregl.Map({
  container: "map",
  style: "/data/style.json",
  center: [77.17963074061198, 28.76468852400598], // Default map center
  zoom: 12,
  attributionControl: false,
  attributionControl: {
    compact: true,

    customAttribution: [
      "Map By ME",
      "<a href='http://project-osrm.org/' target='_blank' rel='noreferrer'>&copy; OSRM</a>",
    ],
  },
})

var marker = new maplibregl.Marker({
  draggable: true,
})
  .setLngLat([77.17963074061198, 28.76468852400598])
  .addTo(map)
let geolocate = new maplibregl.GeolocateControl({
  positionOptions: {
    enableHighAccuracy: true,
  },
  trackUserLocation: true,
})

geolocate.on("trackuserlocationend", (msg) => {
  const trackingStopped = new CustomEvent("trackingOff", {
    detail: {
      message: `User has stopped location tracking. ${msg}`,
    },
  })
  document.dispatchEvent(trackingStopped)

  // console.log("A trackuserlocationend event has occurred.", msg)
})
geolocate.on("trackuserlocationstart", (msg) => {
  if (directions) {
    directions.interactive = false
    // console.log(directions.waypoints)
  }
  console.log("A trackuserlocationstart event has occurred.", msg)
})
// geolocate.on("userlocationlostfocus", function (err) {
//   console.log("An userlocationlostfocus event has occurred.", err)
// })

geolocate.on("geolocate", (data) => {
  coordinates = [data.coords.longitude, data.coords.latitude]

  // map.setZoom(16)

  const userLocation = new CustomEvent("userCoords", {
    detail: {
      userCoords: coordinates,
    },
  })
  document.dispatchEvent(userLocation)
})
geolocate.on("error", () => {
  console.log("An error event has occurred.")
})
geolocate.on("outofmaxbounds", () => {
  console.log("An outofmaxbounds event has occurred.")
})

map.on("load", () => {
  // selectStyle()
  // map.addControl(nav, "top-right")
  map.addControl(
    new MaplibreGeocoder(geocoderApi, {
      maplibregl,
    })
  )
  map.addControl(new maplibregl.NavigationControl({}))
  // nav.options.showCompass = true

  map.addControl(geolocate)
  // map.setLayoutProperty("label_country", "text-field", ["get", "name:in"])
  map.addControl(new maplibregl.FullscreenControl())
  geolocate.trigger()
  directionInit()
  isDirectionEnabled = true
})

function wayPoints() {
  // directions.addWaypoint([0,0], 0)

  map.hasControl()
  isDirectionEnabled = true
  if (!directions.interactive) {
    directions.setWaypoints([])
  }
  directions.interactive = true
  directions.hoverable = true
  directions.allowRouteSwitch = true
  // console.log("inside waypoints")
  directions.on("addwaypoint", (e) => {
    // if (directions.waypoints.length > 1) {
    //   console.log(Route, Snappoint, Directions)
    // }
  })
  directions.on("removewaypoint", (e) => {
    if (directions.waypoints.length < 2) {
      mainRouteDist = 0
      altRouteDist = 0
      ttl_dist.innerText = 0 + "m"
      alt_dist.innerText = 0 + "m"
    }
  })

  directions.on("fetchroutesstart", (e) => {
    // if (directions.waypoints > 0) {
    //   directions.clear()
    // }
    console.log("waypoint fetchroutesstart event:", e)
  })

  directions.on("fetchroutesend", (e) => {
    if (e.data) {
      console.log(e.data.routes[0].distance)
      mainRouteDist = e.data.routes[0].distance
      if (e.data.routes.length > 1) {
        altRouteDist = e.data.routes[1].distance
      } else {
        altRouteDist = e.data.routes[0].distance
        if (altRouteDist === mainRouteDist) {
          altRouteDist = 0
        }
      }
      alt_dist.innerText = altRouteDist + "m"
      ttl_dist.innerText = mainRouteDist + "m"
    }
  })
  addSourceAndLayer(map)
  if (control && map.hasControl(control)) map.removeControl(control)

  control = new LoadingIndicatorControl(directions, {
    class: "m-10",
    fill: "#ffffff",
    size: "30px",
  })
  map.addControl(control, position)
}
map.on("click", (e) => {
  const currClickedLocation = [e.lngLat.lng, e.lngLat.lat]

  if (directions) {
    if (!directions.interactive) {
      // handleWaypointClick(e, directions.waypoints)
      directions.addWaypoint(currClickedLocation)
    }
  } else {
    alert("Current location is not available yet.")
  }
})

map.on("styledata", () => {
  if (!isDirectionEnabled || map.getSource("maplibre-gl-directions")) return // Properly destroy the existing directions control
  directionInit()
})

map.on("click", ["schools", "mini_place_near_me"], (e) => {
  // The event object (e) contains information like the
  // coordinates of the point on the map that was clicked.
  new maplibregl.Popup()
    .setLngLat(e.lngLat)
    .setHTML(e.features[0].properties.name)
    .addTo(map)
})

function onDragEnd() {
  const lngLat = marker.getLngLat()
  console.log(lngLat.lat, lngLat.lng)
}

marker.on("dragend", onDragEnd)

document.addEventListener("mapStyleChange", (e) => {
  // console.log(e.detail.mapStyle)
  map.setStyle(
    `https://api.maptiler.com/maps/${e.detail.mapStyle}/style.json?key=SwRQy8QYVZuRo0d80WfK`
  )
  map.once("styledata", () => {
    directionInit()
  })
})

function directionInit() {
  directions = new DistanceMeasurementMapLibreGlDirections(map, {
    api: "https://router.project-osrm.org/route/v1",
    profile: "driving",
    // makePostRequest: true,
    requestOptions: {
      alternatives: "true",
      // annotations: annotations,
      // overview: "full",
    },
    customlayers,
    config,
    sensitiveWaypointLayers: ["maplibre-gl-directions-waypoint"],
    sensitiveSnappointLayers: ["maplibre-gl-directions-snappoint"],
    sensitiveRoutelineLayers: ["maplibre-gl-directions-routeline"],
    sensitiveAltRoutelineLayers: ["maplibre-gl-directions-alt-routeline"],
  })

  if (directions) {
    wayPoints()
  }
}

function updateLiveLocation(newLocation) {
  currentPos = newLocation
  console.log("Updating live location:", currentPos)

  if (directions) {
    directions
      .removeWaypoint(0) // Remove current live location at index 0
      .then(() => {
        directions.addWaypoint(currentPos, 0) // Add updated live location at index 0
      })
      .catch((e) => console.log(e))
  }
}

deleteWaypoint.addEventListener("click", async (e) => {
  if (directions && !directions.interactive) {
    if (directions.waypoints.length > 1) {
      directions.removeWaypoint(-1)
    }
  } else {
    if (directions.waypoints.length > 0) {
      directions.removeWaypoint(-1)
    }
  }
})

export { map, directions }
