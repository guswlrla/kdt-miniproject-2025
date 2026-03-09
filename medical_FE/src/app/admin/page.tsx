'use client'

import Header from "@/components/Header";
import Pagination from "@/components/Pagenation";
import ReviewModal from "@/components/ReviewModal";
import SideBar from "@/components/SideBar";
import { useRouter } from "next/navigation";
import { useEffect, useState, useCallback } from "react";

export default function AdminPage() {
    const [viewType, setViewType] = useState<'member' | 'review'>('member');
    const [members, setMembers] = useState<any[]>([]);
    const [allReviews, setAllReviews] = useState<any[]>([]);
    const [selectedMember, setSelectedMember] = useState<string | null>(null);
    const [collapsed, setCollapsed] = useState<boolean>(false);

    const [currentPage, setCurrentPage] = useState(0);
    const [totalPages, setTotalPages] = useState(0);

    const router = useRouter();

    const getHeaders = useCallback(() => {
        const token = sessionStorage.getItem('jwtToken');
        if (!token) return null;
        return {
            'Authorization': token.startsWith('Bearer ') ? token : `Bearer ${token}`,
            'Content-Type': 'application/json'
        };
    }, []);

    const handleError = useCallback((status: number) => {
        if (status === 401 || status === 403) {
            alert("세션이 만료되었습니다. 다시 로그인해주세요.");
            router.push("/");
        } else {
            alert("데이터를 처리하는 중 오류가 발생했습니다.");
        }
    }, [router]);

    const fetchMembers = async (page: number = 0) => {
        const headers = getHeaders();
        if (!headers) return;
        try {
            const resp = await fetch(`http://10.125.121.178:8080/api/admin/getMembers?page=${page}&size=8`, { headers });
            if (resp.ok) {
                const data = await resp.json();
                setMembers(data.content || []);
                setTotalPages(data.totalPages || 0);
                setCurrentPage(page);
            } else handleError(resp.status);
        } catch (err) { console.error(err); }
    };

    const fetchAllReviews = async (page: number = 0) => {
        const headers = getHeaders();
        if (!headers) return;
        try {
            const resp = await fetch(`http://10.125.121.178:8080/api/review?page=${page}&size=8`, { headers });
            if (resp.ok) {
                const data = await resp.json();
                setAllReviews(data.content || []);
                setTotalPages(data.totalPages || 0);
                setCurrentPage(page);
            } else handleError(resp.status);
        } catch (err) { console.error(err); }
    };

    const handlePageClick = (page: number) => {
        if (page < 0 || page >= totalPages) return;
        if (viewType === 'member') fetchMembers(page);
        else fetchAllReviews(page);
    };

    const deleteMember = async (username: string) => {
        if (!confirm(`${username} 회원을 삭제하시겠습니까?`)) return;
        const headers = getHeaders();
        const resp = await fetch(`http://10.125.121.178:8080/api/admin/getMember/${username}`, { method: 'DELETE', headers: headers! });
        if (resp.ok) { alert("삭제되었습니다."); fetchMembers(0); }
    };

    const deleteReview = async (seq: number) => {
        if (!confirm("이 후기를 삭제하시겠습니까?")) return;
        const headers = getHeaders();
        const resp = await fetch(`http://10.125.121.178:8080/api/review/${seq}`, { method: 'DELETE', headers: headers! });
        if (resp.ok) {
            alert("삭제되었습니다.");
            if (viewType === 'review') fetchAllReviews(0);
        }
    };

    useEffect(() => {
        const role = sessionStorage.getItem('role');
        if (role !== 'ROLE_ADMIN') {
            alert("관리자 권한이 없습니다.");
            router.back();
            return;
        }
        fetchMembers(0);
    }, []);

    return (
        <>
        <Header />
        <div className="flex min-h-screen bg-gray-50 mt-14">
            <SideBar collapsed={collapsed} setCollapsed={setCollapsed} />

            <div className={`flex-1 flex flex-col transition-all duration-300 ${collapsed ? 'md:pl-20' : 'md:pl-64'}`}>
                <main className="p-6 lg:p-10 space-y-6">
                    <header className="flex flex-col gap-2">
                        <h1 className="text-2xl font-bold text-gray-800">🛠 관리자 페이지</h1>
                        <p className="text-gray-500 text-sm">회원 목록 및 후기 통합 관리</p>
                    </header>

                    <div className="flex gap-1 p-1 bg-gray-200/50 rounded-xl w-fit">
                        <button
                            onClick={() => { setViewType('member'); fetchMembers(0); }}
                            className={`px-6 py-2.5 rounded-lg font-semibold transition-all ${viewType === 'member' ? 'bg-white text-blue-600 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
                        >
                            회원 관리
                        </button>
                        <button
                            onClick={() => { setViewType('review'); fetchAllReviews(0); }}
                            className={`px-6 py-2.5 rounded-lg font-semibold transition-all ${viewType === 'review' ? 'bg-white text-blue-600 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
                        >
                            후기 관리
                        </button>
                    </div>

                    <section className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead className="bg-gray-50/50 border-b border-gray-100">
                                    {viewType === 'member' ? (
                                        <tr>
                                            <th className="p-4 w-1/4 text-left font-bold text-gray-400">
                                                <div style={{ paddingLeft: '40px' }}>작성자</div>
                                            </th>
                                            <th className="p-4 text-center font-bold text-gray-400">권한</th>
                                            <th className="p-4 text-center font-bold text-gray-400">후기 목록</th>
                                            <th className="p-4 text-center font-bold text-gray-400">관리</th>
                                        </tr>
                                    ) : (
                                        <tr>
                                            <th className="p-4 w-1/4 text-left font-bold text-gray-400">
                                                <div style={{ paddingLeft: '40px' }}>작성자</div>
                                            </th>
                                            <th className="p-4 text-left font-bold text-gray-400">후기 내용</th>
                                            <th className="p-4 text-center font-bold text-gray-400">관리</th>
                                        </tr>
                                    )}
                                </thead>
                                <tbody className="divide-y divide-gray-50">
                                    {viewType === 'member' ? (
                                        members.map((m) => (
                                            <tr key={m.username} className="hover:bg-blue-50/30 transition-colors group">
                                                <td className="p-4 text-left">
                                                    <div className="font-medium text-gray-700" style={{ paddingLeft: '40px' }}>{m.alias}</div>
                                                    <div className="text-xs text-gray-400" style={{ paddingLeft: '40px' }}>{m.username}</div>
                                                </td>
                                                <td className="p-4 text-center">
                                                    <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${m.role === 'ROLE_ADMIN' ? 'bg-purple-100 text-purple-600' : 'bg-blue-100 text-blue-600'}`}>
                                                        {m.role}
                                                    </span>
                                                </td>
                                                <td className="p-4 text-center">
                                                    <button
                                                        onClick={() => setSelectedMember(m.username)}
                                                        className="p-2 rounded-full hover:bg-gray-100 transition-colors"
                                                    >
                                                        <img src='/list.svg' className="w-5 h-5" alt="list" />
                                                    </button>
                                                </td>
                                                <td className="p-4 text-center">
                                                    <button
                                                        onClick={() => deleteMember(m.username)}
                                                        className="p-2 rounded-full hover:bg-red-50 transition-colors"
                                                    >
                                                        <img src='/delete.svg' className="w-5 h-5" alt="delete" />
                                                    </button>
                                                </td>
                                            </tr>
                                        ))
                                    ) : (
                                        allReviews.map((r) => (
                                            <tr key={r.seq} className="hover:bg-blue-50/30 transition-colors">
                                                <td className="p-4 text-left">
                                                    <div className="font-medium text-gray-700" style={{ paddingLeft: '40px' }}>{r.alias}</div>
                                                    <div className="text-xs text-gray-400" style={{ paddingLeft: '40px' }}>{r.username}</div>
                                                </td>
                                                <td className="p-4 text-left text-sm text-gray-600 max-w-md truncate">{r.content}</td>
                                                <td className="p-4 text-center">
                                                    <button
                                                        onClick={() => deleteReview(r.seq)}
                                                        className="p-2 rounded-full hover:bg-red-50 transition-colors"
                                                    >
                                                        <img src='/delete.svg' className="w-5 h-5" alt="delete" />
                                                    </button>
                                                </td>
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            </table>
                            {(viewType === 'member' ? members.length : allReviews.length) === 0 && (
                                <div className="py-20 text-center text-gray-400 italic">표시할 데이터가 없습니다.</div>
                            )}
                            {!selectedMember && (
                                <Pagination
                                    currentPage={currentPage}
                                    totalPages={totalPages}
                                    onPageChange={handlePageClick}
                                />
                            )}
                        </div>
                    </section>
                </main>

                {selectedMember && (
                    <ReviewModal
                        username={selectedMember}
                        onClose={() => setSelectedMember(null)}
                        deleteReview={deleteReview}
                        getHeaders={getHeaders}
                    />
                )}
            </div>
        </div>
        </>
    );
}