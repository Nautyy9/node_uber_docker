export type locationType = {
  lng: string
  lat: string
  roomName: string
  serverName: string
}

export type nearbyLocationType = Array<Array<string>>

export type prismaDataType = {
  serverName: string
  newLat: number
  roomName: string
  newLng: number
  nearOneDistance: number
  nearOneName: string
}

export type serverSwitchType = {
  serverName: string
  message: string
}

export type dbLocationType = {
  id: string
  latitude: number
  longitude: number
  nearOneName: string
  nearOneDistance: number
  timestamp: Date
  userId: string
} | null
