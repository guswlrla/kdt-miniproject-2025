'use client'
import { useEffect, useState } from "react"
import { Map, MapMarker, Polygon } from "react-kakao-maps-sdk"

type GeoJSON = {
  features: {
    geometry: {
      type: "Polygon" | "MultiPolygon"
      coordinates: any
    }
  }[]
}

export default function BasicMap() {
  const bounds = {
    sw: { lat: 33.0, lng: 124.0 },
    ne: { lat: 39.0, lng: 132.0 }
  };
  const [paths, setPaths] = useState<{ lat: number; lng: number }[][]>([]);
  const [isMouseOver, setIsMouseOver] = useState(false); 

  function isOutOf(lat: number, lng: number) {
    return (
      lat < bounds.sw.lat ||
      lat > bounds.ne.lat ||
      lng < bounds.sw.lng ||
      lng > bounds.ne.lng
    )
  }

  useEffect(() => {
    async function loadGeo() {
      const res = await fetch("/sido.json")
      const data: GeoJSON = await res.json()

      const converted: { lat: number; lng: number }[][] = []

      data.features.forEach(feature => {
        const { type, coordinates } = feature.geometry

        if (type === "Polygon") {
          coordinates.forEach((ring: number[][]) => {
            converted.push(
              ring.map(([lng, lat]) => ({ lat, lng }))
            )
          })
        }

        if (type === "MultiPolygon") {
          coordinates.forEach((polygon: number[][][]) => {
            polygon.forEach(ring => {
              converted.push(
                ring.map(([lng, lat]) => ({ lat, lng }))
              )
            })
          })
        }
      })

      setPaths(converted)
    }

    loadGeo()
  }, [])

  return (
    <Map center={{ lat: 36.5, lng: 127.5 }} level={12} minLevel={13} style={{ width: "100%", height: "100%" }}
         onDragEnd={map => {
           const center = map.getCenter()
           const lat = center.getLat()
           const lng = center.getLng()

           if(isOutOf(lat, lng)) {
             map.setCenter(new kakao.maps.LatLng(35.1796, 129.0756))
         }}}
         className="rounded-xl shadow-md border border-gray-200">
      {paths.map((path, idx) => (
      <Polygon key={idx} path={path} strokeWeight={2} strokeColor="#004c80" strokeOpacity={0.8} fillColor={isMouseOver ? "#A2FF99" : "#F2FF99"} fillOpacity={0.6} onMouseover={()=>setIsMouseOver(true)} onMouseout={()=>setIsMouseOver(false)} />
      ))}
      <MapMarker position={{ lat: 35.1796, lng: 129.0756 }}>
        <div style={{ color: "#000" }}>현지현지</div>
      </MapMarker>
    </Map>
  )
}