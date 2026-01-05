'use client';
import { ApexOptions } from "apexcharts";
import ReactApexChart from "react-apexcharts";

interface DoubleBarChartProp {
  height: 300 | 350 | 400;
  colors: string[];
  annotations?: any;
  categories?: any;
  valueFormat?: 'default' | 'toFixed';
  series: { name: string; data: number[] }[];
}

export default function Dashboard() {
  const series = [
    {
      name: "Series 1",
      data: [10, 20, 30, 40],
    }
  ];

  const options: ApexOptions = {
    chart: {
      type: 'bar',
    },
    xaxis: {
      categories: ['A', 'B', 'C', 'D'],
    },
  };
  return (
    <div className="bg-white p-5 border border-gray-200 rounded-2xl shadow-sm h-full">
       <ReactApexChart options={options} series={series} type="bar" height={350} />
    </div>
  );
}