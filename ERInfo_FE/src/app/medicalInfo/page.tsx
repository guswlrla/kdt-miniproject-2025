'use client'
import { useEffect, useState } from 'react';
import KakaoMap from '@/components/KakaoMap';
import SideBar from '@/components/SideBar';
import Header from '@/components/Header';
import ScoreCard from '@/components/ScoreCard';
import Dashboard from '@/components/Dashboard';
import SelectBox from '@/components/SelectBox';

type HospItem = {
  totalCount: string;
}

export default function medicalInfoPage() {
  const [hospData, setHospData] = useState<HospItem[]>([]);
  const fetchData = async() => {
      try{
        const resp = await fetch('http://10.125.121.178:8080/api/medicalSigungu');
        if(!resp.ok) {
          throw new Error("병원 정보를 불러오는데 실패했습니다!");
        }
        const { totalCount } = await resp.json();
        // console.log(resp.json());
        setHospData(prev => [... prev, ...totalCount]);
      } catch(error) {
        console.error(error);
      }
    }
  useEffect(() => {
    fetchData();
  }, [])
    
  return (
    <div className="flex h-screen">
      <SideBar />
      <div className='bg-gray-50 relative flex flex-1'> 
        <main className='flex flex-1 flex-col'>
          <Header />
          <div className='p-5 flex-1 min-h-0 grid grid-cols-12 grid-rows-[auto_1fr] gap-4'>
              <div className='xl:col-span-8 grid grid-cols-4 gap-4 col-span-12'>
                {hospData.map(item =>
                  <ScoreCard title="총 병원 수" content={item.totalCount}/>)
                }
                <ScoreCard title="총 병원 수" content=""/>
                <ScoreCard title="총 병원 수" content=""/>
                <ScoreCard title="총 병원 수" content=""/>
              </div>
              <div className='xl:col-span-4 row-span-2 flex xl:flex-col flex-row min-h-0 gap-4 col-span-12'>
                <div className='flex-1'>
                  <Dashboard />
                </div>
                <div className='flex-1'>
                  <Dashboard />
                </div>
              </div>
              <div className='xl:col-span-8 min-h-0 p-5 bg-white rounded-2xl border border-gray-200 shadow-sm flex flex-col col-span-12'>
                <div className='flex mb-3 gap-4 p-2'>
                  <SelectBox label='시도' />
                  <SelectBox label='시군구'/>
                </div>
                <div className='h-full'>
                  <KakaoMap />
                </div>
              </div>
          </div>
        </main>
      </div>
    </div>
  );
}



