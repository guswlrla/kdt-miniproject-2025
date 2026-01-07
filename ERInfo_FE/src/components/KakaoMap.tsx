'use client'
import { useEffect, useRef, useState } from "react"
import { CustomOverlayMap, Map, MapMarker, Polygon } from "react-kakao-maps-sdk"
import sido from "../app/data/sido.json";
import sigungu from "../app/data/sigungu.json";

type GeoItem = {
  name: string;
  path: { lat: number; lng: number }[][];
  isHover: boolean;
  key: string;
};

export default function KakaoMap({selectedSido, selectedSgg}: {selectedSido: string, selectedSgg: string}) {
  const bounds = { // 지도 경계를 벗어나면 돌아가도록 경계 잡기
    sw: { lat: 33.0, lng: 124.0 },
    ne: { lat: 39.0, lng: 132.0 }
  };
  const [geoList, setGeoList] = useState<GeoItem[]>([]); // 폴리곤 데이터
  const [detailMode, setDetailMode] = useState<Boolean>(false); // 시도, 시군구 화면 구분(시도: false, 시군구: true)
  const mapRef = useRef<kakao.maps.Map>(null);
  const selectedSidoRef = useRef<string>(null); // 선택한 시도를 기억하는 변수
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
  function handleZoom() {
    if (!mapRef.current) return;

    const level = mapRef.current!.getLevel(); // 현재 지도의 줌 레벨
    console.log(level);

    if(selectedSidoRef.current) { // 사용자가 선택한 시도가 있으면
      if(level! >= 11) { // 줌 레벨이 11이 되면
        selectedSidoRef.current = null; // 이전 선택 초기화
        setDetailMode(false); 
        setGeoList([]);
        handlePolygon(sido);
      } else { // 시군구 단위로 확대된 상태
        const filteredSigungu = {
          ...sigungu,
          features: sigungu.features.filter(f => f.properties.SIG_CD.startsWith(selectedSidoRef.current!))
        };
        setDetailMode(true);
        setGeoList([]);
        handlePolygon(filteredSigungu); // 필터링된 시도의 시군구 폴리곤을 보여줌
      }
    } else { // 선택한 시도가 없으면
      // 전체 시도, 시군구 폴리곤을 보여줌
      if(level! <= 10) handlePolygon(sigungu); 
      else handlePolygon(sido);
    }
  }

  // 시도를 클릭하면 시군구가 보이게 하기 위한 함수
  function handleSidoClick(latlng: kakao.maps.LatLng, item: GeoItem) {
    if(!mapRef.current) return; // 지도 객체가 없으면 리턴

    mapRef.current.setLevel(10); // 지도 줌 레벨을 10으로 변경(확대)
    mapRef.current.panTo(latlng); // 클릭한 위치로 부드럽게 이동

    const sidoCode = item.key; // 클릭한 시도의 key
    selectedSidoRef.current = item.key; // 선택한 시도를 저장(줌아웃 시 선택한 시도 유지)

    // 시군구 코드 앞 2자리 = 시도 코드
    const filteredSido = { // 선택된 시도에 속한 시군구만 필터링
      ...sigungu,
      features: sigungu.features.filter(feature =>feature.properties.SIG_CD.startsWith(sidoCode))
    };

    setGeoList([]); // 기존 폴리곤 제거
    handlePolygon(filteredSido); // 필터링된 시군구 json 데이터를 함수에 전달
    setDetailMode(true); // 시군구 모드로 변경
  }

  function handleSigunguClick(latlng: kakao.maps.LatLng, item: GeoItem) {
    if(!mapRef.current) return;

    mapRef.current.setLevel(8); // 지도 줌 레벨을 8로 변경(더 확대)
    mapRef.current.panTo(latlng);

    // 시군구 코드 앞 2자리 = 시도 코드
    const filteredSigungu = {
      ...sigungu,
      features: sigungu.features.filter(feature =>feature.properties.SIG_CD === item.key)
    };

    setGeoList([]); // 기존 폴리곤 제거
    handlePolygon(filteredSigungu); // 필터링된 시군구 json 데이터를 함수에 전달
  }

  // 마우스를 올리고 내렸을 때, 색상 변경하기 위한 함수
  function handleHover(item:GeoItem, isHover: boolean, latlng?:kakao.maps.LatLng) {
    if (!mapRef.current) return;

    const level = mapRef.current!.getLevel(); // 현재 지도의 줌 레벨을 갖고 옴
    if(level! <= 8) isHover = false;
    
    // 이전 상태를 갖고와서 geoList 배열을 돌면서
    //  geoList의 키와 Polygon 컴포넌트에서 지정한 키가 같으면
    //  isHover값을 덮어쓴 새로운 객체를 만듦(파라미터로 받아옴)
    setGeoList(prev => prev.map(area => area.key === item.key ? { ...area, isHover } : area));
  }

  function handleMoveByAdress(address: string) { // 와이라노
    if (!mapRef.current) return;

    const geoCoder = new kakao.maps.services.Geocoder();
    geoCoder.addressSearch(address, (result, status) => {
      if(status === kakao.maps.services.Status.OK) {
        const coords = new kakao.maps.LatLng(parseFloat(result[0].y), parseFloat(result[0].x))
        console.log(coords)

        const level = selectedSgg ? 8 : 10;
        
        mapRef.current?.setLevel(level);
        mapRef.current?.panTo(coords);
      }
    })
  }

  useEffect(()=> {
    if(selectedSido) {
      handleMoveByAdress(selectedSido)
    } else if(selectedSgg) {
      handleMoveByAdress(`${selectedSido} ${selectedSgg}`)
    }
  }, [selectedSido, selectedSgg])

  return (
    <Map center={{ lat: 36.5, lng: 127.5 }} level={12} minLevel={13} style={{ width: "100%", height: "100%" }}
         onDragEnd={handleDragEnd} ref={mapRef} onZoomChanged={handleZoom}
         className="border border-gray-200 rounded-md">
      {/* {geoList.map(item => 
        <Polygon key={item.key} path={item.path} strokeWeight={2} strokeColor="#2c3e50" fillColor={item.isHover ? "#7f8c8d" : "#ffffff"} fillOpacity={0.4} 
                 onMouseover={() => handleHover(item, true)} onMouseout={() => handleHover(item, false)}
                 onClick={(_, e) => {!detailMode ? handleSidoClick(e.latLng, item) : handleSigunguClick(e.latLng, item)}}/>)} */}
    </Map>
  )
}