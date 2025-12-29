'use client'
import { useEffect, useRef, useState } from "react"
import { CustomOverlayMap, Map, MapMarker, Polygon } from "react-kakao-maps-sdk"
import sido from "./data/sido.json";
import sigungu from "./data/sigungu.json";

type GeoItem = {
  name: string;
  path: { lat: number; lng: number }[][];
  isHover: boolean;
  key: string;
};

export default function KakaoMap() {
  const bounds = { // 지도 경계를 벗어나면 돌아가도록 경계 잡기
    sw: { lat: 33.0, lng: 124.0 },
    ne: { lat: 39.0, lng: 132.0 }
  };
  const [geoList, setGeoList] = useState<GeoItem[]>([]); // 폴리곤 데이터
  const [detailMode, setDetailMode] = useState(false); // 시도, 시군구 화면 구분(시도: false, 시군구: true)
  const mapRef = useRef<kakao.maps.Map>(null);
  const overlayRef = useRef<kakao.maps.CustomOverlay | null>(null);

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

  // 시도, 시군구 폴리곤 데이터 다루는 함수
  function handlePolygon(jsonData: any) {
    if (!jsonData?.features) return; // json 데이터가 없거나 features가 없으면 종료

    const features = jsonData.features; // 시도와 시군구의 feature 배열
    const data: GeoItem[] = []; // 변환된 시도, 시군구 데이터 저장용 배열

    for (const item of features) { // 시도, 시군구별 순회
      const { geometry, properties } = item;
      if (!geometry || !geometry.type) continue; // geometry가 없거나 type이 없으면 건너뜀
      const pathList: { lat: number; lng: number }[][] = []; // 해당 시도, 시군구의 모든 폴리곤 경로

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
        name: properties.SIG_KOR_NM,
        path: pathList,
        isHover: false,
        key: properties.CTPRVN_CD || properties.SIG_CD
      });
    }
    setGeoList(data);
  }

  // 줌에 따라 시도와 시군구 폴리곤을 보이게 하기 위한 함수
  function handleZoom(map: kakao.maps.Map) {
    const level = map.getLevel(); // 현재 줌 레벨

    if(!detailMode && level <= 10) {
      setDetailMode(true); // 시군구 모드
      setGeoList([]); // 기존 폴리곤 제거
      handlePolygon(sigungu); // 시군구 데이터 로딩
    } else if(detailMode && level > 10) {
      setDetailMode(false); // 시도 모드
      setGeoList([]);
      handlePolygon(sido);
    }
  }

  // 시도를 클릭하면 시군구가 보이게 하기 위한 함수
  function handleSidoClick(latlng: kakao.maps.LatLng) {
    if(!mapRef.current) return; // 지도 객체가 없으면 리턴

    mapRef.current.setLevel(10); // 지도 줌 레벨을 10으로 변경(확대)
    mapRef.current.panTo(latlng); // 클릭한 위치로 부드럽게 이동
  }

  function handleSigunguClick(latlng: kakao.maps.LatLng) {
    if(!mapRef.current) return;

    mapRef.current.setLevel(8); // 지도 줌 레벨을 8로 변경(더 확대)
    mapRef.current.panTo(latlng);
  }

  // 마우스를 올리고 내렸을 때, 색상 변경하기 위한 함수
  function handleHover(item:GeoItem, isHover: boolean, latlng?: kakao.maps.LatLng) {
    // 이전 상태를 갖고와서 geoList 배열을 돌면서
    //  geoList의 키와 Polygon 컴포넌트에서 지정한 키가 같으면
    //  isHover값을 덮어쓴 새로운 객체를 만듦(파라미터로 받아옴)
    setGeoList(pre => pre.map(area => area.key === item.key ? {...area, isHover} : area))

    // if(isHover && latlng && mapRef.current) {
    //   if(!overlayRef.current) {
    //     overlayRef.current = new kakao.maps.CustomOverlay({
    //       content: `<div>${item.name}</div>`,
    //       position: latlng,
    //       map: mapRef.current
    //     });
    //   } else {
    //     overlayRef.current.setContent(`<div>${item.name}</div>`);
    //     overlayRef.current.setPosition(latlng);
    //     overlayRef.current.setMap(mapRef.current);
    //   }
    // }
    // if(!isHover && overlayRef.current) {
    //   overlayRef.current.setMap(null);
    //   overlayRef.current = null;
    // }
  }

  return (
    <Map center={{ lat: 36.5, lng: 127.5 }} level={13} minLevel={13} style={{ width: "100%", height: "100%" }}
         onDragEnd={handleDragEnd} ref={mapRef} onZoomChanged={handleZoom}
         className="rounded-xl shadow-md border border-gray-200">
      {geoList.map(item => 
        <Polygon key={item.key} path={item.path} strokeWeight={2} strokeColor="#2c3e50" fillColor={item.isHover ? "#7f8c8d" : "#ffffff"} fillOpacity={0.4} 
                 onMouseover={(_, e) => handleHover(item, true, e.latLng)} onMouseout={() => handleHover(item, false)}
                 onClick={(_, e) => {!detailMode ? handleSidoClick(e.latLng) : handleSigunguClick(e.latLng)}}/>)}
      {/* <MapMarker position={{ lat: 35.1796, lng: 129.0756 }}>
        <div style={{ color: "#000" }}>현지현지</div>
      </MapMarker> */}
    </Map>
  )
}