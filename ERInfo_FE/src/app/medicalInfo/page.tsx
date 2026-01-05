'use client'
import { useEffect, useState } from 'react';
import KakaoMap from '@/components/KakaoMap';
import SideBar from '@/components/SideBar';
import Header from '@/components/Header';
import ScoreCard from '@/components/ScoreCard';
import SelectBox from '@/components/SelectBox';
import dynamic from 'next/dynamic';
const Dashboard = dynamic(() => import('@/components/Dashboard'), { ssr: false });

export default function medicalInfoPage() {
  const [collapsed, setCollapsed] = useState<boolean>(false);

  // 전국 병원 수
  const [totalCount, setTotalCount] = useState<number>(0);
  const fetchTotalCount = async() => {
      try{
        const resp = await fetch('http://10.125.121.178:8080/api/medicalSigungu');
        if(!resp.ok) {
          throw new Error("병원 정보를 불러오는데 실패했습니다!");
        }
        const { totalElements } = await resp.json();
        setTotalCount(totalElements);
      } catch(error) {
        console.error(error);
      }
  }

  // select 박스의 시도 목록
  const [sidoList, setSidoList] = useState<string[]>([]); // 시도 목록
  const fetchSido = async() => {
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
  
  // select 박스의 시군구 목록
  const [sggList, setSggList] = useState<string[]>([]); // 시군구 목록
  const fetchSgg = async(sido: string) => {
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

  const [selectedSido, setSelectedSido] = useState<string>(''); // 선택된 시도
  const [selectedSgg, setSelectedSgg] = useState<string>(''); // 선택된 시군구
    
  useEffect(() => {
    fetchTotalCount();
    fetchSido();
  }, []);

  useEffect(() => {
    if (!selectedSido) return;
    fetchSgg(selectedSido);
  }, [selectedSido]);

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
                <ScoreCard title="24시간 운영 병원" content={totalCount}/>
                <ScoreCard title="일요일/공휴일 진료" content={totalCount}/>
                <ScoreCard title="필수의료 운영병원" content={totalCount}/>
              </div>
              <div className='xl:col-span-4 row-span-2 flex xl:flex-col flex-row min-h-0 gap-4 col-span-12'>
                <div className='flex-1 min-h-75'>
                  <Dashboard />
                </div>
                <div className='flex-1 min-h-75'>
                  <Dashboard />
                </div>
              </div>
              <div className='xl:col-span-8 min-h-0 p-5 bg-white rounded-2xl border border-gray-200 shadow-sm flex flex-col col-span-12'>
                <div className='flex mb-3 gap-4 p-2'>
                  <SelectBox label='시도' options={sidoList} value={selectedSido} sidoChange={handleSidoChange}/>
                  <SelectBox label='시군구' options={sggList} value={selectedSgg} sidoChange={setSelectedSgg}/>
                </div>
                <div className='flex-1 min-h-125'>
                  <KakaoMap />
                </div>
              </div>
          </div>
        </main>
      </div>
    </div>
  );
}



