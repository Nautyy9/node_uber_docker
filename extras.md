📃 map_locations.js

🤔 this click is for when we click on the waypoint

    ⛔ didn't work because this needs the exact location of the waypoint , and ended up with returning last index for no reason
      ⌨
        map.on("click", "maplibre-gl-directions-waypoint", (e) => {
        console.log(e.lngLat, directions.waypoints, "clicked waypoints")
        handleWaypointClick(e, directions.waypoints)
        })

        function handleWaypointClick(event, wayPointsArr) {
        const clickedPoint = [event.lngLat.lng, event.lngLat.lat]

        // Find the clicked waypoint in the waypoints array
        wayPointsArr.forEach((waypoint) => {
        console.log(
        JSON.stringify(waypoint),
        JSON.stringify(clickedPoint),
        JSON.stringify(waypoint) === JSON.stringify(clickedPoint)
        )
        })
        let waypointIndex = wayPointsArr.findIndex(
        (waypoint) => JSON.stringify(waypoint) === JSON.stringify(clickedPoint)
        )
        console.log(waypointIndex)
        // If waypoint is found, remove it
        if (waypointIndex !== -1) {
        // Remove the clicked waypoint
        directions.removeWaypoint(waypointIndex - 1) // Update directions with remaining waypoints
        }
        }

      ⌨ Chatgpt suggested this to get the waypoint but didn't work at all

        map.on("click", (e) => {
        // console.log(e)
        // const features = map.queryRenderedFeatures(e.point, {
        // layers: ["maplibre-gl-directions-waypoint"], // Assuming this is the waypoint layer
        // })
        // console.log(features)
        // const waypointEvent = new MapLibreGlDirectionsWaypointEvent()
        // console.log("waypoint event ", waypointEvent)

      ⌨ Used here

          // if (features.length > 0) {
          // // If the clicked feature is a waypoint, handle the click
          // handleWaypointClick(e)
          // } else {
          // // If it's not a waypoint, you can handle other click events (e.g., adding a waypoint)

// const clickedPoint = [e.lngLat.lng, e.lngLat.lat]
// wayPointsArr.push(clickedPoint)
// directions.setWaypoints(wayPointsArr) // Update with new waypoint
// }
const currClickedLocation = [e.lngLat.lng, e.lngLat.lat]
// console.log(coordinates)
if (directions) {
if (!directions.interactive) {
// handleWaypointClick(e, directions.waypoints)
directions.addWaypoint(currClickedLocation)
}
} else {
alert("Current location is not available yet.")
}
})

// customlayers.forEach((layer) => {
// console.log(map.getLayer(layer.id))
// // layers.push(layer)
// })
// const layers = layersFactory()
// layers.push(totalDistance)

// import MapLibreGlDirections from "@maplibre/maplibre-gl-directions"
// import maplibregl from "maplibre-gl"
// import maplibregl from "https://jspm.dev/maplibre-gl"

directions.on("fetchroutesend", (e) => {
if (e.data) {
const routes = e.data.routes
let routelines = directions.routelines
// console.log(routes, routelines)
if (routelines.length > 0) {
routelines[0].forEach((leg, index) => {
if (leg.properties)
leg.properties.distance = routes[0].legs[index].distance
})
}
console.log(
// directions.configuration,
routes
// directions.snappoints,
// routes[0].legs[0].distance
)
routes[0].legs.forEach((leg, index) => {
console.log(leg, index, leg.distance)
map.setLayoutProperty(
"maplibre-gl-directions-routeline-distance", // Layer ID
"text-field",
`${leg.distance}m`
)
})
// console.log(
// directions.buildRoutelines(
// directions.configuration,
// routes, // The routes object containing distance information
// 0, // Assuming the first route is selected
// directions.snappoints // Snappoints for route snapping
// )
// )
// console.log(routelines)
directions.routelines = routelines
}
})

const features = map.queryRenderedFeatures(e.point, {
layers: ["maplibre-gl-directions-routeline"],
})

if (features.length > 0) {
// When clicked on a route line, get its properties
const clickedRoute = features[0].properties.route
console.log(clickedRoute)
// Update selectedRouteIndex depending on which route was clicked
if (clickedRoute === "ALT_ROUTE") {
selectedRouteIndex = 1 // Alt route clicked
} else if (clickedRoute === "SELECTED") {
selectedRouteIndex = 0 // Main route clicked
}
}
