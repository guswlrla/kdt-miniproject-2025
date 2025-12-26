'use client'
import { useEffect, useState } from "react"
import { Map, MapMarker, Polygon } from "react-kakao-maps-sdk"
import sido from "./data/sido.json";
import sigungu from "./data/sigungu.json";

type GeoItem = {
  name: string;
  path: { lat: number; lng: number }[][];
  isHover: boolean;
  key: string;
};

export default function BasicMap() {
  const bounds = { // 지도 경계를 벗어나면 돌아가도록 경계 잡기
    sw: { lat: 33.0, lng: 124.0 },
    ne: { lat: 39.0, lng: 132.0 }
  };
  const [geoList, setGeoList] = useState<GeoItem[]>([]); // 폴리곤 데이터
  const [detailMode, setDetailMode] = useState(false); // 줌 여부(시도, 시군구 화면 구분)

  // 드래그로 지도 경계를 벗어나면 위치 원상복구
  function handleDragEnd(map: kakao.maps.Map) {
    const center = map.getCenter()
    const lat = center.getLat()
    const lng = center.getLng()

    if(lat < bounds.sw.lat || lat > bounds.ne.lat || lng < bounds.sw.lng || lng > bounds.ne.lng)
      map.setCenter(new kakao.maps.LatLng(36.5, 127.5))
  }

  // 처음 렌더링될 때, 시도 폴리곤 표시
  useEffect(() => {
    handlePolygon(sido);
  }, []);

  // 시도, 시군구 폴리곤 데이터 다루는 함수 - 코드 깨끗하게 수정✅
  function handlePolygon(jsonData: any) {
    if (!jsonData?.features) return;
    const features = jsonData.features;
    const data: GeoItem[] = []; // 변환된 시도 데이터 저장용 배열

    for (const item of features) { // 시도별 순회
      const { geometry, properties } = item;
      if (!geometry || !geometry.type) continue;
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
        key: properties.CTPRVN_CD || properties.SIG_CD
      });
    }
    setGeoList(data);
  }

  // 줌에 따라 시도와 시군구 폴리곤을 보이게 하기 위한 함수 - 줌아웃하면 시도가 보이게 수정✅
  function handleZoom(map: kakao.maps.Map) {
    let level = map.getLevel();
    let detailMode = false;
    if(!detailMode && level <= 10) {
      setDetailMode(true);
      setGeoList([]);
      handlePolygon(sigungu);
    } else if(detailMode && level > 10) {
      setDetailMode(false);
      setGeoList([]);
      handlePolygon(sido);
    }
  }

  // 마우스를 올리고 내렸을 때, 색상 변경하기 위한 함수
  function handleHover(key: string, isHover: boolean) {
    // 이전 상태를 갖고와서 geoList 배열을 돌면서
    //  geoList의 키와 Polygon 컴포넌트에서 지정한 키가 같으면
    //  isHover값을 덮어쓴 새로운 객체를 만듦(파라미터로 받아옴)
    setGeoList(pre => pre.map(area => area.key === key ? {...area, isHover} : area))
  }

  return (
    <Map center={{ lat: 36.5, lng: 127.5 }} level={12} minLevel={13} style={{ width: "100%", height: "100%" }}
         onDragEnd={handleDragEnd}
         onZoomChanged={handleZoom}
         className="rounded-xl shadow-md border border-gray-200">
      {geoList.map(item => {
          const { key, path, isHover } = item;
          return (
            <Polygon key={key} path={path} strokeWeight={2} strokeColor="#2c3e50" fillColor={isHover ? "#7f8c8d" : "#ffffff"} fillOpacity={0.4} 
                     onMouseover={() => handleHover(key, true)} onMouseout={() => handleHover(key, false)}/>
          );
      })}
      <MapMarker position={{ lat: 35.1796, lng: 129.0756 }}>
        <div style={{ color: "#000" }}>현지현지</div>
      </MapMarker>
    </Map>
  )
}