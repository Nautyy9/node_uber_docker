const main = document.getElementById("main")
const button = document.getElementById("btn")
const option = document.getElementById("select_server")
const id = Math.random().toString(16).slice(2)
const rooms = document.querySelectorAll(".room")
var selectedServer = "server1"
// localStorage.setItem("serverName", selectedServer)

// localStorage.setItem("roomName", e.target.value)

function roomClickHandler(e) {
  rooms.forEach((room) => {
    room.classList.remove("selected")
  })
  e.target.classList.add("selected")
  button.removeAttribute("disabled")
  localStorage.setItem("roomName", e.target.innerText)
}

rooms.forEach((item) => {
  item.addEventListener("click", roomClickHandler)
})
const params = new URLSearchParams({
  room: localStorage.getItem("roomName"),
})
async function getMembers() {
  const res = await fetch(`/api/countMembers`)
  const data = await res.json()
  const allRooms = data.count
  console.log(allRooms)
  allRooms.forEach((data) => {
    data.name
    if (data._count.user === 4) {
      rooms.forEach((room) => {
        if (room.innerText === data.name) {
          room.classList.add("filled")
          room.removeEventListener("click", roomClickHandler)
        }
      })
    }
  })
}

getMembers()
// room..addEventListener("click", (e) => {
//   console.log(e.target)
// })

// select_server.onchange = (e) => {
//   localStorage.setItem("serverName", e.target.value)
// }
// console.log(window.location.href)
button.addEventListener("click", async (e) => {
  // window.location.replace("file")
  const room = localStorage.getItem("roomName")
  console.log(room, params)
  if (room) {
    try {
      const res = await fetch(`/api/user?${params}`)
      const obj = await res.json()
      console.log(obj)
      if (obj.error) {
        alert(obj.error)
      } else {
        localStorage.setItem("partitionId", obj.user.partitionId)
        localStorage.setItem("serverName", obj.user.name)
        localStorage.setItem("roomName", obj.user.room.name)
        window.location.replace("file")
      }
    } catch (err) {
      console.log("err from server", err)
    }
  } else {
    alert("Please select a room ")
  }
})
