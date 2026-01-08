'use client'
import { useEffect, useRef, useState } from "react"
import { CustomOverlayMap, Map, MapMarker, Polygon } from "react-kakao-maps-sdk"
import sido from "../app/data/sido.json";
import sigungu from "../app/data/sigungu.json";
import { HospLocation } from "@/types/HospLocation";

type GeoItem = {
  name: string;
  path: { lat: number; lng: number }[][];
  key: string;
};

interface KakaoMapProps {
  selectedSido: string;
  selectedSgg: string;
  markers: HospLocation[];
  onBoundsChange: (swLat: number, neLat: number, swLng: number, neLng: number) => void
}

export default function KakaoMap({selectedSido, selectedSgg, markers, onBoundsChange}: KakaoMapProps) {
  const bounds = { // 지도 경계를 벗어나면 돌아가도록 경계 잡기
    sw: { lat: 33.0, lng: 124.0 },
    ne: { lat: 39.0, lng: 132.0 }
  };
  const [geoList, setGeoList] = useState<GeoItem[]>([]); // 폴리곤 데이터
  const [detailMode, setDetailMode] = useState<Boolean>(false); // 시도, 시군구 화면 구분(시도: false, 시군구: true)
  const mapRef = useRef<kakao.maps.Map>(null);
  // const overlayRef = useRef<kakao.maps.CustomOverlay | null>(null);

  // 드래그로 지도 경계를 벗어나면 위치 원상복구
  function handleDragEnd() {
    if (!mapRef.current) return;
    
    const center = mapRef.current!.getCenter()
    const lat = center!.getLat()
    const lng = center!.getLng()

    if(lat < bounds.sw.lat || lat > bounds.ne.lat || lng < bounds.sw.lng || lng > bounds.ne.lng)
      mapRef.current!.setCenter(new kakao.maps.LatLng(36.5, 127.5))
  }

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
          // GeoJSON: [lng, lat]
          // KakaoMap: { lat, lng }으로 받아야 함
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
        key: properties.CTPRVN_CD || properties.SIG_CD
      });
    }
    setGeoList(data);
  }

  // 줌에 따라 시도와 시군구 폴리곤을 보이게 하기 위한 함수
  function handleZoom() {
    // if (!mapRef.current) return;

    // const level = mapRef.current!.getLevel(); // 현재 지도의 줌 레벨
    // console.log(level);

    // if(selectedSidoRef.current) { // 사용자가 선택한 시도가 있으면
    //   if(level! >= 11) { // 줌 레벨이 11이 되면
    //     selectedSidoRef.current = null; // 이전 선택 초기화
    //     setDetailMode(false); 
    //     setGeoList([]);
    //     handlePolygon(sido);
    //   } else { // 시군구 단위로 확대된 상태
    //     const filteredSigungu = {
    //       ...sigungu,
    //       features: sigungu.features.filter(f => f.properties.SIG_CD.startsWith(selectedSidoRef.current!))
    //     };
    //     setDetailMode(true);
    //     setGeoList([]);
    //     handlePolygon(filteredSigungu); // 필터링된 시도의 시군구 폴리곤을 보여줌
    //   }
    // } else { // 선택한 시도가 없으면
    //   // 전체 시도, 시군구 폴리곤을 보여줌
    //   if(level! <= 10) handlePolygon(sigungu); 
    //   else handlePolygon(sido);
    // }
  }

  function handleMoveByAddr(address: string) {
    if (!mapRef.current) return; // 지도가 없으면 리턴

    const geoCoder = new kakao.maps.services.Geocoder(); // 카카오맵 주소-좌표 변환 객체 생성
    geoCoder.addressSearch(address, (result, status) => { // 전달받은 주소를 바탕으로 좌표 검색
      if(status === kakao.maps.services.Status.OK) { // 검색 결과가 정상적으로 들어오면
        const coords = new kakao.maps.LatLng(parseFloat(result[0].y), parseFloat(result[0].x)) // 검색결과 첫번째 항목의 위도, 경도를 추출해 좌표 객체 생성 
        const level = selectedSgg ? 8 : 10; // 시군구가 선택되면, 가깝게 시도가 선택되면 멀게
        
        mapRef.current?.setLevel(level);
        mapRef.current?.panTo(coords);
      }
    })
  }

  // 움직임이 멈췄을 때, 화면 영역 위도, 경도 값 구하기
  function handleIdle() {
    if (!mapRef.current) return;
    const currentLevel = mapRef.current.getLevel();

    if (currentLevel <= 9) { // 줌 레벨이 9이상일 때부터 드래그마다 호출
      const bounds = mapRef.current.getBounds();
      const sw = bounds.getSouthWest();
      const ne = bounds.getNorthEast();
      onBoundsChange(sw.getLat(), ne.getLat(), sw.getLng(), ne.getLng());
    }
  }

  useEffect(()=> {
    if(selectedSido && selectedSgg) {
      handleMoveByAddr(`${selectedSido} ${selectedSgg}`)

      const targetSido = sido.features.find(feature => feature.properties.SIG_KOR_NM === selectedSido);
      const sidoCode = targetSido?.properties.CTPRVN_CD || "";
      const filteredSigungu = { // 시군구 데이터에서 선택된 시군구만 필터링
        ...sigungu,
        features: sigungu.features.filter(feature => feature.properties.SIG_KOR_NM === selectedSgg && feature.properties.SIG_CD.startsWith(sidoCode))
      };
      handlePolygon(filteredSigungu);
    } else if(selectedSido) {
      const refineSido = selectedSido === "광주" ? "광주광역시" : selectedSido; // 광주광역시와 경기도 광주시 구분
      handleMoveByAddr(refineSido);

      const filteredSido = { // 시도 데이터에서 선택된 시도만 필터링
        ...sido,
        features: sido.features.filter(feature =>feature.properties.SIG_KOR_NM === selectedSido)
      };
      handlePolygon(filteredSido);
    }
  }, [selectedSido, selectedSgg])

  return (
    <Map center={{ lat: 36.5, lng: 127.5 }} level={13} minLevel={13} style={{ width: "100%", height: "100%" }}
         onDragEnd={handleDragEnd} ref={mapRef} onZoomChanged={handleZoom} onIdle={handleIdle}
         className="border border-gray-200 rounded-md">
      {geoList.map(item => <Polygon key={item.key} path={item.path} strokeWeight={2} strokeColor="#2c3e50" fillColor="#4e78a8" fillOpacity={0.4} />)}
      {markers.map(item => <MapMarker key={item.hospitalId} position={{lat: item.latitude, lng: item.longitude }} title={item.institutionName} /> )}
    </Map>
  )
}