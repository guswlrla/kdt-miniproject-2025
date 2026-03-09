'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link'; 
import Header from '@/components/Header';

export default function LoginPage() {
  const router = useRouter();
  const [credentials, setCredentials] = useState({ username: '', password: '' }); // 아이디와 비밀번호를 담는 변수
  const [rememberId, setRememberId] = useState(false); // 체크박스 상태 여부


  // 사용자가 입력 시 실시간으로 값을 업데이트
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target; // e.target에서 입력 창 이름과 입력한 값을 가지고 옴
    setCredentials(prev => ({ ...prev, [name]: value })); // 입력이 일어난 칸의 값만 새로운 값으로 덮음
  };

  // 로그인 버튼이 눌렸을 때 실행
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault(); // 버튼 클릭 시 페이지 새로고침 방지

    if(rememberId) { // 체크박스가 체크되어 있으면
      localStorage.setItem('savedId', credentials.username); // 입력한 아이디를 브라우저에 저장
    } else {
      localStorage.removeItem('savedId'); // 저장되어 있을 아이디 삭제
    }
    
    try {
      const response = await fetch("http://10.125.121.178:8080/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(credentials), 
      });

      if (response.ok) {
        const jwtToken = response.headers.get('Authorization');
        const role = response.headers.get('role');
        const username = response.headers.get('username')

        const resp = await fetch(`http://10.125.121.178:8080/api/getMember/${username}`)
        const data = await resp.json()
        const alias = data.alias

        if (jwtToken && role && username) {
          sessionStorage.setItem('jwtToken', jwtToken);
          sessionStorage.setItem('username', username);
          sessionStorage.setItem('role', role);
          sessionStorage.setItem('alias', alias);

          alert("로그인 성공!");
          

          // 로그인 성공 로직 내부
          const redirectUrl = sessionStorage.getItem('redirectUrl');

          if (redirectUrl) {
              // 저장된 URL이 있으면 해당 페이지로 이동 후 데이터 삭제
              sessionStorage.removeItem('redirectUrl');
              router.push(redirectUrl);
          } else {
              // 저장된 URL이 없으면 기본 페이지(예: 메인)로 이동
              router.push('/medicalInfo');
          }
        }
      } else {
        alert("로그인 실패! 아이디나 비밀번호를 확인하세요.");
      }
    } catch (error) {
      alert("서버 연결 오류가 발생했습니다.");
    }
  }

  useEffect(() => {
    const savedId = localStorage.getItem('savedId'); // 로컬스토리지에서 저장된 아이디가 있는 지 확인
    if(savedId) {
      setCredentials(prev => ({ ...prev, username: savedId })); // 입력 창에 넣어줌
      setRememberId(true); // 체크박스에 체크표시
    }
  }, [])

  return (
    <>
    <Header />
    <div className='w-full h-screen bg-gray-50 flex flex-col justify-center items-center'>
      <div className='w-1/2 max-w-sm bg-white px-6 py-8 flex flex-col justify-center items-start rounded-xl text-gray-700 border border-gray-200 shadow-md'>
        <h2 className='text-lg font-bold mb-7'>계정에 로그인하세요.</h2>
        <form onSubmit={handleLogin} className='w-full flex flex-col space-y-3'>
          <div>
            <label className='block mb-1 text-xs font-semibold'>아이디</label>
            <input type='text' name='username' value={credentials.username || ''} onChange={handleChange} required
                   className='w-full bg-gray-50 p-2.5 border border-gray-300 text-gray-700 rounded-lg focus:ring-2 focus:ring-[#204571] outline-none transition-all' />
          </div>
          <div>
            <label className='block mb-1 text-xs font-semibold'>비밀번호</label>
            <input type='password' name='password' value={credentials.password} onChange={handleChange} required
                   className='w-full bg-gray-50 p-2.5 border border-gray-300 text-gray-700 rounded-lg focus:ring-2 focus:ring-[#204571] outline-none transition-all'/>
          </div>
          <div className='flex justify-start items-center gap-1.5'>
            <input type='checkbox' checked={rememberId} onChange={e => setRememberId(e.target.checked)} className='w-4 h-4 border border-gray-300 rounded bg-gray-50'/>
            <label className='text-sm'>아이디 기억하기</label>
          </div>
          <button type='submit' className='w-full bg-[#41abdd] hover:bg-[#3fa4d3] text-white text-center px-5 py-2.5 rounded-lg font-medium transition-all'>로그인</button>
          <p className='text-sm text-gray-500'>
            <span>아직 계정이 없다면? </span>
            <Link href='/join' className='font-medium text-[#3BA9D2] hover:underline'>회원가입</Link>
          </p>
          <div className='flex items-center py-2'>
            <div className="grow border-t border-gray-200"></div>
            <span className='text-xs text-gray-400 mx-4'>소셜 계정으로 로그인</span>
            <div className="grow border-t border-gray-200"></div>
          </div>
          <div className='flex justify-center gap-4 pt-1'>
            <a href="https://noneffiient-lezlie-progressively.ngrok-free.dev/oauth2/authorization/google"
               className='bg-white rounded-full flex justify-center items-center w-10 h-10 border border-gray-400'>
                <img src='../google.png' className='w-7 h-7'/>
            </a>
            <a href="https://nonefficient-lezlie-progressively.ngrok-free.dev/oauth2/authorization/naver"
               className='rounded-full w-10 h-10'>
              <img src='../naver.png' />
            </a>
          </div>
        </form>
      </div>
    </div>
    </>
  );
}