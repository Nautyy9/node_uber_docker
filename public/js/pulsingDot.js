import { color } from "../utils/randomColor.js"
import { map } from "./map_location.js"

const size = 100

// const getRandomColor = () => {
//   return
// }
export let currentColor = color

export const pulsingDot = {
  currentColor,
  width: size,
  height: size,
  data: new Uint8Array(size * size * 4),

  // get rendering context for the map canvas when layer is added to the map
  onAdd() {
    const canvas = document.createElement("canvas")
    canvas.width = this.width
    canvas.height = this.height
    this.context = canvas.getContext("2d")
  },
  render() {
    const duration = 1000
    const t = (performance.now() % duration) / duration

    const radius = (size / 2) * 0.3
    const outerRadius = (size / 2) * 0.7 * t + radius
    const context = this.context

    // draw outer circle
    context.clearRect(0, 0, this.width, this.height)
    context.beginPath()
    context.arc(this.width / 2, this.height / 2, outerRadius, 0, Math.PI * 2)
    context.fillStyle = this.currentColor.slice(0, -2) + (1 - t)
    context.fill()

    // draw inner circle
    context.beginPath()
    context.arc(this.width / 2, this.height / 2, radius, 0, Math.PI * 2)
    context.fillStyle = this.currentColor
    context.strokeStyle = "white"
    context.lineWidth = 2 + 4 * (1 - t)
    context.fill()
    context.stroke()

    // update this image's data with data from the canvas
    this.data = context.getImageData(0, 0, this.width, this.height).data

    // continuously repaint the map, resulting in the smooth animation of the dot
    map.triggerRepaint()

    // return `true` to let the map know that the image was updated
    return true
  },
}
