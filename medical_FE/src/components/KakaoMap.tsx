'use client'
import { useEffect, useRef, useState } from "react"
import { CustomOverlayMap, Map, MapMarker } from "react-kakao-maps-sdk"
import { HospLocation } from "@/types/HospLocation";
import OverlayCard from "./OverlayCard";
import { Fragment } from 'react';

interface KakaoMapProps {
  selectedSido: string;
  selectedSgg: string;
  setSelectedSido: (sido: string) => void;
  setSelectedSgg: (sgg: string) => void;
  markers: HospLocation[];
  onBoundsChange: (swLat: number, neLat: number, swLng: number, neLng: number) => void;
  onDetailClick: (id: number) => void;
  setMapAddr: (addr: string) => void;
  setZoomLevel: (level: number) => void;
  // 병원 수 api 호출
  fetchHospCount: (sido?: string, sgg?: string) => Promise<void>;
  fetchNightCount: (sido?: string, sgg?: string) => Promise<void>;
  fetchCoreCount: (sido?: string, sgg?: string) => Promise<void>;
  fetchHoildayCount: (sido?: string, sgg?: string) => Promise<void>;
  // 차트 api 호출
  fetchHospCategory: (sido?: string, sgg?: string) => Promise<void>;
  fetchHospDept: (sido?: string, sgg?: string) => Promise<void>;
  // 스코어카드 데이터 호출
  fetchHospInfo: (page?: number, sido?: string, sgg?: string) => Promise<void>;
  fetchHolidayHosp: (page?: number, sido?: string, sgg?: string) => Promise<void>;
  onRegionChange: (sido?: string, sgg?: string) => void;
}

