'use client'
import React, { useState } from 'react';

export default function ERInfoPage() {
  const [navOpen, setNavOpen] = useState(false);
  return (
    <div>
      <header className="fixed top-0 z-50 h-14 w-full bg-white xl:ml-55 md:ml-15 border-b border-gray-200">
        <div className="px-3 py-3 lg:px-5 lg:pl-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center justify-start p-2 font-medium">
              <span>🚑 응급실 정보 서비스</span>
            </div>
            {/* <div className="flex items-center">
              <div className="flex items-center ms-3">
                <div>
                  <button type="button" className="flex text-sm bg-gray-800 rounded-full focus:ring-4 focus:ring-gray-300 dark:focus:ring-gray-600" aria-expanded="false" data-dropdown-toggle="dropdown-user">
                    <span className="sr-only">Open user menu</span>
                    <img className="w-8 h-8 rounded-full" src="https://flowbite.com/docs/images/people/profile-picture-5.jpg" alt="user photo" />
                  </button>
                </div>
                <div className="z-50 hidden bg-neutral-primary-medium border border-default-medium rounded-base shadow-lg w-44" id="dropdown-user">
                  <div className="px-4 py-3 border-b border-default-medium" role="none">
                    <p className="text-sm font-medium text-heading" role="none">
                      Neil Sims
                    </p>
                    <p className="text-sm text-body truncate" role="none">
                      neil.sims@flowbite.com
                    </p>
                  </div>
                  <ul className="p-2 text-sm text-body font-medium" role="none">
                    <li>
                      <a href="#" className="inline-flex items-center w-full p-2 hover:bg-neutral-tertiary-medium hover:text-heading rounded" role="menuitem">Dashboard</a>
                    </li>
                  </ul>
                </div>
              </div>
            </div> */}
          </div>
        </div>
      </header>

      <aside className="w-0 fixed top-0 left-0 z-40 xl:w-55 md:w-15 h-full bg-white border-r border-gray-200 transition-[width] duration-300">
        <div className="h-full px-2 py-3 overflow-y-auto">
          <ul className="space-y-2 font-medium">
            <li className='flex xl:justify-end md:justify-start'>
              <button className='p-2 hover:bg-gray-200 rounded-lg' onClick={()=>setNavOpen(true)}>
                <img src="../sidebar-left.svg" className='w-6 h-6'/>
              </button>
            </li>
            <li>
              <a href="#" className="xl:w-full md:w-10 md:h-10 flex items-center px-2.5 py-1.5 hover:bg-gray-200 rounded-lg">
                  <img src="../document.svg" className='w-5 h-5' />
                  <span className="flex-1 ms-3 whitespace-nowrap md:hidden xl:inline-flex">프로젝트 소개</span>  
              </a>
            </li>
            <li>
              <a href="#" className="xl:w-full md:w-10 md:h-10 flex items-center px-2.5 py-1.5 hover:bg-gray-200 rounded-lg">
                <img src="../location.svg" className='w-5 h-5' />
                <span className="flex-1 ms-3 whitespace-nowrap md:hidden xl:inline-flex">응급실 위치</span>
              </a>
            </li>
          </ul>
        </div>
      </aside>

      <div className="flex justify-center items-center p-4 xl:ml-55 md:ml-15 mt-14 bg-gray-100 min-h-screen">
        <div className='bg-white rounded-xl p-3 border border-gray-200 shadow-sm'>
          지도 넣고 아이콘들 보여서 위에 빵 뜨게
        </div>
      </div>
    </div>
  );
}



