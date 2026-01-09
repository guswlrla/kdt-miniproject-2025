'use client';

interface ModalProps {
  title: string,
  isOpen: boolean,
  onClose: () => void,
  selectedSido: string,
  selectedSgg: string,
  data: any[],
}

export default function Modal({title, isOpen, onClose, selectedSido, selectedSgg, data}: ModalProps) {
  if(!isOpen) return;
  return (
    <div className="fixed inset-0 z-9999">
      <div className="absolute inset-0 bg-black/50 flex justify-center items-center">
        <div className="relative bg-white p-6 rounded-xl w-1/2 h-2/3 shadow-2xl">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-bold">{title}</h2>
            <button onClick={onClose} className="text-2xl">&times;</button>
          </div>
          <div className="overflow-y-auto">
            {data && data.length > 0 ? (
            <ul className="space-y-4">
              {data.map((hosp, index) => (
                <li key={index} className="p-4 border rounded-lg hover:bg-gray-50 transition">
                  <div className="font-bold text-lg text-blue-600">{hosp.hospital.institutionName}</div>
                  <div className="text-sm text-gray-600 mt-1">📍 {hosp.hospital.address}</div>
                  <div className="text-sm text-gray-600">📞 {hosp.hospital.call}</div>
                </li>
              ))}
            </ul>
          ) : (
            <div className="text-center py-10 text-gray-500">
              해당 조건의 병원 정보가 없습니다.
            </div>
          )}
          </div>
        </div>
      </div>
    </div>
  );
}