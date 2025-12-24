'use client'
import { useEffect, useState } from "react"
import { Map, MapMarker, Polygon } from "react-kakao-maps-sdk"
import sido from "./data/sido.json";

type GeoItem = {
  name: string;
  path: { lat: number; lng: number }[][];
  isHover: boolean;
  key: string;
};

export default function BasicMap() {
  const bounds = {
    sw: { lat: 33.0, lng: 124.0 },
    ne: { lat: 39.0, lng: 132.0 }
  };
  const [geoList, setGeoList] = useState<GeoItem[]>([]);

  function isOutOf(lat: number, lng: number) {
    return (
      lat < bounds.sw.lat ||
      lat > bounds.ne.lat ||
      lng < bounds.sw.lng ||
      lng > bounds.ne.lng
    )
  }

  useEffect(() => {
    const { features } = sido as {
      features: {
        geometry: {
          type: "Polygon" | "MultiPolygon";
          coordinates: any;
        },
        properties: {
          CTPRVN_CD: string;
          CTP_KOR_NM: string;
        },
      }[];
    };

    const data: GeoItem[] = []; // 변환된 시도 데이터 저장용 배열

    for (const item of features) { // 시도별 순회
      const { geometry, properties } = item;
      const pathList: { lat: number; lng: number }[][] = []; // 해당 시도의 모든 폴리곤 경로

      if(geometry.type === "Polygon") {
        for(const ring of geometry.coordinates) {
          // GeoJSON: [lng, lat], KakaoMap: { lat, lng }
          const path = ring.map(([lng, lat]: number[]) => ({lat, lng}));
          pathList.push(path);
        }
      }

      if(geometry.type === "MultiPolygon") {
        for(const polygon of geometry.coordinates) {
          for(const ring of polygon) {
            const path = ring.map(([lng, lat]: number[]) => ({lat, lng}));
            pathList.push(path);
          }
        }
      }

      // 시도 데이터 하나 완성
      data.push({
        name: properties.CTP_KOR_NM,
        path: pathList,
        isHover: false,
        key: properties.CTPRVN_CD,
      });
    }
    setGeoList(data);
  }, []);

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
      {geoList.map(item => {
          const { key, path, isHover } = item;
          return (
            <Polygon key={key} path={path} strokeWeight={2} strokeColor="#2c3e50" fillColor={isHover ? "#7f8c8d" : "#ffffff"} fillOpacity={0.4} 
                     onMouseover={() => {
                       setGeoList(pre => pre.map(area => {
                         if (area.key === key)
                           return {...area, isHover: true};
                         return area;
                       }));
                     }}
                     onMouseout={() => {
                       setGeoList(pre => pre.map(area => {
                         if (area.key === key)
                           return {...area, isHover: false};
                         return area;
                       }));
                     }}
            />
          );
      })}
      <MapMarker position={{ lat: 35.1796, lng: 129.0756 }}>
        <div style={{ color: "#000" }}>현지현지</div>
      </MapMarker>
    </Map>
  )
}