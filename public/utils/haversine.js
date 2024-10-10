export function calculateDistance(lat1, lon1, lat2, lon2) {
  if (!lat1 || !lat2 || !lon1 || !lon2) return
  const R = 6371 // Radius of the Earth in kilometers
  const dLat = ((lat2 - lat1) * Math.PI) / 180
  const dLon = ((lon2 - lon1) * Math.PI) / 180
  const a =
    0.5 -
    Math.cos(dLat) / 2 +
    (Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      (1 - Math.cos(dLon))) /
      2

  return R * 2 * Math.asin(Math.sqrt(a)) // Returns distance in kilometers
}

// const radius = 0.5 // 0.5 km (500 meters)

// Function to calculate the bounding box (northwest and southeast corners)
// function getBoundingBox([longitude, latitude], radius) {
//   const earthRadius = 6371 // Earth's radius in kilometers

//   // Calculate coordinates of northwest and southeast corners
//   const deltaLat = (radius / earthRadius) * (180 / Math.PI)
//   const deltaLon =
//     ((radius / earthRadius) * (180 / Math.PI)) /
//     Math.cos((latitude * Math.PI) / 180)

//   const northwest = [longitude - deltaLon, latitude + deltaLat]
//   const southeast = [longitude + deltaLon, latitude - deltaLat]

//   return [northwest, southeast]
// }
