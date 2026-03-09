'use client'
import React, { useEffect } from "react";
import { useRouter } from "next/navigation";
export default function OAuth2Callback() {

    const router = useRouter();

    useEffect(() => {
        const fetchCallback = async () => {
            try {
                const response = await fetch("http://10.125.121.178:8080/api/jwtcallback", {
                    method: "POST",
                    credentials: "include", // 쿠키포함
                });
                if (response.ok) {
                    const params = new URLSearchParams(window.location.search);
                    const username = params.get("username")

                    const jwtToken = response.headers.get('Authorization');

                    const resp = await fetch(`http://10.125.121.178:8080/api/getMember/${username}`)
                    const data = await resp.json()
                    const alias = data.alias

                    if (jwtToken) {
                        sessionStorage.setItem("jwtToken", jwtToken);
                        sessionStorage.setItem('username', username!);
                        sessionStorage.setItem("role", "ROLE_MEMBER");
                        sessionStorage.setItem('alias', alias!);
                    }
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
                } else {
                    alert("JWT 검증 실패");
                    router.push("/");
                }
            } catch (err) {
                alert("서버 요청 오류");
                router.push("/");
            }
        };
        fetchCallback();
    }, []);
    return <></>;
};
