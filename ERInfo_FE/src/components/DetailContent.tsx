'use client';

import { useEffect, useState } from 'react';
import ReviewSection from '@/components/ReviewSection';

interface DetailContentProps {
  hospitalId: number,
}

export default function DetailContent({ hospitalId }: DetailContentProps) {
    const [data, setData] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function fetchData() {
            setLoading(true);
            try {
                const resp = await fetch(`http://10.125.121.178:8080/api/medicalInfo/${hospitalId}`);
                let operation = await resp.json().catch(() => null);
                let hospital;

                if (!operation) {
                    const fallback = await fetch(`http://10.125.121.178:8080/api/medicalId?hospitalId=${hospitalId}`);
                    hospital = await fallback.json();
                } else {
                    hospital = operation.hospital;
                }
                setData({ hospital, operation });
            } catch (e) {
                console.error(e);
            } finally {
                setLoading(false);
            }
        }
        fetchData();
    }, [hospitalId]);

    if (loading) return <div className="p-10 text-center">상세 정보를 불러오는 중...</div>;
    if (!data?.hospital) return null;

    const { hospital, operation } = data;
    const businessHours = operation ? [
        { day: '월요일', time: operation.startMonday && `${operation.startMonday} ~ ${operation.endMonday}` },
        { day: '화요일', time: operation.startTuesday && `${operation.startTuesday} ~ ${operation.endTuesday}` },
        { day: '수요일', time: operation.startWednesday && `${operation.startWednesday} ~ ${operation.endWednesday}` },
        { day: '목요일', time: operation.startThursday && `${operation.startThursday} ~ ${operation.endThursday}` },
        { day: '금요일', time: operation.startFriday && `${operation.startFriday} ~ ${operation.endFriday}` },
        { day: '토요일', time: operation.startSaturday && `${operation.startSaturday} ~ ${operation.endSaturday}` },
        { day: '일요일', time: operation.startSunday && `${operation.startSunday} ~ ${operation.endSunday}` },
    ] : [];

    return (
        <div className="w-full max-w-4xl mx-auto h-full overflow-y-auto p-3 flex flex-col gap-8 bg-white">
            <header className="border-b-4 border-blue-500 pb-4">
                <h1 className="text-3xl font-black text-gray-800 tracking-tight">
                    {hospital?.institutionName}
                </h1>
            </header>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <section className="flex flex-col gap-6">
                    <div>
                        <h3 className="text-sm font-bold text-blue-600 uppercase mb-1">주소</h3>
                        <p className="text-gray-700">{hospital?.address || "정보 없음"}</p>
                    </div>
                    <div>
                        <h3 className="text-sm font-bold text-blue-600 uppercase mb-1">연락처</h3>
                        <p className="text-gray-700">{hospital?.call || "정보 없음"}</p>
                    </div>
                    <div>
                        <h3 className="text-sm font-bold text-blue-600 uppercase mb-1">홈페이지</h3>
                        {hospital?.homepage ? (
                            <a
                                href={hospital.homepage}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-gray-700 hover:text-blue-600 hover:underline transition-colors"
                            >
                                {hospital.homepage}
                            </a>
                        ) : (
                            <p className="text-gray-700">정보 없음</p>
                        )}
                    </div>
                    {operation && (
                        <div>
                            <h3 className="text-sm font-bold text-blue-600 uppercase mb-1">오시는 길</h3>
                            <p className="text-gray-700">
                                {!operation.locationPlace && !operation.locationDirection ?
                                    "정보 없음" : `${operation.locationPlace || ''} ${operation.locationDirection || ''} ${operation.locationDistance || ''}`}
                            </p>
                        </div>
                    )}
                </section>

                {/* 오른쪽 컬럼: 운영 시간 */}
                <section className="bg-gray-50 p-6 rounded-2xl shadow-sm border border-gray-100">
                    <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
                        🕒 운영 시간
                    </h3>
                    <div className="flex flex-col gap-2">
                        {operation ? businessHours.map((item) => (
                            <div key={item.day} className="flex justify-between text-sm border-b border-gray-200 pb-1 last:border-0">
                                <span className={`font-semibold ${item.day === '일요일' ? 'text-red-500' : 'text-gray-600'}`}>{item.day}</span>
                                <span className="text-gray-800">{item.time || "휴무 또는 정보 없음"}</span>
                            </div>
                        )) : <p className="text-gray-400">운영시간 정보가 없습니다.</p>}
                    </div>
                </section>
            </div>

            {/* 하단 상세 정보 (그리드 3열) */}
            {operation && (
                <section className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-4">
                    <div className="bg-blue-50 p-4 rounded-xl">
                        <p className="text-xs text-blue-500 font-bold mb-1">평일 점심</p>
                        <p className="text-sm font-semibold">{operation.lunchWeekday || "정보 없음"}</p>
                    </div>
                    <div className="bg-blue-50 p-4 rounded-xl">
                        <p className="text-xs text-blue-500 font-bold mb-1">토요일 점심</p>
                        <p className="text-sm font-semibold">{operation.lunchSaturday || "정보 없음"}</p>
                    </div>
                    <div className="bg-blue-50 p-4 rounded-xl">
                        <p className="text-xs text-blue-500 font-bold mb-1">주차 정보</p>
                        <p className="text-sm font-semibold">{operation.parkingFeeYn ? "유료 주차" : "무료/정보없음"}</p>
                    </div>
                    <div className="bg-blue-50 p-4 rounded-xl">
                        <p className="text-xs text-blue-500 font-bold mb-1">공휴일 진료</p>
                        <p className="text-sm font-semibold">{operation.closedHoliday ? "진료 함" : "진료 안 함"}</p>
                    </div>
                </section>
            )}

            {/* 리뷰 섹션 */}
            <section className="mt-5 pt-10 border-t border-gray-200">
                <ReviewSection hospitalId={hospitalId} />
            </section>
        </div>
    );
}