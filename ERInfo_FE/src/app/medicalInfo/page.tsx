'use client'
import { Suspense, useEffect, useState } from 'react';
import dynamic from 'next/dynamic';
const Dashboard = dynamic(() => import('@/components/Dashboard'), { ssr: false });
const KakaoMap = dynamic( async () => {
    await new Promise(resolve => setTimeout(resolve, 1500));
    return import('@/components/KakaoMap');
  },
  { ssr: false, loading: () => <MapLoading />}
);
import MapLoading from '@/components/MapLoading';
import SideBar from '@/components/SideBar';
import Header from '@/components/Header';
import ScoreCard from '@/components/ScoreCard';
import SelectBox from '@/components/SelectBox';
import Modal from '@/components/Modal';
import { HospCategory } from '@/types/HospCategory';
import { HospDept } from '@/types/HospDept';
import { HospLocation } from '@/types/HospLocation';
import { HospInfo } from '@/types/HospInfo';
import { useRouter, useSearchParams } from 'next/navigation';

function MedicalInfoContent() {
  const [collapsed, setCollapsed] = useState<boolean>(false); // 사이드바 토글

  // 스코어 카드관련 변수
  const [totalCount, setTotalCount] = useState<number>(0); // 전체 병원 수
  const [nightCount, setNightCount] = useState<number>(0); // 야간진료 운영 병원 수
  const [holidayCount, setHolidayCount] = useState<number>(0); // 공휴일 운영 병원 수
  const [coreCount, setCoreCount] = useState<number>(0); // 필수의료 운영 병원 수

  // 모달 창 관련 변수
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false); // 닫힘 버튼
  const [modalData, setModalData] = useState<HospInfo[] | HospLocation[]>([]); // 모달 데이터
  const [modalTitle, setModalTitle] = useState<string>(''); // 스코어 카드별 모달 제목
  const [isLoading, setIsLoading] = useState<boolean>(false); // 로딩 유무
  const [currentRegion, setCurrentRegion] = useState({ sido: '', sgg: '' }); // 시도, 시군구 지역 정보(지도 이동/드래그 시 파라미터로 넘김)
  const [selectedDeptCode, setSelectedDeptCode] = useState<string | null>(null); // 필수의료 과목 선택

  // 지도 관련 변수
  const [sidoList, setSidoList] = useState<string[]>([]); // 시도 목록
  const [sggList, setSggList] = useState<string[]>([]); // 시군구 목록
  const [selectedSido, setSelectedSido] = useState<string>(''); // 선택된 시도
  const [selectedSgg, setSelectedSgg] = useState<string>(''); // 선택된 시군구
  const [markers, setMarkers] = useState<HospLocation[]>([]); // 전체 병원 마커 보관
  const [displayMarker, setDisplayMarker] = useState<HospLocation[]>([]); // 줌 화면에 따라 보이는 마커
  const [mapAddr, setMapAddr] = useState<string>(''); // 지도 중심 좌표 기준 주소명
  const [zoomLevel, setZoomLevel] = useState<number>(12); // 줌 레벨(12: 전국 단위)

  // 차트 관련 변수
  const [hospCate, setHospCate] = useState<HospCategory[]>([]); // 병원 유형
  const [hospDept, setHospDept] = useState<HospDept[]>([]); // 진료 과목
  const categoryData = { // 병원 유형 정보(도넛차트)
    series: hospCate.map(item => item.count),
    labels: hospCate.map(item => item.typeName)
  }
  const deptData = { // 진료 과목 정보(바 차트)
    series: [{name: '병원 수', data: hospDept.map(item => item.count)}],
    labels: hospDept.map(item => item.deptCode),
  }

  // 페이징 관련 변수
  const [currentPage, setCurrentPage] = useState<number>(0); // 현재 페이지
  const [totalPages, setTotalPages] = useState<number>(0); // 전체 페이지

  const [pageChange, setPageChange] = useState<(page?: number, sido?: string, sgg?: string) => Promise<void>>(() => async () => {});

  const router = useRouter();
  const searchParams = useSearchParams();
  const [selectedHospId, setSelectedHospId] = useState<number | null>(null);

  // 병원 수 불러오기
  const fetchTotalCount = async(sido?: string, sgg?: string) => {
    let url = 'http://10.125.121.178:8080/api/medicalCountHospital';
    if(sido && sgg) {
      url += `?sidoName=${encodeURIComponent(sido)}&sigunguName=${encodeURIComponent(sgg)}`;
    } else if(sido) {
      url += `?sidoName=${encodeURIComponent(sido)}`
    }

    try{
      const resp = await fetch(url);
      if(!resp.ok) {
        throw new Error("병원 수를 불러오는데 실패했습니다!");
      }
      const data = await resp.json();
      setTotalCount(data);
    } catch(error) {
      console.error(error);
    }
  };

  // 야간진료 운영 병원 수 불러오기
  const fetchNightCount = async(sido?: string, sgg?: string) => {
    let url = `http://10.125.121.178:8080/api/medicalNight?`;
    if(sido && sgg) {
      url += `sidoName=${encodeURIComponent(sido)}&sigunguName=${encodeURIComponent(sgg)}`;
    } else if(sido) {
      url += `sidoName=${encodeURIComponent(sido)}`
    }

    try{
      const resp = await fetch(url);
      if(!resp.ok) {
        throw new Error("야간진료 운영 병원 정보를 불러오는데 실패했습니다!");
      }
      const data = await resp.json();
      setNightCount(data.totalElements);
    } catch(error) {
      console.error(error);
    }
  };

  // 공휴일 운영 병원 수 불러오기
  const fetchHolidayCount = async(sido?: string, sgg?: string) => {
    let url = `http://10.125.121.178:8080/api/medicalHoliday?`;
    if(sido && sgg) {
      url += `sidoName=${encodeURIComponent(sido)}&sigunguName=${encodeURIComponent(sgg)}`;
    } else if(sido) {
      url += `sidoName=${encodeURIComponent(sido)}`
    }

    try{
      const resp = await fetch(url);
      if(!resp.ok) {
        throw new Error("공휴일 운영 병원 정보를 불러오는데 실패했습니다!");
      }
      const data = await resp.json();
      setHolidayCount(data.totalElements);
    } catch(error) {
      console.error(error);
    }
  };

  // 필수의료 운영 병원 수 불러오기
  const fetchCoreCount = async(sido?: string, sgg?: string, deptCode?: string) => {
    let url = `http://10.125.121.178:8080/api/medicalEssential?`;
    if (sido && sgg) {
      url += `sidoName=${encodeURIComponent(sido)}&sigunguName=${encodeURIComponent(sgg)}`
    } else if (sido) {
      url += `sidoName=${encodeURIComponent(sido)}`
    }
  
    try{
      const resp = await fetch(url);
      if(!resp.ok) {
        throw new Error("필수의료 운영 병원 정보를 불러오는데 실패했습니다!");
      }
      const data = await resp.json();
      setCoreCount(data.totalElements);
    } catch(error) {
      console.error(error);
    }
  };

  // select 박스의 시도 목록 불러오기
  const fetchSidoList = async() => {
    try{
      const resp = await fetch('http://10.125.121.178:8080/api/sidoName');
      if(!resp.ok) {
        throw new Error('시도 정보를 불러오는데 실패했습니다!');
      }
      const sido = await resp.json();
      setSidoList(sido);
    } catch(error) {
      console.log(error);
    }
  };

  // select 박스의 시군구 목록 불러오기
  const fetchSggList = async(sido: string) => {
    try{
      const resp = await fetch(`http://10.125.121.178:8080/api/sigunguName?sidoName=${encodeURIComponent(sido)}`);
      if(!resp.ok) {
        throw new Error('시군구 정보를 불러오는데 실패했습니다!');
      }
      const sgg = await resp.json();
      setSggList(sgg);
    } catch(error) {
      console.log(error);
    }
  };

  // 전체 병원 수 - 스코어카드 데이터 불러오기
  const fetchHospInfo = async (page?: number, sido?: string, sgg?: string) => {
    let url = `http://10.125.121.178:8080/api/medicalInfo?page=${page}&size=5`
    if(sido && sgg) {
      url += `&sidoName=${encodeURIComponent(sido)}&sigunguName=${encodeURIComponent(sgg)}`;
    } else if(sido) {
      url += `&sidoName=${encodeURIComponent(sido)}`;
    }

    setIsLoading(true);

    try {
      const resp = await fetch(url);

      if(!resp.ok) {
        throw new Error("병원 정보를 불러오는데 실패했습니다!");
      }

      const data = await resp.json();
      setModalData(data.content || []);
      setTotalPages(data.totalPages || 0);
      setCurrentPage(page!);
    } catch (e) {
      console.error("데이터 로드 실패:", e);
    } finally {
      setIsLoading(false);
    }
  };

  // 야간진료 - 스코어카드 데이터 불러오기
  const fetchNightHosp = async(page?: number, sido?: string, sgg?: string) => {
    let url = `http://10.125.121.178:8080/api/medicalNight?page=${page}&size=5`;
    if(sido && sgg) {
      url += `&sidoName=${encodeURIComponent(sido)}&sigunguName=${encodeURIComponent(sgg)}`;
    } else if(sido) {
      url += `&sidoName=${encodeURIComponent(sido)}`
    }

    try{
      const resp = await fetch(url);
      if(!resp.ok) {
        throw new Error("야간진료 운영 병원 정보를 불러오는데 실패했습니다!");
      }
      const data = await resp.json();
      setModalData(data.content || []);
      setTotalPages(data.totalPages || 0);
      setCurrentPage(page!);
    } catch(error) {
      console.error(error);
    }
  }

  // 공휴일 - 스코어카드 데이터 불러오기
  const fetchHolidayHosp = async(page?: number, sido?: string, sgg?: string) => {
    let url = `http://10.125.121.178:8080/api/medicalHoliday?page=${page}&size=5`;
    if(sido && sgg) {
      url += `&sidoName=${encodeURIComponent(sido)}&sigunguName=${encodeURIComponent(sgg)}`;
    } else if(sido) {
      url += `&sidoName=${encodeURIComponent(sido)}`
    }

    try{
      const resp = await fetch(url);
      if(!resp.ok) {
        throw new Error("공휴일 운영 병원 정보를 불러오는데 실패했습니다!");
      }
      const data = await resp.json();
      setModalData(data.content || []);
      setTotalPages(data.totalPages || 0);
      setCurrentPage(page!);
    } catch(error) {
      console.error(error);
    }
  }

  // 필수의료 - 스코어카드 데이터 불러오기
  const fetchCoreHosp = async(page?: number, sido?: string, sgg?: string, deptCode?: string) => {
    let url = `http://10.125.121.178:8080/api/medicalEssential?page=${page}&size=5`;
    if (sido && sgg) {
      url += `&sidoName=${encodeURIComponent(sido)}&sigunguName=${encodeURIComponent(sgg)}`
      if(deptCode) {
        url += `&deptCode=${encodeURIComponent(deptCode)}`
      } 
    } else if (sido) {
      url += `&sidoName=${encodeURIComponent(sido)}`
      if(deptCode) {
        url += `&deptCode=${encodeURIComponent(deptCode)}`
      }
    } else if (deptCode) {
      url += `&deptCode=${encodeURIComponent(deptCode)}`
    }
  
    try{
      setIsLoading(true);
      const resp = await fetch(url);
      if(!resp.ok) {
        throw new Error("필수의료 운영 병원 정보를 불러오는데 실패했습니다!");
      }
      const data = await resp.json();
      setModalData(data.content || []);
      setTotalPages(data.totalPages || 0);
      setCurrentPage(page!);
    } catch(error) {
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  // 병원 유형 불러오기
  const fetchHospCategory = async(sido?: string, sgg?: string) => {
    let url = 'http://10.125.121.178:8080/api/medicalType';
    if(sido && sgg) {
      url += `?sidoName=${encodeURIComponent(sido)}&sigunguName=${encodeURIComponent(sgg)}`;
    } else if(sido) {
      url += `?sidoName=${encodeURIComponent(sido)}`
    }

    try{
      const resp = await fetch(url);
      if(!resp.ok) {
        throw new Error('병원 카테고리 정보를 불러오는데 실패했습니다!');
      }
      const category = await resp.json();
      setHospCate(category);
    } catch(error) {
      console.log(error);
    }
  };

  // 병원 진료과목 불러오기
  const fetchHospDept = async(sido?: string, sgg?: string) => {
    let url = 'http://10.125.121.178:8080/api/medicalDept?topN=5';
    if(sido && sgg) {
      url += `&sidoName=${encodeURIComponent(sido)}&sigunguName=${encodeURIComponent(sgg)}`;
    } else if(sido) {
      url += `&sidoName=${encodeURIComponent(sido)}`
    }

    try{
      const resp = await fetch(url);
      if(!resp.ok) {
        throw new Error('병원 부서? 정보를 불러오는데 실패했습니다!');
      }
      const dept = await resp.json();
      setHospDept(dept);
    } catch(error) {
      console.log(error);
    }
  };

  // 병원 위치정보 불러오기(마커, 커스텀 오버레이)
  const fetchHospLocation = async(level?: number) => {
    try{
      const resp = await fetch(`http://10.125.121.178:8080/api/medicalLocation?${level}`);
      if(!resp.ok) {
        throw new Error("병원 위치 정보를 불러오는데 실패했습니다!");
      }
      const data = await resp.json();
      setMarkers(data);
      setDisplayMarker(data);
    } catch(error) {
      console.error(error);
    }
  };

  const fetchHospInfo2 = async (sido?: string, sgg?: string) => {
    let url = `http://10.125.121.178:8080/api/medicalInfo?size=10000`
    if(sido && sgg) {
      url += `&sidoName=${encodeURIComponent(sido)}&sigunguName=${encodeURIComponent(sgg)}`;
    } else if(sido) {
      url += `&sidoName=${encodeURIComponent(sido)}`;
    }
    setIsLoading(true);
    try {
      const resp = await fetch(url);

      if(!resp.ok) {
        throw new Error("병원 정보를 불러오는데 실패했습니다!");
      }

      const data = await resp.json();
      setDisplayMarker(data.content || []);
    } catch (e) {
      console.error("데이터 로드 실패:", e);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchSidoList(); // 시도 목록 나타내기
    fetchHospLocation(); 
    fetchTotalCount();
  }, []);

  useEffect(() => {
    if(selectedSido) {
      fetchSggList(selectedSido); // 시도가 선택되면 시군구 리스트 나타내기
    } else {
      setSggList([]);
    }
  }, [selectedSido]);

  useEffect(() => {
    fetchTotalCount(selectedSido, selectedSgg);
    fetchNightCount(selectedSido, selectedSgg);
    fetchHolidayCount(selectedSido, selectedSgg);
    fetchCoreCount(selectedSido, selectedSgg);

    fetchHospCategory(selectedSido, selectedSgg);
    fetchHospDept(selectedSido, selectedSgg);

    fetchHospInfo2(selectedSido, selectedSgg);
  }, [selectedSido, selectedSgg]);

  // 선택한 시도를 바꿨을 때 처리
  const handleSidoChange = (value: string) => {
    setSelectedSido(value); // 선택한 시도를 value값으로 변경
    setSelectedSgg(''); // 선택된 시군구 초기화
    setSggList([]); // 이전 시군구 리스트 제거
  }

  // 지도가 움직일 때 호출
  const handleBoundsChange = (swLat: number, neLat: number, swLng: number, neLng: number) => {
    if (selectedSido) return;

    const filtered = markers.filter(m => m.latitude >= swLat && m.latitude <= neLat && m.longitude >= swLng && m.longitude <= neLng);

    if (JSON.stringify(displayMarker) !== JSON.stringify(filtered)) {
      setDisplayMarker(filtered);
    }
  }

  const handleModalData = async(type: string) => {
    setModalData([]);
    setIsModalOpen(true);
    setIsLoading(true);
    setCurrentPage(0);

    const targetSido = selectedSido || currentRegion.sido;
    const targetSgg = selectedSgg || currentRegion.sgg;

    try {
      switch (type) {
        case 'total':
          setModalTitle("🏥 전체 병원 목록");
          await fetchHospInfo(0, selectedSido, selectedSgg);
          setPageChange(() => (page?: number) => fetchHospInfo(page, targetSido, targetSgg));   
          break;
        case 'night':
          setModalTitle("🌜 야간진료 운영 병원");
          await fetchNightHosp(0, selectedSido, selectedSgg);
          setPageChange(() => (page?: number) => fetchNightHosp(page, targetSido, targetSgg));
          break;
        case 'holiday':
          setModalTitle("🗓️ 일요일/공휴일 진료 병원");
          await fetchHolidayHosp(0, selectedSido, selectedSgg);
          setPageChange(() => (page?: number) => fetchHolidayHosp(page, targetSido, targetSgg));
          break;
        case 'core':
          setModalTitle("🚨 필수의료 운영 병원");
          await fetchCoreHosp(0, selectedSido, selectedSgg, selectedDeptCode || undefined);
          setPageChange(() => (page?: number) => fetchCoreHosp(page, targetSido, targetSgg, selectedDeptCode || undefined));
          break;
      }
    } finally {
      setIsLoading(false); // 성공하든 실패하든 로딩 종료
    }
  };

  const handleDetailView = async (hospitalId: number) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set('hospId', hospitalId.toString());
    router.push(`${window.location.pathname}?${params.toString()}`);
    
    setIsLoading(true);
    setIsModalOpen(true);
    setModalTitle('');
    setModalData([]);
    setSelectedHospId(hospitalId);
    
    try {
      const resp = await fetch(`http://10.125.121.178:8080/api/medicalId?hospitalId=${hospitalId}`);
      if (!resp.ok) throw new Error("상세 정보 호출 실패");
      const data = await resp.json();

      const delay = new Promise(resolve => setTimeout(resolve, 200));
      await delay;
      
      setModalData([data]); 
      setTotalPages(1);
      setPageChange(() => async () => {}); 
    } catch (e) {
        console.error("상세 정보 로드 실패:", e);
      }finally {
        setIsLoading(false);
      }
  }

  // URL의 hospId가 바뀔 때마다 실행되는 Effect
  useEffect(() => {
    const hospId = searchParams.get('hospId');
    
    // URL에 hospId는 있는데, 현재 모달에 데이터가 없는 경우 (로그인 후 리다이렉트 상황)
    if (hospId && modalData.length === 0 && !isLoading) {
      const fetchRestoreDetail = async () => {
        const hospitalId = Number(hospId);
        setIsLoading(true);
        setIsModalOpen(true);
        setSelectedHospId(hospitalId);
        
        try {
          const resp = await fetch(`http://10.125.121.178:8080/api/medicalId?hospitalId=${hospitalId}`);
          if (resp.ok) {
            const data = await resp.json();
            setModalData([data]);
            setTotalPages(1);
            setPageChange(() => async () => {});
          }
        } catch (e) {
          console.error("데이터 복구 실패:", e);
        } finally {
          setIsLoading(false);
        }
      };

      fetchRestoreDetail();
    }
  }, [searchParams, modalData.length]);

  useEffect(() => {
  if (isModalOpen && modalTitle === "🚨 필수의료 운영 병원") {
    const targetSido = selectedSido || currentRegion.sido;
    const targetSgg = selectedSgg || currentRegion.sgg;

    setPageChange(() => (page?: number) => 
      fetchCoreHosp(page, targetSido, targetSgg, selectedDeptCode || undefined)
    );
  } 
  }, [selectedDeptCode]);

  return (
    <div className="flex min-h-screen xl:h-screen overflow-hidden">
      <SideBar collapsed={collapsed} setCollapsed={setCollapsed} />
      <div className={`${collapsed ? 'md:pl-16' : 'md:pl-55'} bg-gray-100 relative flex flex-1 mt-14`}> 
        <Header />
        <main className='flex flex-1 flex-col overflow-hidden'>
          <div className='p-5 flex-1 min-h-0 grid grid-cols-12 grid-rows-[auto_1fr] gap-4'>
            <div className='xl:col-span-8 lg:grid-cols-4 grid grid-cols-2 gap-4 col-span-12 order-first xl:order-0'>
              <ScoreCard title="전체 병원 수" content={totalCount} onOpen={() => handleModalData('total')}
                         color="blue" imgSrc='hospital'/>
              <ScoreCard title="야간진료 운영 병원" content={nightCount} onOpen={() => handleModalData('night')}
                         color="purple" imgSrc='night' />
              <ScoreCard title="일요일/공휴일 진료" content={holidayCount} onOpen={() => handleModalData('holiday')}
                         color="orange" imgSrc='holiday'/>
              <ScoreCard title="필수의료 운영 병원" content={coreCount} onOpen={() => handleModalData('core')}
                         color="red" imgSrc='emergency'/>
            </div>
            <Modal isOpen={isModalOpen} onClose={() => {setIsModalOpen(false); setSelectedHospId(null); 
                   const params = new URLSearchParams(searchParams.toString());
                   params.delete('hospId');
                   router.push(window.location.pathname);}}
                   selectedHospId={selectedHospId!} setSelectedHospId={setSelectedHospId} setSelectedDeptCode={setSelectedDeptCode}
                   title={modalTitle} data={modalData} isLoading={isLoading}
                   currentPage={currentPage} totalPages={totalPages} onPageChange={pageChange}/>
            <div className='xl:col-span-4 xl:row-span-2 flex xl:flex-col flex-col lg:flex-row min-h-0 gap-4 col-span-12 order-last xl:order-0'>
              <div className='flex-1 min-h-75'>
                {hospCate && hospCate.length > 0 ?
                  <Dashboard title="병원 유형별 통계" series={categoryData.series} labels={categoryData.labels} type="donut" /> : 
                  <div className='bg-white p-5 border border-gray-200 rounded-2xl shadow-sm h-full flex items-center justify-center'>
                    <p className='text-gray-500 text-center'>📊 병원 유형 정보가 없습니다.</p>
                  </div> 
                }
              </div>
              <div className='flex-1 min-h-75'>
                {hospDept && hospDept.length > 0 ?
                  <Dashboard title='진료 과목별 통계' series={deptData.series} labels={deptData.labels} type="bar"/> :
                  <div className='bg-white p-5 border border-gray-200 rounded-2xl shadow-sm h-full flex items-center justify-center'>
                    <p className='text-gray-500 text-center'>📊 진료 과목 정보가 없습니다.</p>
                  </div>
                }
              </div>
            </div>
            <div className='xl:col-span-8 min-h-0 p-5 bg-white rounded-2xl border border-gray-200 shadow-sm flex flex-col col-span-12'>
              <div className='flex mb-3 gap-4 p-2'>
                <SelectBox label='시도' options={sidoList} value={selectedSido} sidoChange={handleSidoChange}/>
                <SelectBox label='시군구' options={sggList} value={selectedSgg} sidoChange={setSelectedSgg}/>
              </div>
              <div className='relative flex-1 min-h-125 order-second xl:order-0'>
                {zoomLevel <= 10 &&
                  <div className="absolute top-4 left-4 z-10 bg-white px-5 py-2.5 rounded-full border border-gray-200 shadow-sm font-bold text-gray-700">
                    🔍 {mapAddr}
                  </div>
                }
                <KakaoMap selectedSido={selectedSido} selectedSgg={selectedSgg} onDetailClick={handleDetailView} setMapAddr={setMapAddr} setZoomLevel={setZoomLevel}
                          markers={displayMarker} onBoundsChange={handleBoundsChange} setSelectedSido={setSelectedSido} setSelectedSgg={setSelectedSgg}
                          fetchHospCount={fetchTotalCount} fetchNightCount={fetchNightCount} fetchCoreCount={fetchCoreCount} fetchHoildayCount={fetchHolidayCount}
                          fetchHospCategory={fetchHospCategory} fetchHospDept={fetchHospDept}
                          fetchHospInfo={fetchHospInfo} fetchHolidayHosp={fetchHolidayHosp}
                          onRegionChange={(sido, sgg) => {setCurrentRegion({ sido: sido || '', sgg: sgg || '' });}}/>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}

  export default function FinalPage() {
  return (
    <Suspense fallback={<div>페이지 로딩 중...</div>}>
      <MedicalInfoContent />
    </Suspense>
  );}



