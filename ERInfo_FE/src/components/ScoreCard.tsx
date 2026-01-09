'use client';

interface ScoreCardProps {
  title: string,
  content: number,
  onOpen: () => void
}

export default function ScoreCard({title, content, onOpen}: ScoreCardProps) {
  return (
    <div className='bg-white p-6 border border-gray-200 rounded-2xl h-30 flex flex-col justify-between shadow-sm
                    hover:shadow-md hover:-translate-y-1 transition-all duration-300 cursor-pointer'
                    onClick={onOpen}>
      <h2 className="flex justify-start text-gray-600">{title}</h2>
      <p className="font-bold flex justify-end text-xl">{content.toLocaleString()}개</p>
    </div>
  );
}