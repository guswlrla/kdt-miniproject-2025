'use client';

import { useEffect, useState, useCallback } from 'react';
import Link from 'next/link';

export default function ReviewSection({ hospitalId }: { hospitalId: number }) {
  const [reviews, setReviews] = useState<any>(null);
  const [isLoggedIn, setIsLoggedIn] = useState<boolean | null>(null);
  const [newReview, setNewReview] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [currentUser, setCurrentUser] = useState<string | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);

  const [editingId, setEditingId] = useState<number | null>(null);
  const [editContent, setEditContent] = useState('');

  const fetchReviews = useCallback(async (token: string) => {
    try {
      const res = await fetch(`http://10.125.121.178:8080/api/review/hospitalId/${hospitalId}`, {
        headers: { 'Authorization': token.startsWith('Bearer ') ? token : `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setReviews(data);
      }
    } catch (err) { console.error("리뷰 로딩 에러:", err); }
  }, [hospitalId]);

  useEffect(() => {
    const token = sessionStorage.getItem('jwtToken');
    if (!token) {
      setIsLoggedIn(false);
    } else {
      setCurrentUser(sessionStorage.getItem('username'));
      setIsAdmin(sessionStorage.getItem('role') === 'ROLE_ADMIN');
      setIsLoggedIn(true);
      fetchReviews(token);
    }
  }, [hospitalId, fetchReviews]);

  // 등록 함수
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const token = sessionStorage.getItem('jwtToken');
    if (!newReview.trim() || !token) return;
    setIsSubmitting(true);
    try {
      const res = await fetch(`http://10.125.121.178:8080/api/review`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': token.startsWith('Bearer ') ? token : `Bearer ${token}`
        },
        body: JSON.stringify({ hospitalId, content: newReview }),
      });
      if (res.ok) {
        setNewReview('');
        fetchReviews(token);
      }
    } finally { setIsSubmitting(false); }
  };

  const handleUpdate = async (seq: number) => {
    if (!editContent.trim()) return;
    const token = sessionStorage.getItem('jwtToken');
    const res = await fetch(`http://10.125.121.178:8080/api/review/${seq}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': token!.startsWith('Bearer ') ? token! : `Bearer ${token}`
      },
      body: JSON.stringify({ content: editContent })
    });
    if (res.ok) {
      alert("수정되었습니다.");
      setEditingId(null);
      fetchReviews(token!);
    }
  };

  const handleDelete = async (seq: number) => {
    if (!confirm("삭제하시겠습니까?")) return;
    const token = sessionStorage.getItem('jwtToken');
    const res = await fetch(`http://10.125.121.178:8080/api/review/${seq}`, {
      method: 'DELETE',
      headers: { 'Authorization': token!.startsWith('Bearer ') ? token! : `Bearer ${token}` }
    });
    if (res.ok) { alert("삭제됨"); fetchReviews(token!); }
  };

  if (isLoggedIn === null) return <p className="p-4 text-gray-400 text-sm">데이터를 불러오는 중...</p>;

  if (isLoggedIn === false) {
    return (
      <div className="w-full p-6 bg-gray-50 border border-dashed border-gray-300 rounded-lg text-center">
        <p className="text-gray-600 mb-2">리뷰를 확인하거나 작성하시려면 로그인하세요.</p>
        <Link 
          href="/login" 
          onClick={() => sessionStorage.setItem("redirectUrl", window.location.href)}
          className="text-blue-500 font-bold hover:underline"
        >
          로그인하러 가기 →
        </Link>
      </div>
    );
  }

  return (
    <div className="w-full flex flex-col gap-6">
      <div className="bg-gray-50 p-4 rounded-xl border border-gray-200">
        <p className="text-sm font-bold text-gray-700 mb-2">후기 작성하기</p>
        <form onSubmit={handleSubmit} className="flex flex-col gap-2">
          <textarea
            className="w-full p-3 text-sm border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none resize-none bg-white"
            rows={3}
            placeholder="병원 이용 경험을 나누어 주세요."
            value={newReview}
            onChange={(e) => setNewReview(e.target.value)}
            required
          />
          <div className="flex justify-end">
            <button
              type="submit"
              disabled={isSubmitting || !newReview.trim()}
              className="px-4 py-2 bg-blue-600 text-white text-sm font-bold rounded-lg hover:bg-blue-700 disabled:bg-gray-300"
            >
              {isSubmitting ? '등록 중...' : '등록하기'}
            </button>
          </div>
        </form>
      </div>

      {/* 목록 */}
      <div className="flex flex-col gap-3">
        {reviews?.content?.map((r: any) => (
          <div key={r.seq} className="p-4 bg-white border rounded-xl shadow-sm">
            <div className="flex justify-between mb-2">
              <span className="font-bold text-sm text-blue-600">{r.alias}({r.username})</span>
              <div className="flex gap-2 items-center">
                <span className="text-xs text-gray-400">{r.createDate?.split('T')[0]}</span>
                {(currentUser === r.username || isAdmin) && (
                  <div className="flex gap-2">
                    {editingId === r.seq ? (
                      <button onClick={() => setEditingId(null)} className="text-xs text-gray-500">취소</button>
                    ) : (
                      <button 
                        onClick={() => { setEditingId(r.seq); setEditContent(r.content); }}
                        className="text-xs text-blue-500 hover:underline"
                      >
                        수정
                      </button>
                    )}
                    <button onClick={() => handleDelete(r.seq)} className="text-xs text-red-500 hover:underline">삭제</button>
                  </div>
                )}
              </div>
            </div>

            {editingId === r.seq ? (
              <div className="flex flex-col gap-2">
                <textarea 
                  className="w-full p-2 border rounded text-sm outline-none focus:ring-1 focus:ring-blue-400"
                  value={editContent}
                  onChange={(e) => setEditContent(e.target.value)}
                  autoFocus
                />
                <button 
                  onClick={() => handleUpdate(r.seq)}
                  className="self-end px-3 py-1 bg-blue-500 text-white text-xs rounded hover:bg-blue-600"
                >
                  수정 완료
                </button>
              </div>
            ) : (
              <p className="text-gray-700 text-sm">{r.content}</p>
            )}
          </div>
        ))}
        {reviews?.content?.length === 0 && (
          <p className="text-center text-gray-400 py-10">등록된 리뷰가 없습니다.</p>
        )}
      </div>
    </div>
  );
}