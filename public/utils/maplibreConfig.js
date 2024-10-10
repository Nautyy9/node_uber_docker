import MapLibreGlDirections, {
  utils,
} from "https://unpkg.com/@maplibre/maplibre-gl-directions@0.7.1/dist/maplibre-gl-directions.js"

const sourceName = "maplibre-gl-directions"

export class DistanceMeasurementMapLibreGlDirections extends MapLibreGlDirections {
  constructor(map, configuration) {
    super(map, configuration)
  }

  // here we save the original method to be able to use it in the re-defined one. For some methods (namely those
  // that are defined as methods and not as properties) you can instead call their "super" counterparts, but for the
  // methods as `buildRoutelines` it's impossible due to restrictions implied by the language itself, so that's the
  // only reasonable way to be able to use the original functionality as a part of the re-defined method
  originalBuildRoutelines = utils.buildRoutelines

  // re-defining the original `buildRoutelines` method
  buildRoutelines = (
    requestOptions,
    routes,
    selectedRouteIndex,
    snappoints
  ) => {
    // first we call the original method. It returns the built routelines
    const routelines = this.originalBuildRoutelines(
      requestOptions,
      routes,
      selectedRouteIndex,
      snappoints
    )
    console.log(routelines, routes)
    // then we modify the routelines adding to each route leg a property that stores the leg's distance
    routelines[0].forEach((leg, index) => {
      if (leg.properties)
        leg.properties.distance = routes[0].legs[index].distance
      if (routes.length > 1) {
        for (let i = 1; i < routes.length; i++) {
          console.log(routes[i].legs[index])
          leg.properties.alt_distance = routes[i].legs[index].distance
        }
      }
    })

    // and returning the modified routelines
    return routelines
  }
}
export const config = {
  sourceName,
  layers: [
    {
      id: `${sourceName}-routeline-distance`,
      type: "symbol",
      source: sourceName,
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
    },
    {
      id: `${sourceName}-routeline-alt-distance`,
      type: "symbol",
      source: sourceName,
      layout: {
        "symbol-placement": "line-center",
        "text-field": "{alt_distance}m",
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
    },
  ],
}
