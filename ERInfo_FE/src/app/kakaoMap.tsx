'use client'
import { useEffect, useState } from "react"
import { Map, MapMarker, Polygon } from "react-kakao-maps-sdk"

function BasicMap() {
  const busan_bounds = {
    sw: { lat: 34.88, lng: 128.83 },
    ne: { lat: 35.39, lng: 129.35 }
  }

  function isOutOfBusan(lat: number, lng: number) {
    return (
      lat < busan_bounds.sw.lat ||
      lat > busan_bounds.ne.lat ||
      lng < busan_bounds.sw.lng ||
      lng > busan_bounds.ne.lng
    )
  }

  useEffect(() => {

  }, [])

  return (
    <Map center={{ lat: 35.1796, lng: 129.0756 }} minLevel={9} style={{ width: "100%", height: "100%" }}
         onDragEnd={map => {
           const center = map.getCenter()
           const lat = center.getLat()
           const lng = center.getLng()

           if(isOutOfBusan(lat, lng)) {
             map.setCenter(new kakao.maps.LatLng(35.1796, 129.0756))
           }}}
         className="rounded-xl shadow-md border border-gray-200">
      <MapMarker position={{ lat: 35.1796, lng: 129.0756 }}>
        <div style={{ color: "#000" }}>현지현지</div>
      </MapMarker>
    </Map>
  )
}

export default BasicMap