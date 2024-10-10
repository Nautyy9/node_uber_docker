import map_style from "../data/map_styles.json" assert { type: "json" }

const serverName = localStorage.getItem("serverName")

const mapId = document.getElementById("map_selector")

const fetchLocStatus = document.getElementById("fetch_loc_status")
const map_style_dropdown = document.querySelector(".map_design")

mapId.classList.add("map_selector")
mapId.style.visibility = "hidden"

map_style.features.forEach((feature, styleIndex) => {
  const map_type = document.createElement("div")
  map_type.classList.add("map_type")
  mapId.appendChild(map_type)
  map_type.id = feature.referenceStyleID
  const spans = document.createElement("span")
  spans.id = "span_id"
  map_type.appendChild(spans)
  spans.textContent = feature.name
  spans.classList.add(feature.referenceStyleID)
  const inner_div = document.createElement("div")
  map_type.appendChild(inner_div)
  inner_div.id = "inner_div"
  inner_div.classList.add(feature.referenceStyleID)

  feature.variants.forEach((variant, varIndex) => {
    const options = document.createElement("p")
    options.classList.add("map_options")
    inner_div.appendChild(options)
    options.id = variant.id
    options.textContent = variant.name
    if ((varIndex === styleIndex) === 0) {
      options.selected = true
    }
  })
})

mapId.childNodes.forEach((node) => {
  node.addEventListener("mouseenter", (e) => {
    e.target.childNodes[1].style.visibility = "visible"
  })

  node.addEventListener("mouseleave", (e) => {
    // console.log(e.target.childNodes[1])
    e.target.childNodes[1].style.visibility = "hidden"
  })
  selectMap(node.childNodes[1])
})

function selectMap(node) {
  // const inner_text = document.querySelector("#inner_div")
  // console.log(node)
  if (node) {
    // console.log(node.childNodes)
    node.childNodes.forEach((node) => {
      node.addEventListener("click", (e) => {
        const event = new CustomEvent("mapStyleChange", {
          detail: {
            mapStyle: e.target.id,
          },
        })
        document.dispatchEvent(event)
      })
    })
  }
}

const params = new URLSearchParams({
  serverName: serverName,
})
fetchLocStatus.addEventListener("click", async (e) => {
  if (serverName) {
    const res = await fetch(`/api/status?${params}`)
    const data = await res.json()
    console.log(data)
    // localStorage.setItem("serverName", data.data.serverName)
    alert(data.data)
  } else {
    window.location.replace("/")
  }
})

map_style_dropdown.addEventListener("click", (e) => {
  e.target.classList.toggle("clicked")
  if (e.target.classList.contains("clicked")) {
    mapId.style.visibility = "visible"
  } else {
    mapId.style.visibility = "hidden"
  }
})
