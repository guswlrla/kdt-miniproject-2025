'use client';

import Link from "next/link";

export default function SideBar() {
  return (
    <aside className="top-0 left-0 z-40 xl:w-55 w-15 h-screen bg-white border-r border-gray-200 transition-all duration-300">
      <div className='h-full flex flex-col'>
        <div className='flex justify-end m-2'>
          <button className='p-2 hover:bg-gray-200 rounded-lg' onClick={()=>{}}>
            <img src="../sidebar-left.svg" className='w-6 h-6'/>
          </button>
        </div>
        <div className="h-full px-4">
          <ul className="space-y-2 font-medium">
            <li>
              <Link href="#" className="flex items-center px-2.5 py-1.5 hover:bg-gray-200 rounded-lg">
                <img src="../document.svg" className='w-5 h-5'/>
                <span className="flex-1 ms-3 whitespace-nowrap xl:inline-flex hidden">프로젝트 소개</span>  
              </Link>
            </li>
            <li>
              <Link href="#" className="flex items-center px-2.5 py-1.5 hover:bg-gray-200 rounded-lg">
                <img src="../location.svg" className='w-5 h-5'/>
                <span className="flex-1 ms-3 whitespace-nowrap xl:inline-flex hidden">대시보드</span>
              </Link>
            </li>
            <li>
              <Link href="#" className="flex items-center px-2.5 py-1.5 hover:bg-gray-200 rounded-lg">
                <img src="../location.svg" className='w-5 h-5'/>
                <span className="flex-1 ms-3 whitespace-nowrap xl:inline-flex hidden">병원 상세정보</span>
              </Link>
            </li>
          </ul>
        </div>
      </div>
    </aside>
    
  );
}