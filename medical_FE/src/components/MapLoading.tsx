export default function MapLoading() {
  return (
    <div className="relative w-full h-full min-h-125 bg-gray-200 rounded-2xl flex items-center justify-center animate-pulse">
      <div className="flex flex-col items-center">
        <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mb-4"></div>
        <p className="text-gray-500 font-medium">지도를 불러오는 중입니다...</p>
      </div>
      
      <div className="absolute top-4 left-4 w-32 h-10 bg-gray-300 rounded-full"></div>
    </div>
  );
}