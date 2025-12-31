'use client';

interface ScoreCardProps {
  title: string,
  content: string
}

export default function ScoreCard({title, content}: ScoreCardProps) {
  return (
    <div className='bg-white p-5 border border-gray-200 rounded-2xl h-30 flex flex-col'>
      <h2 className="">{title}</h2>
      <p className="font-bold">{content}개</p>
    </div>
  );
}