'use client';

import { HospLocation } from "@/types/HospLocation";

interface OverlayCardProps {
  data: HospLocation,
}

export default function OverlayCard({data}: OverlayCardProps) {
  return (
    <div className="bg-white rounded-lg shadow-md border border-gray-200 p-4">
        <div className="flex justify-end cursor-pointer">&times;</div>
        <div className="flex flex-col">
          <div>
            <span className='text-[10px] px-2 py-0.5 rounded-md bg-blue-100 text-blue-800'>{data.typeName}</span>
          </div>
          <h2 className="font-bold text-lg">{data.institutionName}</h2>
            <span className="text-sm text-gray-500">
              <p>📍 {data.address}</p>
              <p>📞 {data.call}</p>
            </span>
        </div>
        <div className="flex justify-end items-center mt-2">
          <button className="bg-blue-600 text-sm text-white px-3 py-1.5 rounded-full flex justify-center items-center cursor-pointer">
            <p>상세보기</p>
            <img src='../arrow_upward.svg' className="rotate-90"/>
          </button>
        </div>
      <div className="bg-white absolute -bottom-1.5 left-1/2 w-3 h-3 rotate-45 -translate-x-1.5 shadow-md border-r border-b border-gray-200"></div>
    </div>
  );
}