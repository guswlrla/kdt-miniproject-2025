'use client'
import dynamic from 'next/dynamic';
import React, { useEffect, useState } from 'react';
import KakaoMap from '../kakaoMap';
import SideBar from '@/components/SideBar';
import Header from '@/components/Header';
import ScoreCard from '@/components/ScoreCard';

export default function medicalInfoPage() {
  return (
    <div className="flex h-screen">
      <SideBar />
      <div className='bg-gray-50 relative flex flex-1'> 
        <main className='flex flex-1 flex-col'>
          <Header />
          <div className='p-5'>
            <div className='grid grid-cols-8 gap-4'>
              <ScoreCard/>
              <ScoreCard/>
              <ScoreCard/>
              <ScoreCard/>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}



