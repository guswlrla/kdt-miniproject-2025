'use client';

interface ScoreCardProps {
  title: string,
  content: number
}

export default function ScoreCard({title, content}: ScoreCardProps) {
  return (
    <div className='bg-white p-6 border border-gray-200 rounded-2xl h-30 flex flex-col justify-between shadow-sm'>
      <h2 className="flex justify-start">{title}</h2>
      <p className="font-bold flex justify-end text-xl">{content.toLocaleString()}개</p>
    </div>
  );
}