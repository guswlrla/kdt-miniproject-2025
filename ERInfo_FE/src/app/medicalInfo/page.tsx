'use client'
import { useEffect, useState } from 'react';
import KakaoMap from '@/components/KakaoMap';
import SideBar from '@/components/SideBar';
import Header from '@/components/Header';
import ScoreCard from '@/components/ScoreCard';
import SelectBox from '@/components/SelectBox';
import dynamic from 'next/dynamic';
const Dashboard = dynamic(() => import('@/components/Dashboard'), { ssr: false });
import { HospCategory } from '@/types/HospCategory';
import { HospDept } from '@/types/HospDept';

export default function medicalInfoPage() {
  const [totalCount, setTotalCount] = useState<number>(0); // 전체 병원 수
  const [nightHosp, setNightHosp] = useState<number>(0); // 야간진료 운영 병원 수
  const [holidayHosp, setHolidayHosp] = useState<number>(0); // 공휴일 운영 병원 수
  const [coreHosp, setCoreHosp] = useState<number>(0); // 필수의료 운영 병원 수

  const [sidoList, setSidoList] = useState<string[]>([]); // 시도 목록
  const [sggList, setSggList] = useState<string[]>([]); // 시군구 목록
  const [selectedSido, setSelectedSido] = useState<string>(''); // 선택된 시도
  const [selectedSgg, setSelectedSgg] = useState<string>(''); // 선택된 시군구

  const [collapsed, setCollapsed] = useState<boolean>(false); // 사이드바 토글

  const [hospCate, setHospCate] = useState<HospCategory[]>([]);
  const [hospDept, setHospDept] = useState<HospDept[]>([]);
  const categoryData = {
    series: hospCate.map(item => item.count),
    labels: hospCate.map(item => item.typeName)
  }
  const deptData = {
    series: [{name: '병원 수', data: hospDept.map(item => item.count)}],
    labels: hospDept.map(item => item.deptCode)
  }

  // 전체 병원 수 불러오기
  const fetchTotalCount = async(sido?: string, sgg?: string) => {
    let url = 'http://10.125.121.178:8080/api/medicalSigungu'
    if(sido && sgg) {
      url += `?sidoName=${encodeURIComponent(sido)}&sigunguName=${encodeURIComponent(sgg)}`;
    } else if(sido) {
      url += `?sidoName=${encodeURIComponent(sido)}`
    }

    try{
      const resp = await fetch(url);
      if(!resp.ok) {
        throw new Error("병원 정보를 불러오는데 실패했습니다!");
      }
      const { totalElements } = await resp.json();
      setTotalCount(totalElements);
    } catch(error) {
      console.error(error);
    }
  }

  // 야간진료 운영 병원 수 불러오기
  const fetchNightHospCount = async(sido?: string, sgg?: string) => {
    let url = 'http://10.125.121.178:8080/api/medicalNight'
    if(sido && sgg) {
      url += `?sidoName=${encodeURIComponent(sido)}&sigunguName=${encodeURIComponent(sgg)}`;
    } else if(sido) {
      url += `?sidoName=${encodeURIComponent(sido)}`
    }

    try{
      const resp = await fetch(url);
      if(!resp.ok) {
        throw new Error("야간진료 운영 병원 정보를 불러오는데 실패했습니다!");
      }
      const totalCount = await resp.json();
      setNightHosp(totalCount);
    } catch(error) {
      console.error(error);
    }
  }

  // 공휴일 운영 병원 수 불러오기
  const fetchHolidayHospCount = async(sido?: string, sgg?: string) => {
    let url = 'http://10.125.121.178:8080/api/medicalHoliday'
    if(sido && sgg) {
      url += `?sidoName=${encodeURIComponent(sido)}&sigunguName=${encodeURIComponent(sgg)}`;
    } else if(sido) {
      url += `?sidoName=${encodeURIComponent(sido)}`
    }

    try{
      const resp = await fetch(url);
      if(!resp.ok) {
        throw new Error("공휴일 운영 병원 정보를 불러오는데 실패했습니다!");
      }
      const totalCount = await resp.json();
      setHolidayHosp(totalCount);
    } catch(error) {
      console.error(error);
    }
  }

  // 필수의료 운영 병원 수 불러오기
  const fetchCoreHospCount = async(sido?: string, sgg?: string) => {
    let url = 'http://10.125.121.178:8080/api/medicalEssential'
    if(sido && sgg) {
      url += `?sidoName=${encodeURIComponent(sido)}&sigunguName=${encodeURIComponent(sgg)}`;
    } else if(sido) {
      url += `?sidoName=${encodeURIComponent(sido)}`
    }

    try{
      const resp = await fetch(url);
      if(!resp.ok) {
        throw new Error("필수의료 운영 병원 정보를 불러오는데 실패했습니다!");
      }
      const totalCount = await resp.json();
      setCoreHosp(totalCount);
    } catch(error) {
      console.error(error);
    }
  }

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
  }
  
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
  }

  // 병원 카테고리 불러오기
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
  }

  const fetchHospDept = async(sido?: string, sgg?: string) => {
    let url = 'http://10.125.121.178:8080/api/medicalDept';
    if(sido && sgg) {
      url += `?sidoName=${encodeURIComponent(sido)}&sigunguName=${encodeURIComponent(sgg)}`;
    } else if(sido) {
      url += `?sidoName=${encodeURIComponent(sido)}`
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
  }
    
  useEffect(() => {
    fetchSidoList();
  }, []);

  useEffect(() => {
    if (!selectedSido) return;
    fetchSggList(selectedSido);
  }, [selectedSido]);

  useEffect(() => {
    fetchHospCategory(selectedSido, selectedSgg); // 해당 시도, 시군구의 대시보드(없으면 전국)
    fetchHospDept(selectedSido, selectedSgg);
    fetchTotalCount(selectedSido, selectedSgg);
    fetchNightHospCount(selectedSido, selectedSgg);
    fetchHolidayHospCount(selectedSido, selectedSgg);
    fetchCoreHospCount(selectedSido, selectedSgg);
  }, [selectedSido, selectedSgg]);

  const handleSidoChange = (value: string) => {
    setSelectedSido(value);
    setSelectedSgg(''); // 시도 바뀌면 선택된 시군구 초기화
    setSggList([]); // 이전 시군구 리스트 제거
  }

  return (
    <div className="flex min-h-screen xl:h-screen overflow-hidden">
      <SideBar collapsed={collapsed} setCollapsed={setCollapsed} />
      <div className={`${collapsed ? 'md:pl-16' : 'md:pl-55'} bg-gray-50 relative flex flex-1`}> 
        <main className='flex flex-1 flex-col overflow-hidden'>
          <Header />
          <div className='p-5 flex-1 min-h-0 grid grid-cols-12 grid-rows-[auto_1fr] gap-4'>
              <div className='xl:col-span-8 grid grid-cols-4 gap-4 col-span-12'>
                <ScoreCard title="전체 병원 수" content={totalCount}/>
                <ScoreCard title="야간진료 운영 병원" content={nightHosp}/>
                <ScoreCard title="일요일/공휴일 진료" content={holidayHosp}/>
                <ScoreCard title="필수의료 운영 병원" content={coreHosp}/>
              </div>
              <div className='xl:col-span-4 row-span-2 flex xl:flex-col flex-row min-h-0 gap-4 col-span-12'>
                <div className='flex-1 min-h-75'>
                  <Dashboard title="병원 유형별 통계" series={categoryData.series} labels={categoryData.labels} type="donut" />
                </div>
                <div className='flex-1 min-h-75'>
                  <Dashboard title='진료 과목별 통계' series={deptData.series} labels={deptData.labels} type="bar"/>
                </div>
              </div>
              <div className='xl:col-span-8 min-h-0 p-5 bg-white rounded-2xl border border-gray-200 shadow-sm flex flex-col col-span-12'>
                <div className='flex mb-3 gap-4 p-2'>
                  <SelectBox label='시도' options={sidoList} value={selectedSido} sidoChange={handleSidoChange}/>
                  <SelectBox label='시군구' options={sggList} value={selectedSgg} sidoChange={setSelectedSgg}/>
                </div>
                <div className='flex-1 min-h-125'>
                  <KakaoMap selectedSido={selectedSido} selectedSgg={selectedSgg} />
                </div>
              </div>
          </div>
        </main>
      </div>
    </div>
  );
}