export default function KakaoMap({selectedSido, selectedSgg, markers, onBoundsChange, onDetailClick, setSelectedSido, setSelectedSgg, setMapAddr,
                                  fetchHospCount, fetchNightCount, fetchCoreCount, fetchHoildayCount,
                                  setZoomLevel, fetchHospCategory, fetchHospDept, fetchHospInfo, fetchHolidayHosp, onRegionChange
                                  }: KakaoMapProps) {
  const bounds = { // 지도 경계를 벗어나면 돌아가도록 경계 잡기
    sw: { lat: 33.0, lng: 124.0 },
    ne: { lat: 39.0, lng: 132.0 }
  };
  const mapRef = useRef<kakao.maps.Map>(null);
  const [selectedMarker, setSelectedMarker] = useState<HospLocation | null>(null);
  const isMoving = useRef(false); // 코드로 지도를 움직일 때 이벤트 중복 발생을 막기 위한 플래그
  const refineSidoName = (name: string) => { // 행정구역 명칭을 selectedSido에 맞게 매핑
    const map: { [key: string]: string } = {
      "서울특별시": "서울", "부산광역시": "부산", "대구광역시": "대구",
      "인천광역시": "인천", "광주광역시": "광주", "대전광역시": "대전",
      "울산광역시": "울산", "세종특별자치시": "세종", "경기도": "경기",
      "강원특별자치도": "강원", "충청북도": "충북", "충청남도": "충남",
      "전라북도": "전북", "전북특별자치도": "전북", "전라남도": "전남",
      "경상북도": "경북", "경상남도": "경남", "제주특별자치도": "제주"
    };
    return map[name] || name;
  };
  const lastRegionKey = useRef(""); // 이전 지역 정보를 기억할 ref

  
  // 현재 지도 위도, 경도의 중심점으로 주소를 확인하는 함수
  const coord2Region = () => {
    if (!mapRef.current) return;

    const center = mapRef.current.getCenter();
    const geoCoder = new kakao.maps.services.Geocoder();

    geoCoder.coord2RegionCode(center.getLng(), center.getLat(), (result, status) => {
      if (status === kakao.maps.services.Status.OK) {
        // 행정동(H) 우선 탐색, 없으면 법정동(B)
        const region = result.find(r => r.region_type === 'H') || result[0];
        const currentSido = region.region_1depth_name;
        const currentSgg = region.region_2depth_name;

        // 선택된 지역이 있을 때만 이탈 검사
        if (selectedSido) {
          const firstChar = selectedSido[0];
          const lastChar = selectedSido[selectedSido.length - 1];
          const isSameSido = currentSido.includes(firstChar) && currentSido.includes(lastChar);
          
          // 시군구가 선택되어 있다면 시군구까지 체크, 없으면 시도만 체크
          const isSameSgg = selectedSgg ? currentSgg.includes(selectedSgg) : true;

          if (!isSameSido || !isSameSgg) {
            setSelectedSido('');
            setSelectedSgg('');
          }
        }
      }
    });
  };

  // 드래그가 끝나면 처리하는 함수
  const handleDragEnd = () => {
    if (!mapRef.current || isMoving.current) return;

    // 대한민국 경계를 벗어나면 지도 중앙으로 이동
    const center = mapRef.current.getCenter();
    if (center.getLat() < bounds.sw.lat || center.getLat() > bounds.ne.lat || center.getLng() < bounds.sw.lng || center.getLng() > bounds.ne.lng) {
      mapRef.current.setCenter(new kakao.maps.LatLng(36.5, 127.5));
    }

    coord2Region();
  };

  // 줌이 변경되었을 때 처리하는 함수
  const handleZoom = () => {
   if (isMoving.current || !mapRef.current) return;

    const level = mapRef.current.getLevel();

    if (level >= 11) { // 줌 레벨이 11 이상(전국 단위)으로 멀어지면
      isMoving.current = true;
    
      setSelectedMarker(null);
      setSelectedSido('');
      setSelectedSgg('');
      setTimeout(() => {
        isMoving.current = false;
      }, 500);
    } else {
      coord2Region();
    }
  };

  // 주소 정보를 받아 지도를 해당 위치로 이동하는 함수
  const handleMoveByAddr = (address: string) => {
    if (!mapRef.current) return; // 지도가 없으면 리턴

    const geoCoder = new kakao.maps.services.Geocoder(); // 카카오맵 주소-좌표 변환 객체 생성
    geoCoder.addressSearch(address, (result, status) => { // 전달받은 주소를 바탕으로 좌표 검색
      if(status === kakao.maps.services.Status.OK) { // 검색 결과가 정상적으로 들어오면
        isMoving.current = true;
        const coords = new kakao.maps.LatLng(parseFloat(result[0].y), parseFloat(result[0].x)) // 검색결과 첫번째 항목의 위도, 경도를 추출해 좌표 객체 생성 
        const level = selectedSgg ? 8 : 10; // 시군구가 선택되면, 가깝게 시도가 선택되면 멀게
        
        mapRef.current?.setLevel(level);
        mapRef.current?.panTo(coords);

        setTimeout(() => {
          isMoving.current = false;
        }, 1000);
      }
    })
  };

  // 움직임이 멈췄을 때 처리하는 함수
  const handleIdle = () => {
    if (!mapRef.current) return;

    // 위경도 경계 값을 부모에게 알림
    const bounds = mapRef.current.getBounds();
    const sw = bounds.getSouthWest();
    const ne = bounds.getNorthEast();

    onBoundsChange(sw.getLat(), ne.getLat(), sw.getLng(), ne.getLng()); // 부모 컴포넌트에 위경도 값을 보냄

    // 줌 레벨에 따른 api 호출
    const level = mapRef.current.getLevel();
    setZoomLevel(level);
    const center = mapRef.current.getCenter();
    const geoCoder = new kakao.maps.services.Geocoder();

    geoCoder.coord2RegionCode(center.getLng(), center.getLat(), (result, status) => {
      if (status === kakao.maps.services.Status.OK) {
        const region = result.find(r => r.region_type === 'H') || result[0];
        const refinedSido = refineSidoName(region.region_1depth_name); // ex) '부산광역시' -> '부산' 변환
        const currentSgg = region.region_2depth_name;

        const currentKey = `${refinedSido}-${currentSgg}-${level}`;
        
        if (lastRegionKey.current === currentKey) return; // 이전 지역/레벨과 지금이 같다면 아무것도 하지 않음
      
        lastRegionKey.current = currentKey; // 새로운 키 저장

        if (level == 10 || level == 9) { // 시도 단위
          setMapAddr(`${region.region_1depth_name}`);

          fetchHospCount(refinedSido);
          fetchNightCount(refinedSido);
          fetchHoildayCount(refinedSido);
          fetchCoreCount(refinedSido);

          fetchHospCategory(refinedSido);
          fetchHospDept(refinedSido);

          onRegionChange(refinedSido);
        } else if (level <= 8) { // 시군구 단위
          const refinedSido = refineSidoName(region.region_1depth_name);
          const currentSgg = region.region_2depth_name;

          setMapAddr(`${refinedSido} ${currentSgg}`);

          fetchHospCount(refinedSido, currentSgg);
          fetchNightCount(refinedSido, currentSgg);
          fetchHoildayCount(refinedSido, currentSgg);
          fetchCoreCount(refinedSido, currentSgg);

          fetchHospCategory(refinedSido, currentSgg);
          fetchHospDept(refinedSido, currentSgg);

          onRegionChange(refinedSido, currentSgg);
        } else if (level >= 11) {
          fetchHospCount(); // 전국 단위일 때, 파라미터없이 호출
          fetchNightCount();
          fetchHoildayCount();
          fetchCoreCount();

          fetchHospCategory();
          fetchHospDept();
          
          onRegionChange();
        }
      }
    });
  }

  useEffect(()=> {
    if(selectedSido && selectedSgg) {
      handleMoveByAddr(`${selectedSido} ${selectedSgg}`);
      return;
    }

    if(selectedSido) {
      const refineSido = selectedSido === "광주" ? "광주광역시" : selectedSido; // 광주광역시와 경기도 광주시 구분
      handleMoveByAddr(refineSido);
      return;
    }
  }, [selectedSido, selectedSgg]);

  return (
    <Map center={{ lat: 36.5, lng: 127.5 }} level={12} minLevel={13} style={{ width: "100%", height: "100%" }}
         onDragEnd={handleDragEnd} ref={mapRef} onIdle={handleIdle} onCreate={handleIdle} onZoomChanged={handleZoom}
         className="border border-gray-200 rounded-md">
      {markers.map(item => <Fragment key={item.hospitalId}><MapMarker position={{lat: item.latitude, lng: item.longitude }} title={item.institutionName} 
                                      image={{src: "/redMarker.png", size: {width: 40, height: 40}}}
                                      onClick={() => setSelectedMarker(item)} />
      {selectedMarker?.hospitalId === item.hospitalId &&
        <CustomOverlayMap position={{lat: item.latitude, lng: item.longitude}} yAnchor={1.2} zIndex={10}>
          <OverlayCard data={item} onClose={() => setSelectedMarker(null)} onDetailClick={onDetailClick} />
        </CustomOverlayMap>}</Fragment>)}
    </Map>
  );
}