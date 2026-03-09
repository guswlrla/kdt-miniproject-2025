'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Header from '@/components/Header';

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
  const [usernameStatus, setUsernameStatus] = useState<'none' | 'success' | 'error'>('none');
  const [aliasChecked, setAliasChecked] = useState<boolean>(false);
  const [aliasStatus, setAliasStatus] = useState<'none' | 'success' | 'error'>('none');

  const [passwordMsg, setPasswordMsg] = useState<string>(''); // 비밀번호 일치 메시지 상태

  // 유효성 검사
  const [passwordRule, setPasswordRule] = useState<string>('');
  const [usernameRule, setUsernameRule] = useState<string>('');

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    
    // 아이디나 닉네임을 수정하면 중복 결과 초기화
    if (name === 'username') {
      setUsernameChecked(false);
      setUsernameStatus('none');
    }
    if (name === 'alias') {
      setAliasChecked(false);
      setAliasStatus('none');
    }
  }

  // 유효성 검사 규칙
  const validationRules = {
    // 아이디: 영문 소문자, 숫자 조합 / 5~20자
    username: (value: any) => {
      const regex = /^[a-z0-9]{5,20}$/;
      return regex.test(value) || "아이디는 영문 소문자와 숫자 조합으로 5 ~ 20자여야 합니다."
    },
    // 비밀번호: 영문, 숫자, 특수문자 포함 / 8~20자
    password: (value: any) => {
      const regex = /^(?=.*[a-zA-Z])(?=.*[!@#$%^*+=-])(?=.*[0-9]).{8,20}$/;
      return regex.test(value) || "비밀번호는 영문, 숫자, 특수문자를 포함하여 8~20자여야 합니다."
    }
  }

  // 백엔드 api를 호출해서 사용 가능한 값인지 확인
  const checkDuplicate = async (type: string) => {
    const value = (type === 'username') ? formData.username : formData.alias;
    if (!value) return alert(`${type === 'username' ? '아이디' : '닉네임'}를 입력해주세요.`);

    try {
      const response = await fetch(`http://10.125.121.178:8080/api/check-duplicate?type=${type}&value=${value}`);

      if (response.ok) {
        if (type === 'username') {
          setUsernameChecked(true);
          setUsernameStatus('success');
        }
        if (type === 'alias') {
          setAliasChecked(true);
          setAliasStatus('success');
        }
      } else {
          if (type === 'username') {
            setUsernameStatus('error');
          }
          if (type === 'alias') {
            setAliasStatus('error');
          }
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
        router.push('/login');
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


  // 아이디 입력란, 비밀번호 입력란 바뀔 시 유효성 검사
  useEffect(() => {
    const result = validationRules.username(formData.username);
    
    if (result === true) {
      setUsernameRule('');
    } else {
      setUsernameRule(result);
    }
  }, [formData.username])

  useEffect(() => {
    const result = validationRules.password(formData.password);
    
    if (result === true) {
      setPasswordRule('');
    } else {
      setPasswordRule(result);
    }
  }, [formData.password])

  return (
    <>
    <Header />
    <div className='w-full h-screen bg-gray-50 flex flex-col justify-center items-center'>
      <div className='w-1/2 max-w-md bg-white px-6 py-8 flex flex-col justify-center items-start rounded-xl text-gray-700 border border-gray-200 shadow-md'>
        <h2 className='text-lg font-bold mb-7'>계정 생성하기</h2>
        <form onSubmit={handleJoin} className='w-full flex flex-col space-y-3'>
          <div className='space-y-1'>
            <label className='block mb-1 text-xs font-semibold'>아이디</label>
            <div className='relative flex items-center'>
              <input type='text' name='username' placeholder='아이디를 입력하세요.' onChange={handleChange} required 
                     className={`w-full bg-gray-50 p-2.5 border text-gray-700 rounded-lg outline-none transition-all
                                ${usernameStatus === 'error' ? 'border-red-500 focus:ring-2 focus:ring-red-200' // 에러 상태
                                : usernameStatus === 'success' ? 'border-blue-500 focus:ring-2 focus:ring-blue-100' // 성공 상태
                                : 'border-gray-300 focus:ring-2 focus:ring-[#204571]' // 기본 상태
                              }`} />
              <button type='button' onClick={() => checkDuplicate('username')} 
                      className={`absolute right-2 px-3 py-1.5 w-20 rounded-lg text-sm text-white transition-all 
                                ${usernameChecked ? "bg-blue-600" : "bg-[#475569] hover:bg-[#334155]"}`}>{usernameChecked ? "확인완료" : "중복확인"}
              </button>
            </div>
            {usernameStatus === 'success' && (<p className="text-xs text-blue-600 ml-1">사용할 수 있는 아이디입니다.</p>)}
            {usernameStatus === 'error' && (<p className="text-xs text-red-500 ml-1">이미 사용 중인 아이디입니다.</p>)}
            {usernameRule && (<p className="text-xs text-red-500 ml-1">{usernameRule}</p>)}
          </div>
          <div className='space-y-1'>
            <label className='block mb-1 text-xs font-semibold'>닉네임</label>
            <div className='relative flex items-center'>
              <input type='text' name='alias' placeholder='닉네임을 입력하세요.' onChange={handleChange} required 
                     className={`w-full bg-gray-50 p-2.5 border rounded-lg outline-none transition-all 
                                ${aliasStatus === 'error' ? 'border-red-500 focus:ring-2 focus:ring-red-200' // 에러 상태
                                : aliasStatus === 'success' ? 'border-blue-500 focus:ring-2 focus:ring-blue-100' // 성공 상태
                                : 'border-gray-300 focus:ring-2 focus:ring-[#204571]' // 기본 상태
                              }`}/>
              <button type='button' onClick={() => checkDuplicate('alias')} 
                      className={`absolute right-2 px-3 py-1.5 w-20 rounded-lg text-sm text-white transition-all 
                                ${aliasChecked ? "bg-blue-600" : "bg-[#475569] hover:bg-[#334155]"}`}>{aliasChecked ? "확인완료" : "중복확인"}
              </button>
            </div>
            {aliasStatus === 'success' && (<p className="text-xs text-blue-600 ml-1">사용할 수 있는 닉네임입니다.</p>)}
            {aliasStatus === 'error' && (<p className="text-xs text-red-500 ml-1">이미 사용 중인 닉네임입니다.</p>)}
          </div>
          <div className='space-y-1'>
            <label className='block mb-1 text-xs font-semibold'>비밀번호</label>
            <input type='password' name='password' value={formData.password} placeholder='비밀번호를 입력하세요.' onChange={handleChange} required 
                   className='w-full bg-gray-50 p-2.5 border border-gray-300 text-gray-700 rounded-lg focus:ring-2 focus:ring-[#204571] outline-none transition-all'/>
            {passwordRule && (<p className="text-xs text-red-500 ml-1">{passwordRule}</p>)}
          </div>
          <div className='space-y-1'>
            <label className='block mb-1 text-xs font-semibold'>비밀번호 확인</label>
            <input type='password' name='confirmPassword' value={formData.confirmPassword} placeholder='비밀번호를 재입력하세요.' onChange={handleChange} required
                   className='w-full bg-gray-50 p-2.5 border border-gray-300 text-gray-700 rounded-lg focus:ring-2 focus:ring-[#204571] outline-none transition-all'/>
            {passwordMsg && <p className={`text-xs mt-1 ${formData.password === formData.confirmPassword ? 'text-blue-500' : 'text-red-500'}`}>{passwordMsg}</p>}
          </div>
          <button type='submit' disabled={formData.password !== formData.confirmPassword || formData.confirmPassword === '' || passwordRule !== '' || usernameRule !== ''}
                  className='w-full bg-[#41abdd] hover:bg-[#3fa4d3] text-white text-center px-5 py-2.5 rounded-lg font-medium mt-3 transition-all'>
            <span>가입하기</span>
          </button>
          <div className='flex items-center py-5'>
            <div className="grow border-t border-gray-200"></div>
          </div>
          <p className='text-sm text-gray-500 text-center'>
            <span>이미 계정이 있다면? </span>
            <a href='/login' className='font-medium text-[#3BA9D2] hover:underline'>로그인</a>
          </p>
        </form>
      </div>
    </div>
    </>
  );
}