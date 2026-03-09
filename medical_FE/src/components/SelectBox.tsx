'use client';

interface SelectBoxProps {
  label: string,
  options: string[],
  value: string,
  sidoChange: (value: string) => void;
}

export default function SelectBox({label, options, value, sidoChange}: SelectBoxProps) {
  return (
    <form className="w-full">
      <label htmlFor={label} className="text-sm mb-2.5 font-medium">{label}</label>
      <select value={value} onChange={e => sidoChange(e.target.value)} className='w-full px-3 py-2.5 bg-gray-50 border border-gray-200 text-sm rounded-xl'>
        <option value="">==={label}를 선택하세요.===</option>
        {options.map(opt => <option key={opt}>{opt}</option>)}
      </select>
    </form>
  );
}