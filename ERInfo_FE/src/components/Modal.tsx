'use client';

interface ModalProps {
  title: string,
  isOpen: boolean,
  onClose: () => void,
  data: any[],
  isLoading: boolean
}

export default function Modal({title, isOpen, onClose, data, isLoading}: ModalProps) {
  if(!isOpen) return;
  return (
    <div className="fixed inset-0 z-9999">
      <div className="absolute inset-0 bg-black/50 flex justify-center items-center">
        <div className="relative bg-white p-6 rounded-xl w-1/2 h-2/3 shadow-2xl flex flex-col overflow-hidden">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-bold">{title}</h2>
            <button onClick={onClose} className="text-2xl cursor-pointer">&times;</button>
          </div>
          <div className="flex-1 overflow-y-auto p-2">
            {isLoading ? 
              <div className=" h-full flex-1 flex flex-col justify-center items-center gap-4">
                <div className="w-12 h-12 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin"></div>
                <p className="text-gray-500 font-medium">데이터를 불러오는 중입니다...</p>
              </div>
            : data && data.length > 0 ?
            <ul className="space-y-4">
              {data.map((hosp, idx) => (
                <li key={idx} className="p-4 border border-gray-300 rounded-lg shadow-sm hover:bg-gray-200 cursor-pointer transition">
                  <div className="font-bold text-lg">{hosp.hospital?.institutionName || hosp.institutionName}</div>
                  <div className="text-sm text-gray-600 mt-1">📍 {hosp.hospital?.address || hosp.address}</div>
                  <div className="text-sm text-gray-600">📞 {hosp.hospital?.call || hosp.call}</div>
                </li>
              ))}
            </ul> :
            <div className="flex flex-col justify-center items-center">
              <img src="../hospSearch2.png" className="w-100"/>
              <div className="text-center py-10 text-gray-500">
                해당 조건의 병원 정보가 없습니다.
              </div>
            </div>
            }
          </div>
          <div>
          </div>
        </div>
      </div>
    </div>
  );
}