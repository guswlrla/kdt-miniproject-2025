'use client';

interface SelectBoxProps {
  label: string
}

export default function SelectBox({label}: SelectBoxProps) {
  return (
    <form className="w-full">
      <label htmlFor={label} className="text-sm mb-2.5 font-medium">{label}</label>
      <select id="" className='w-full px-3 py-2.5 bg-gray-50 border border-gray-200 text-sm rounded-xl'>
      </select>
    </form>
  );
}