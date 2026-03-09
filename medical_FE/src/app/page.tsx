'use client';

import React from 'react';
import Header from '@/components/Header';
import Link from 'next/link';

export default function IntroPage() {
  return (
    <div className='w-full min-h-screen flex justify-center items-center bg-gray-50'>
      <main className='flex-1 flex justify-center items-center p-6'>
        <div className='bg-white w-full max-w-5xl rounded-3xl shadow-xl border border-gray-200'>
          <div className='w-full flex p-12 md:p-20 items-center gap-5'>
            <div className='flex-1 space-y-8 text-left'>
              <div className='space-y-2'>
                <div className='flex justify-start items-center'>
                  <img src='../logo.png' className='w-15 mr-2'/>
                  <h2 className='text-5xl font-extrabold text-[#204571] tracking-wider'>메디가이드</h2>
                </div>
                <p className='text-xl text-gray-400 font-medium'>Medi Guide: Your Health Companion</p>
              </div>
              <div className='h-1 w-25 bg-linear-to-r from-[#41abdd] to-[#417fdd] rounded-full'></div>
              <p className='text-gray-500 text-lg'>
                <span>전국 병원 상세 정보 & 위치 검색<br /></span>
                <span className='block md:inline'>어디로 가야 할지 고민될 때, 검색부터 후기까지 한 번에</span>
              </p>
              <Link href='/medicalInfo' className='bg-[#41abdd] hover:bg-[#3fa4d3] transition-all px-10 py-5 text-white rounded-full font-bold shadow-md'>
                시작하기
              </Link>
            </div>
            <div className='flex-1 relative flex justify-center items-center'>
              <div className='absolute w-72 h-72 bg-sky-100 rounded-full blur-3xl'></div>
              <img src='/pic-Photoroom.png' className='relative z-10 w-full max-w-md object-contain drop-shadow-2xl'/>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}