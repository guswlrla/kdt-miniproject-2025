'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function JoinPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({ // 입력 폼 데이터를 하나의 객체로 관리
    username: '',
    password: '',
    confirmPassword: '',
    alias: '',
  });

  // 중복 확인 결과 상태
  const [usernameChecked, setUsernameChecked] = useState<boolean>(false);
  const [aliasChecked, setAliasChecked] = useState<boolean>(false);

  const [passwordMsg, setPasswordMsg] = useState<string>(''); // 비밀번호 일치 메시지 상태

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    
    // 아이디나 닉네임을 수정하면 중복 결과 초기화
    if (name === 'username') setUsernameChecked(false);
    if (name === 'alias') setAliasChecked(false);
  }

  // 백엔드 api를 호출해서 사용 가능한 값인지 확인
  const checkDuplicate = async (type: string) => {
    const value = (type === 'username') ? formData.username : formData.alias;
    if (!value) return alert(`${type === 'username' ? '아이디' : '닉네임'}를 입력해주세요.`);

    try {
      const response = await fetch(`http://10.125.121.178:8080/api/check-duplicate?type=${type}&value=${value}`);

      if (response.ok) {
        alert(`사용 가능한 ${type === 'username' ? '아이디' : '닉네임'}입니다.`);
        if (type === 'username') setUsernameChecked(true);
        if (type === 'alias') setAliasChecked(true);
      } else {
        alert(`이미 사용 중인 ${type === 'username' ? '아이디' : '닉네임'}입니다.`);
      }
    } catch (error) {
      alert("연결 오류가 발생했습니다.");
    }
  }

  // 모든 조건이 충족되었을 때, 서버로 데이터 전송
  const handleJoin = async (e: React.FormEvent) => {
    e.preventDefault(); // 폼 제출 시 페이지 새로고침 방지

    if (!usernameChecked || !aliasChecked) {
      alert("아이디와 닉네임 중복 확인을 완료해주세요.");
      return;
    }

    try {
      const response = await fetch("http://10.125.121.178:8080/api/join", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          username: formData.username,
          password: formData.password,
          alias: formData.alias
        }),
      });

      if (response.ok) {
        alert("회원가입이 완료되었습니다.");
        router.push('/');
      } else {
        alert("회원가입이 실패했습니다.");
      }
    } catch (error) {
      alert("서버 연결 오류가 발생했습니다.");
    }
  }

  // 비밀번호와 재입력란이 바뀔 때마다 실행
  useEffect(() => {
    if (formData.confirmPassword === '') { // 재입력란이 비어있으면 메시지 숨김
      setPasswordMsg('');
    } else if (formData.password === formData.confirmPassword) {
      setPasswordMsg('✅ 비밀번호가 일치합니다.');
    } else {
      setPasswordMsg('❌ 비밀번호가 일치하지 않습니다.');
    }
  }, [formData.password, formData.confirmPassword]);

  return (
    <div className='w-full h-screen bg-gray-50 flex flex-col justify-center items-center'>
      <div className='w-1/2 max-w-md bg-white px-6 py-8 flex flex-col justify-center items-start rounded-xl text-gray-700 border border-gray-200 shadow-md'>
        <h2 className='text-lg font-bold mb-7'>계정 생성하기</h2>
        <form onSubmit={handleJoin} className='w-full flex flex-col space-y-3'>
          <div className='space-y-1'>
            <label className='block mb-1 text-xs font-semibold'>아이디</label>
            <div className='relative flex items-center'>
              <input type='text' name='username' placeholder='아이디를 입력하세요.' onChange={handleChange} required 
                     className='w-full bg-gray-50 p-2.5 border border-gray-300 text-gray-700 rounded-lg focus:ring-2 focus:ring-[#204571] outline-none transition-all' />
              <button type='button' onClick={() => checkDuplicate('username')} 
                      className='absolute right-2 px-3 py-1.5 w-20 bg-[#475569] rounded-lg text-sm text-white transition-all'>{usernameChecked ? "확인완료" : "중복확인"}</button>
            </div>
          </div>
          <div className='space-y-1'>
            <label className='block mb-1 text-xs font-semibold'>닉네임</label>
            <div className='relative flex items-center'>
              <input type='text' name='alias' placeholder='닉네임을 입력하세요.' onChange={handleChange} required 
                     className='w-full bg-gray-50 p-2.5 border border-gray-300 text-gray-700 rounded-lg focus:ring-2 focus:ring-[#204571] outline-none transition-all'/>
              <button type='button' onClick={() => checkDuplicate('alias')} 
                      className='absolute right-2 px-3 py-1.5 w-20 bg-[#475569] rounded-lg text-sm text-white transition-all'>{aliasChecked ? "확인완료" : "중복확인"}</button>
            </div>
          </div>
          <div className='space-y-1'>
            <label className='block mb-1 text-xs font-semibold'>비밀번호</label>
            <input type='password' name='password' value={formData.password} placeholder='비밀번호를 입력하세요.' onChange={handleChange} required 
                   className='w-full bg-gray-50 p-2.5 border border-gray-300 text-gray-700 rounded-lg focus:ring-2 focus:ring-[#204571] outline-none transition-all'/>
          </div>
          <div className='space-y-1'>
            <label className='block mb-1 text-xs font-semibold'>비밀번호 확인</label>
            <input type='password' name='confirmPassword' value={formData.confirmPassword} placeholder='비밀번호를 재입력하세요.' onChange={handleChange} required
                   className='w-full bg-gray-50 p-2.5 border border-gray-300 text-gray-700 rounded-lg focus:ring-2 focus:ring-[#204571] outline-none transition-all'/>
            {passwordMsg && <p className={`text-xs mt-1 ${formData.password === formData.confirmPassword ? 'text-blue-500' : 'text-red-500'}`}>{passwordMsg}</p>}
          </div>
          <button type='submit' disabled={formData.password !== formData.confirmPassword || formData.confirmPassword === ''}
                  className='w-full bg-[#41abdd] hover:bg-[#3fa4d3] text-white text-center px-5 py-2.5 rounded-lg font-medium mt-3 transition-all'>
            <span>가입하기</span>
          </button>
          <div className='flex items-center py-5'>
            <div className="grow border-t border-gray-200"></div>
          </div>
          <p className='text-sm text-gray-500 text-center'>
            <span>이미 계정이 있다면? </span>
            <a href='/' className='font-medium text-[#3BA9D2] hover:underline'>로그인</a>
          </p>
        </form>
      </div>
    </div>
  );
}