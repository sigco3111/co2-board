
import React from 'react';
import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip, Legend } from 'recharts';
import { PowerGridMixItem } from '../types';
import { LoaderIcon } from './icons/LoaderIcon';

interface PowerGridMixChartProps {
    data: PowerGridMixItem[] | null;
    isLoading: boolean;
    country: string;
}

// Consistent colors for different energy sources
const SOURCE_COLORS: { [key: string]: string } = {
  '석탄': '#8c8c8c',        // Gray
  '천연가스': '#ffa726',  // Orange
  '원자력': '#42a5f5',    // Blue
  '태양광': '#ffca28',    // Yellow
  '풍력': '#66bb6a',        // Green
  '수력': '#29b6f6',        // Light Blue
  '석유': '#bcaaa4',        // Brown-Gray
  '바이오매스': '#9ccc65',   // Light Green
  '바이오에너지': '#9ccc65',   // Light Green
  '기타': '#bdbdbd',         // Light Gray
};

const DYNAMIC_COLORS = ['#8dd3c7', '#ffffb3', '#bebada', '#fb8072', '#80b1d3', '#fdb462', '#b3de69', '#fccde5', '#d9d9d9'];

const CustomTooltip = ({ active, payload }: any) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    return (
      <div className="bg-navy-950/80 backdrop-blur-sm p-3 rounded-lg border border-navy-700 text-sm">
        <p className="font-bold text-white">{`${data.name}`}</p>
        <p className="text-navy-200">{`비중: ${data.value.toFixed(1)}%`}</p>
      </div>
    );
  }
  return null;
};

const renderLegend = (props: any) => {
    const { payload } = props;
    return (
        <ul className="flex flex-wrap justify-center gap-x-4 gap-y-1 mt-3">
            {payload.map((entry: any, index: number) => (
                <li key={`item-${index}`} className="flex items-center text-xs text-navy-200">
                    <span className="w-2.5 h-2.5 rounded-full mr-1.5" style={{ backgroundColor: entry.color }} />
                    {entry.value} ({Number(entry.payload.value).toFixed(1)}%)
                </li>
            ))}
        </ul>
    );
};


export const PowerGridMixChart: React.FC<PowerGridMixChartProps> = ({ data, isLoading, country }) => {
    if (isLoading) {
        return (
            <div className="flex flex-col items-center justify-center h-72">
                <LoaderIcon className="w-8 h-8 animate-spin text-navy-400" />
                <p className="mt-2 text-navy-300">전력망 구성 데이터 로딩 중...</p>
            </div>
        );
    }

    if (!data || data.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center h-72 bg-navy-900/30 rounded-lg">
                <p className="text-navy-300">위치 기반 전력망 구성 데이터를 가져올 수 없습니다.</p>
                <p className="text-xs text-navy-400 mt-1">AI 모델이 해당 지역의 데이터를 제공하지 못했습니다.</p>
            </div>
        );
    }

    return (
        <div>
            <h3 className="text-xl font-semibold text-white mb-3 text-center">
                위치 기반 전력망 구성 ({country})
            </h3>
            <div className="w-full h-72">
                <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                        <Pie
                            data={data}
                            cx="50%"
                            cy="50%"
                            labelLine={false}
                            outerRadius="80%"
                            fill="#8884d8"
                            dataKey="value"
                            nameKey="name"
                            paddingAngle={1}
                            minAngle={1}
                        >
                            {data.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={SOURCE_COLORS[entry.name] || DYNAMIC_COLORS[index % DYNAMIC_COLORS.length]} />
                            ))}
                        </Pie>
                        <Tooltip content={<CustomTooltip />} />
                        <Legend content={renderLegend} wrapperStyle={{fontSize: '12px'}} />
                    </PieChart>
                </ResponsiveContainer>
            </div>
        </div>
    );
};
