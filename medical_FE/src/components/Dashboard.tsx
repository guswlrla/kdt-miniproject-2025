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
    chart: {
      type: type,
      width: '100%',
      height: '100%',
      toolbar: { show: false },
    },
    plotOptions: {
      bar: {
        horizontal: true,
        borderRadius: 8,
        borderRadiusApplication: 'end',
        barHeight: '60%',
        distributed: true,
        dataLabels: {
          position: 'center',
        },
      },
      pie: {
        donut: {
          size: '75%',
        }
      }
    },
    dataLabels: {
      enabled: true,
      style: { fontSize:'12px', fontFamily: 'nanumGothicCoding' },
      dropShadow: {
        enabled: false, // 깔끔한 디자인을 위해 그림자 제거
      },
    },
    xaxis: {
      categories: labels,
      labels: { show: false },
      axisBorder: { show: true },
      axisTicks: { show: true },
    },
    yaxis: {
      labels: {
        maxWidth: 70,
        style: { fontSize: '12px', fontWeight: 500 }
      },
    },
    grid: {
      show: true,
      strokeDashArray: 4,
      borderColor: '#f1f1f1',
      xaxis: { 
        lines: { show: true } 
      },
    },
    legend: { 
      show: type=== 'bar' ? false : true,
      fontSize: '15px',
    },
    labels: labels,
    colors: ['#1E40AF', '#3B82F6', '#60A5FA', '#93C5FD', '#BAE6FD'],
    tooltip: {
      y: {
        formatter: (val) => `${val.toLocaleString()}건`
      }
    },
  }

  return (
    <div className="bg-white p-5 border border-gray-200 rounded-2xl shadow-sm h-full">
      <ReactApexChart options={options} series={formattedSeries} type={type} height={340} />
      {title && <h3 className="text-sm text-center font-medium">{title}</h3>}
    </div>
  );
}