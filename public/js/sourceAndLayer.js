import geodata from "../data/geojson_data.json" assert { type: "json" }
import schooldata from "../data/school_data.json" assert { type: "json" }
import schoolPoints from "../data/school_pointer_data.json" assert { type: "json" }
import { color } from "../utils/randomColor.js"
import { currentColor, pulsingDot } from "./pulsingDot.js"
// import maplibregl from "maplibre-gl"
// const map = new maplibregl.Map({})
const buildingCoords = {
  lon: 77.3338347644949,
  lat: 28.670075616705574,
}
const sourceName = "maplibre-gl-directions"
export function addSourceAndLayer(map) {
  console.log("changed")
  if (!map.getSource("local_region") || !map.getSource("school_nearby")) {
    map.addSource("local_region", {
      type: "geojson",
      data: geodata,
    })
    map.addSource("school_nearby", {
      type: "geojson",
      data: schooldata,
    })
    map.addLayer({
      id: "schools",
      type: "fill",
      source: "school_nearby",
      paint: {
        "fill-color": "rgba(128, 128, 128, 0.4)",
        "fill-outline-color": "rgba(128, 128, 128, 1)",
      },
    })

    map.addLayer({
      id: "mini_place_near_me",
      type: "fill",
      source: "local_region",
      paint: {
        "fill-color": "rgba(200, 100, 240, 0.4)",
        "fill-outline-color": "rgba(200, 100, 240, 1)",
      },
    })
  }
  if (!map.getSource("building")) {
    map.addSource("building", {
      type: "geojson",
      data: {
        type: "FeatureCollection",
        features: [
          {
            type: "Feature",
            properties: {
              name: "Building",
            },
            geometry: {
              type: "Point",
              coordinates: [buildingCoords.lon, buildingCoords.lat],
            },
          },
        ],
      },
    })

    map.addLayer({
      id: "building-layer",
      type: "circle",
      source: "building",
      paint: {
        "circle-radius": 10,
        "circle-color": "rgba(255, 0, 0 ,0.5)", // Initial color
      },
    })
    map.addSource("school_points", {
      type: "geojson",
      data: schoolPoints,
    })
    map.addLayer({
      id: "places-layer",
      type: "circle",
      source: "school_points",
      paint: {
        "circle-radius": 10,
        "circle-color": "rgba(225, 225 ,225, 0.5)",
      },
    })
  }
  if (!map.getImage("pulsing-dot")) {
    map.addImage("pulsing-dot", pulsingDot, { pixelRatio: 2 })
  }
  if (!map.getSource("user_loc")) {
    map.addSource("user_loc", {
      type: "geojson",
      data: {
        type: "FeatureCollection",
        features: [],
      },
    })
    map.addLayer({
      id: "pulse",
      type: "symbol",
      source: "user_loc",
      layout: {
        "icon-image": "pulsing-dot",
      },
    })
  }
  if (!map.getSource("lineStrip")) {
    map.addSource("lineStrip", {
      type: "geojson",
      data: {
        type: "FeatureCollection",
        features: [],
      },
    })
    map.addLayer({
      id: "trace",
      type: "line",
      source: "lineStrip",
      layout: {
        "line-join": "round",
        "line-cap": "round",
      },
      paint: {
        "line-color": color,
        // "line-opacity": 0.6,
        "line-width": 6,
      },
    })
  }
  // console.log(
  //   "layer--->",
  //   map.getLayer("maplibre-gl-directions-waypoint"),
  //   map.getLayer("maplibre-gl-directions-routeline")
  // )
  if (
    map.getLayer("maplibre-gl-directions-waypoint") &&
    map.getLayer("maplibre-gl-directions-routeline")
  ) {
    map.removeLayer("maplibre-gl-directions-waypoint")
    // map.removeLayer("maplibre-gl-directions-alt-routeline")
    map.removeLayer("maplibre-gl-directions-routeline")

    map.addLayer({
      id: "maplibre-gl-directions-waypoint",
      type: "symbol",
      source: sourceName,
      layout: {
        "icon-image": "pulsing-dot",
        // "icon-anchor": "bottom",
        // "icon-ignore-placement": true,
        // "icon-overlap": "always",
      },
      filter: ["==", ["get", "type"], "WAYPOINT"],
    })

    // map.addLayer({
    //   id: "maplibre-gl-directions-alt-routeline",
    //   type: "line",
    //   source: "maplibre-gl-directions",
    //   layout: {
    //     "line-cap": "butt",
    //     "line-join": "round",
    //   },
    //   paint: {
    //     "line-color": currentColor,
    //     "line-width": 8,
    //     "line-opacity": 0.5,
    //   },
    //   filter: ["==", ["get", "route"], "ALT"],
    // })
    map.addLayer({
      id: "maplibre-gl-directions-routeline",
      type: "line",
      source: sourceName,
      layout: {
        "line-cap": "butt",
        "line-join": "round",
      },
      paint: {
        "line-color": currentColor,
        "line-width": 8,
        "line-opacity": 0.8,
        // "line-dasharray": [1, 2],
      },
      filter: ["==", ["get", "route"], "SELECTED"],
    })
    // console.log("source--->", map.getSource("maplibre-gl-directions"))
  } else {
    map.addLayer({
      id: "maplibre-gl-directions-waypoint",
      type: "symbol",
      source: sourceName,
      layout: {
        "icon-image": "pulsing-dot",
        // "icon-anchor": "bottom",
        // "icon-ignore-placement": true,
        // "icon-overlap": "always",
      },
      filter: ["==", ["get", "type"], "WAYPOINT"],
    })
    // map.addLayer({
    //   id: "maplibre-gl-directions-alt-routeline",
    //   type: "line",
    //   source: "maplibre-gl-directions",
    //   layout: {
    //     "line-cap": "butt",
    //     "line-join": "round",
    //   },
    //   paint: {
    //     "line-color": currentColor,
    //     "line-width": 8,
    //     "line-opacity": 0.5,
    //   },
    //   filter: ["==", ["get", "route"], "ALT"],
    // })
    map.addLayer({
      id: "maplibre-gl-directions-routeline",
      type: "line",
      source: sourceName,
      layout: {
        "line-cap": "butt",
        "line-join": "round",
      },
      paint: {
        "line-color": currentColor,
        "line-width": 8,
        "line-opacity": 0.8,
        // "line-dasharray": [1, 2],
      },
      filter: ["==", ["get", "route"], "SELECTED"],
    })
  }
  if (!map.getLayer("maplibre-gl-directions-routeline-distance")) {
    map.addLayer({
      id: "maplibre-gl-directions-routeline-distance",
      type: "symbol",
      source: "maplibre-gl-directions",
      layout: {
        "symbol-placement": "line-center",
        "text-field": "{distance}m",
        "text-size": 16,
        "text-ignore-placement": true,
        "text-allow-overlap": true,
        "text-overlap": "always",
      },
      paint: {
        "text-color": "#212121",
        "text-halo-color": "#ffffff",
        "text-halo-width": 1,
      },
      filter: ["==", ["get", "route"], "SELECTED"],
    })
  }
}
