'use client';
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

interface SideBarProps {
  collapsed: boolean,
  setCollapsed: (value: boolean) => void;
}

export default function SideBar({ collapsed, setCollapsed }: SideBarProps) {
  const [loginState, setLoginState] = useState(false);
  const [sessionState, setSessionState] = useState({alias: '', role: ''});
  const router = useRouter();

  useEffect(() => {
    const username = sessionStorage.getItem('username');
    const alias = sessionStorage.getItem('alias');
    const role = sessionStorage.getItem('role');
    if (username) {
      setSessionState({alias: alias!, role: role!})
      setLoginState(true);
    }
  }, []);

  const logout = () => {
    if (window.confirm('정말 로그아웃하시겠습니까?')) {
      sessionStorage.clear();
      setLoginState(false);
      alert('로그아웃되었습니다.');
      router.push('/medicalInfo')
    }
  }

  return (
    <aside className={`${collapsed ? 'md:w-16' : 'md:w-55'} fixed w-0 top-14 left-0 z-40 h-[calc(100vh-3.5rem)] bg-[#1A2B3C]
                      transition-all duration-300 overflow-hidden`}>
      <div className='h-full flex flex-col'>
        <div className={`${collapsed ? 'justify-center' : 'justify-end'} flex m-3`}>
          <button className='p-2 hover:bg-[#314E6E] rounded-lg' onClick={() => { setCollapsed(!collapsed) }}>
            <img src="../dock_to_right.svg" />
          </button>
        </div>
        <div className={`${collapsed ? 'px-3' : 'px-4'} h-full`}>
          <ul className="space-y-2 font-medium text-white">
            <li>
              <Link href="/" className={`${collapsed ? 'px-2 py-2 justify-center' : 'px-2.5 py-1.5'} flex items-center hover:bg-[#314E6E] rounded-lg`}>
                <img src="../rocket_launch.svg" />
                <span className={`${collapsed ? 'md:hidden' : 'md:inline-flex'} flex-1 ms-3 whitespace-nowrap hidden`}>프로젝트 소개</span>
              </Link>
            </li>
            <li>
              <Link href="/medicalInfo" className={`${collapsed ? 'px-2 py-2 justify-center' : 'px-2.5 py-1.5'} flex items-center hover:bg-[#314E6E] rounded-lg`}>
                <img src="../dashboard.svg" />
                <span className={`${collapsed ? 'md:hidden' : 'md:inline-flex'} flex-1 ms-3 whitespace-nowrap hidden`}>병원 찾기</span>
              </Link>
            </li>
            <li>
              {
                sessionState.role === "ROLE_ADMIN" ?
                  <Link href="/admin" className={`${collapsed ? 'px-2 py-2 justify-center' : 'px-2.5 py-1.5'} flex items-center hover:bg-[#314E6E] rounded-lg`}>
                    <img src="../settings.svg" />
                    <span className={`${collapsed ? 'md:hidden' : 'md:inline-flex'} flex-1 ms-3 whitespace-nowrap hidden`}>관리자 페이지</span>
                  </Link>
                  : ""
              }
            </li>
          </ul>
        </div>
        <div className="p-3 border-t border-slate-700 bg-[#162534] mt-auto">
          {loginState ? (
            <div className={`flex flex-col ${collapsed ? 'items-center' : 'items-start'} space-y-3`}>
              <div className="flex items-center w-full">
                {/* 아바타 */}
                <div className="w-10 h-10 rounded-full bg-blue-500 flex items-center justify-center text-white font-bold shrink-0 shadow-inner">
                  {sessionState.alias!.charAt(0) || 'U'}
                </div>
                {!collapsed && (
                  <div className="ms-3 overflow-hidden text-ellipsis">
                    <p className="text-sm font-semibold text-white truncate">{sessionState.alias!} 님</p>
                    <p className="text-xs text-slate-400 truncate">환영합니다!</p>
                  </div>
                )}
              </div>
              {
                collapsed ? '' :
                  <button
                    onClick={logout}
                    className={`px-4 py-2 w-full text-sm bg-red-500/10 text-red-400 hover:bg-red-500 hover:text-white border border-red-500/20 rounded-lg transition-all flex items-center justify-center gap-2`}
                  >로그아웃</button>
              }

            </div>
          ) : (
            <Link
              href='/login'
              onClick={() => sessionStorage.setItem("redirectUrl", window.location.pathname)}
              className={`flex items-center justify-center ${collapsed ? 'p-2' : 'px-4 py-2 w-full'} bg-gray-600 hover:bg-gray-500 text-white rounded-lg transition-all font-medium`}
            >
              {collapsed ? '🔑' : '로그인하기'}
            </Link>
          )}
        </div>
      </div>
    </aside>
  );
}