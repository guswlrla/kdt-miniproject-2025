'use client';
import { ApexOptions } from "apexcharts";
import ReactApexChart from "react-apexcharts";

interface DashboardProps {
  title?: string,
  series: number[] | { name: string; data: number[] }[],
  labels?: string[],
  type: 'donut' | 'pie' | 'bar' | 'line';
}

export default function Dashboard({title, series, labels, type}: DashboardProps) {
  const formattedSeries = (type === 'donut' || type === 'pie') ? series as number[] : series as [{name: string, data: number[]}];
  const options: ApexOptions = {
    labels: labels,
    xaxis: {categories: labels}
  }
  return (
    <div className="bg-white p-5 border border-gray-200 rounded-2xl shadow-sm h-full">
       <ReactApexChart options={options} series={formattedSeries} type={type} height={350} />
       <h3 className="text-sm text-center font-medium">{title}</h3>
    </div>
  );
}