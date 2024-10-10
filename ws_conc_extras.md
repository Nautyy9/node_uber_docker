    🗒️
      function fetchUserLocation() {
      navigator.geolocation.watchPosition(
      locationFound,
      (error) => {
      alert(error)
      },
      { enableHighAccuracy: true, maximumAge: 0, timeout: 10000 }
      )
      }
      function locationFound(position) {
      const { latitude, longitude } = position.coords
      ! don't do this for the system having gps else the pan|drag event will come back to same position again and again
      map.setCenter([longitude, latitude])
      console.log("geolocation api -> live coords", longitude, latitude)
      updateBuildingColor(longitude, latitude)
      }

    🗒️
        function addUser() {
        const currentTime = new Date().getTime()
        const index = parseInt(dataSendingServer.slice(-1)) - 1
        if (currentTime - lastUpdateTime >= throttleTime) {
          if (index >= 0 && index < 4) {
            // console.log("waypointssssssssssssss:", directions?.waypoints)
            if (directions.waypoints[index]) {
              directions?.removeWaypoint(index)
            }
            directions?.addWaypoint(
              [data["locationData"]["lng"], data["locationData"]["lat"]],
              index
            )
          }
        }
        }



    🗒️
       const svg = d3.select(map.getCanvasContainer()).append("svg")
       const g = svg.append("g").attr("class", "route-path")

       // Create an initial line with no points (empty line)
       const line = g
       .append("path")
       .datum([]) // Initial data is an empty array
       .attr("fill", "none")
       .attr("stroke", "#ff0000")
       .attr("stroke-width", 15)
      function updateRouteLine(routeData) {
      // d3Line(routeCoords)
      }

      function d3Line(newCoordinates) {
      const projectedPoints = newCoordinates.map(projectPoint)

          Update the line's data and smoothly transition it

      console.log("d3 projected points : ", projectedPoints)
      line
      .datum(projectedPoints)
      .transition()
      .duration(1000) // Adjust the duration as needed
      .attr("d", d3.line()(projectedPoints))
      }
      function projectPoint([lng, lat]) {
      const point = map.project([lng, lat])
      return [point.x, point.y]
      }
      async function fetchWithRetry(url, options, retries = 5, delay = 10000) {
      for (let i = 0; i < retries; i++) {
      try {
      const response = await fetch(url, options)
      if (!response.ok) {
      throw new Error(`HTTP Error: ${response.status}`)
      }
      return await response.json()
      } catch (error) {
      if (i === retries - 1) throw error
      console.log(`Retrying request (${i + 1}/${retries})...`)
      await new Promise((res) => setTimeout(res, delay))
      }
      }

}

    🗒️
      const car = await fetch(
      `https://router.project-osrm.org/route/v1/driving/${startLocation.join(
                ","
              )};${endLocations
                .map((coords) => coords.join(","))
                .join(";")}?geometries=geojson`,
      {
      headers: {
      "Content-Type": "application/json",
      // "Access-Control-Allow-Header": "Accept",
      // "Access-Control-Allow-Origin": "_",
      },
      method: "GET",
      // mode: "cors",
      }
      )
      const bike = await fetch(
      `https://router.project-osrm.org/route/v1/bike/${startLocation.join(
                ","
              )};${endLocations
                .map((coords) => coords.join(","))
                .join(";")}?geometries=geojson`,
      {
      headers: {
      "Content-Type": "application/json",
      // "Access-Control-Allow-Header": "Accept",
      // "Access-Control-Allow-Origin": "_",
      },
      method: "GET",
      // mode: "cors",
      }
      )
      const walk = await fetch(
      `https://router.project-osrm.org/route/v1/walk/${startLocation.join(
                ","
              )};${endLocations
                .map((coords) => coords.join(","))
                .join(";")}?geometries=geojson`,
      {
      headers: {
      "Content-Type": "application/json",
      // "Access-Control-Allow-Header": "Accept",
      // "Access-Control-Allow-Origin": "\*",
      },
      // mode: "cors",
      }
      )
      if (
      (await driving.json()) &&
      (await car.json()) &&
      (await bike.json()) &&
      (await walk.json())
      )
       const carData = await car.json()
       const bikeData = await bike.json()
       const walkData = await walk.json()
