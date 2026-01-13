'use client';
import Link from "next/link";

interface SideBarProps {
  collapsed: boolean,
  setCollapsed: (value: boolean) => void;
}

export default function SideBar({collapsed, setCollapsed}: SideBarProps) {
  return (
    <aside className={`${collapsed ? 'md:w-16' : 'md:w-55'} fixed w-0 top-0 left-0 z-40 h-screen bg-[#1A2B3C]
                      transition-all duration-300 overflow-hidden`}>
      <div className='h-full flex flex-col'>
        <div className={`${collapsed ? 'justify-center' : 'justify-end'} flex m-3`}>
          <button className='p-2 hover:bg-[#314E6E] rounded-lg' onClick={() => {setCollapsed(!collapsed)}}>
            <img src="../dock_to_right.svg" />
          </button>
        </div>
        <div className={`${collapsed ? 'px-3' : 'px-4'} h-full`}>
          <ul className="space-y-2 font-medium text-white">
            <li>
              <Link href="#" className={`${collapsed ? 'px-2 py-2 justify-center' : 'px-2.5 py-1.5'} flex items-center hover:bg-[#314E6E] rounded-lg`}>
                <img src="../rocket_launch.svg"/>
                <span className={`${collapsed ? 'md:hidden' : 'md:inline-flex'} flex-1 ms-3 whitespace-nowrap hidden`}>프로젝트 소개</span>  
              </Link>
            </li>
            <li>
              <Link href="#" className={`${collapsed ? 'px-2 py-2 justify-center' : 'px-2.5 py-1.5'} flex items-center hover:bg-[#314E6E] rounded-lg`}>
                <img src="../dashboard.svg" />
                <span className={`${collapsed ? 'md:hidden' : 'md:inline-flex'} flex-1 ms-3 whitespace-nowrap hidden`}>대시보드</span>
              </Link>
            </li>
            <li>
              <Link href="#" className={`${collapsed ? 'px-2 py-2 justify-center' : 'px-2.5 py-1.5'} flex items-center hover:bg-[#314E6E] rounded-lg`}>
                <img src="../dashboard.svg" />
                <span className={`${collapsed ? 'md:hidden' : 'md:inline-flex'} flex-1 ms-3 whitespace-nowrap hidden`}>사용자 관리</span>
              </Link>
            </li>
            <li>
              <Link href="#" className={`${collapsed ? 'px-2 py-2 justify-center' : 'px-2.5 py-1.5'} flex items-center hover:bg-[#314E6E] rounded-lg`}>
                <img src="../dashboard.svg" />
                <span className={`${collapsed ? 'md:hidden' : 'md:inline-flex'} flex-1 ms-3 whitespace-nowrap hidden`}>대시보드</span>
              </Link>
            </li>
            <li>
              <Link href="#" className={`${collapsed ? 'px-2 py-2 justify-center' : 'px-2.5 py-1.5'} flex items-center hover:bg-[#314E6E] rounded-lg`}>
                <img src="../dashboard.svg" />
                <span className={`${collapsed ? 'md:hidden' : 'md:inline-flex'} flex-1 ms-3 whitespace-nowrap hidden`}>뭐하지</span>
              </Link>
            </li>
            <li>
              <Link href="#" className={`${collapsed ? 'px-2 py-2 justify-center' : 'px-2.5 py-1.5'} flex items-center hover:bg-[#314E6E] rounded-lg`}>
                <img src="../dashboard.svg" />
                <span className={`${collapsed ? 'md:hidden' : 'md:inline-flex'} flex-1 ms-3 whitespace-nowrap hidden`}>뭐하지</span>
              </Link>
            </li>
          </ul>
        </div>
      </div>
    </aside>
  );
}