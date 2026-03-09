'use client';

interface ScoreCardProps {
  title: string,
  content: number,
  onOpen: () => void,
  color: IconColor,
  imgSrc: IconPath,
}

const iconStyle = {
  blue : "bg-[#0061FF]",
  purple : "bg-[#6C5DD3]",
  orange : "bg-[#FFB547]",
  red: "bg-[#EE5D50]",
};

const iconList = {
  hospital: "../local_hospital.svg",
  night: "../nightlight.svg",
  holiday: "../event_available.svg",
  emergency: "../health_and_safety.svg",
};

type IconColor = keyof typeof iconStyle;
type IconPath = keyof typeof iconList;

export default function ScoreCard({title, content, onOpen, color, imgSrc}: ScoreCardProps) {
  return (
    <div className='bg-white p-3 border border-gray-200 rounded-2xl h-30 flex justify-center items-center shadow-sm
                    hover:shadow-md hover:-translate-y-1 transition-all duration-300 cursor-pointer'
                    onClick={onOpen}>
      <div className="w-full flex justify-between items-center">
        <div className={`${iconStyle[color]} w-14 h-14 rounded-full flex justify-center items-center shrink-0`}>
          <img src={iconList[imgSrc]} className="w-6 h-6" />
        </div>
        <div className="flex flex-col">
          <h2 className="text-gray-600 whitespace-nowrap text-sm">{title}</h2>
          <p className="font-bold flex justify-end text-xl mt-2">{content.toLocaleString()}개</p>
        </div>
      </div>
    </div>
  );
}