import React from 'react';
import { MethodType } from '../types';
import { SparklesIcon } from './icons/SparklesIcon';
import { LoaderIcon } from './icons/LoaderIcon';

interface MethodCardProps {
  methodType: MethodType;
  icon: React.ReactNode;
  emissionFactor: number;
  totalEmissions: number;
  explanation: string;
  isLoading: boolean;
  onExplain: () => void;
  disabled: boolean;
}

export const MethodCard: React.FC<MethodCardProps> = ({
  methodType,
  icon,
  emissionFactor,
  totalEmissions,
  explanation,
  isLoading,
  onExplain,
  disabled,
}) => {
  return (
    <div className="bg-navy-900/50 p-6 rounded-2xl shadow-lg flex flex-col border border-navy-800 transition-all hover:border-navy-700 hover:shadow-2xl">
      <div className="flex items-start justify-between mb-3">
        <h3 className="text-2xl font-bold text-white">{methodType}</h3>
        <span className="p-2 bg-navy-800/50 rounded-full">{icon}</span>
      </div>
      
      <div className="flex-grow space-y-4">
        <div>
          <p className="text-sm text-navy-300">배출 계수</p>
          <p className="text-lg font-semibold text-white">{emissionFactor} gCO₂e/kWh</p>
        </div>
        <div>
          <p className="text-sm text-navy-300">총 배출량</p>
          <p className="text-3xl font-bold text-cyan-400">{totalEmissions.toLocaleString('ko-KR', { maximumFractionDigits: 2 })} tCO₂e</p>
        </div>

        {explanation && (
          <div className="pt-2">
            <p className="text-sm text-navy-300 font-semibold mb-1">AI 생성 설명:</p>
            <p className="text-navy-200 text-base">{explanation}</p>
          </div>
        )}
      </div>

      <div className="mt-6">
        <button
          onClick={onExplain}
          disabled={isLoading || disabled}
          title={disabled ? "API 키를 먼저 설정해야 합니다." : "이 방식 설명하기"}
          className="w-full flex items-center justify-center px-4 py-2.5 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-navy-700 hover:bg-navy-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-navy-500 focus:ring-offset-navy-950 disabled:bg-navy-800 disabled:text-gray-400 disabled:cursor-not-allowed transition-colors"
        >
          {isLoading ? (
            <>
              <LoaderIcon className="animate-spin -ml-1 mr-3 h-5 w-5" />
              생성 중...
            </>
          ) : (
            <>
              <SparklesIcon className=" -ml-1 mr-2 h-5 w-5" />
              이 방식 설명하기
            </>
          )}
        </button>
      </div>
    </div>
  );
};