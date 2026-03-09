'use client';

import { useState, useEffect } from 'react';
import Pagination from "@/components/Pagenation";

interface ReviewModalProps {
    username: string;
    onClose: () => void;
    deleteReview: (seq: number) => Promise<void>;
    getHeaders: () => any;
}

export default function ReviewModal({ username, onClose, deleteReview, getHeaders }: ReviewModalProps) {
    const [reviews, setReviews] = useState<any[]>([]);
    const [totalElements, setTotalElements] = useState(0);
    const [currentPage, setCurrentPage] = useState(0);
    const [totalPages, setTotalPages] = useState(0);

    const fetchReviews = async (page: number) => {
        const headers = getHeaders();
        try {
            const resp = await fetch(`http://10.125.121.178:8080/api/review/memberId/${username}?page=${page}&size=5`, { headers });
            if (resp.ok) {
                const data = await resp.json();
                setReviews(data.content || []);
                setTotalElements(data.totalElements)
                setTotalPages(data.totalPages || 0);
                setCurrentPage(page);
            }
        } catch (err) { console.error(err); }
    };

    useEffect(() => {
        fetchReviews(0);
    }, [username]);

    const handleReviewDelete = async (seq: number) => {
        await deleteReview(seq);
        fetchReviews(currentPage); // 현재 페이지 새로고침
    };

    return (
        <div className="fixed inset-0 z-100 flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-gray-900/40 backdrop-blur-sm" onClick={onClose} />
            <div className="relative bg-white w-full max-w-xl rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[80vh]">
                <div className="p-6 border-b flex justify-between items-center bg-gray-50/50">
                    <div>
                        <h3 className="text-lg font-bold text-gray-800">{username} 님의 후기</h3>
                        <p className="text-xs text-gray-500">총 {totalElements}개의 후기가 있습니다.</p>
                    </div>
                    <button onClick={onClose} className="w-8 h-8 flex items-center justify-center bg-white border rounded-full hover:bg-gray-100">✕</button>
                </div>

                <div className="p-6 overflow-y-auto space-y-3 flex-1">
                    {reviews.map((r) => (
                        <div key={r.seq} className="p-4 bg-white border border-gray-100 rounded-2xl flex justify-between items-center">
                            <p className="text-sm text-gray-600 flex-1">{r.content}</p>
                            <button
                                onClick={() => handleReviewDelete(r.seq)}
                                className="p-2 rounded-full hover:bg-red-50 transition-colors"
                            >
                                <img src='/delete.svg' className="w-5 h-5" alt="delete" />
                            </button>
                        </div>
                    ))}
                    {reviews.length === 0 && <div className="text-center py-10 text-gray-400">후기가 없습니다.</div>}
                </div>

                <div className="border-t bg-white">
                    <Pagination currentPage={currentPage} totalPages={totalPages} onPageChange={fetchReviews} />
                </div>
            </div>
        </div>
    );
}