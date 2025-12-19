'use client'
import { Map, MapMarker } from "react-kakao-maps-sdk"

function BasicMap() {
  return (
    <Map center={{ lat: 33.5563, lng: 126.79581 }} style={{ width: "100%", height: "100%" }} className="rounded-xl shadow-md border border-gray-200">
      <MapMarker position={{ lat: 33.55635, lng: 126.795841 }}>
        <div style={{ color: "#000" }}>Team.현지현지</div>
      </MapMarker>
    </Map>
  )
}

export default BasicMap