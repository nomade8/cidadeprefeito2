
import React from 'react';
import { TranslationKeys } from '../../types'; // Import TranslationKeys from types.ts

interface BarChartData {
  label: string; 
  value: number;
  color?: string; 
}

interface BarChartProps {
  title: string; 
  data: BarChartData[];
  barHeight?: string; 
  showValueLabel?: boolean;
  translate: (key: TranslationKeys | string, options?: Record<string, string | number>) => string; 
}

const BarChart: React.FC<BarChartProps> = ({ 
  title, 
  data, 
  barHeight = 'h-5', 
  showValueLabel = true,
  translate: t, 
}) => {
  if (!data || data.length === 0) {
    return (
      <div className="my-4 p-3 bg-slate-700/50 rounded-lg">
        <h4 className="text-md font-semibold text-sky-200 mb-2">{title}</h4>
        {/* Ensure 'DASHBOARD_CHART_NO_DATA' is a valid TranslationKey or handle it if t expects only TranslationKeys */}
        <p className="text-slate-400 text-sm">{t('DASHBOARD_CHART_NO_DATA' as TranslationKeys)}</p>
      </div>
    );
  }

  const maxValue = Math.max(...data.map(item => Math.abs(item.value)), 1); 
  const defaultColors = ['bg-sky-500', 'bg-teal-500', 'bg-indigo-500', 'bg-pink-500', 'bg-amber-500', 'bg-lime-500'];

  return (
    <div className="my-3 p-3 bg-slate-700/70 rounded-lg shadow">
      <h4 className="text-md font-semibold text-sky-200 mb-3">{title}</h4>
      <div className="space-y-2.5">
        {data.map((item, index) => {
          const barWidthPercentage = (Math.abs(item.value) / maxValue) * 100;
          const barColor = item.color || defaultColors[index % defaultColors.length];
          
          const isDarkBar = barColor.includes('700') || barColor.includes('800') || barColor.includes('900') || barColor.includes('slate') || barColor.includes('indigo');
          const valueTextColor = isDarkBar ? 'text-white/90' : 'text-slate-800/90';

          return (
            <div key={item.label} className="flex items-center">
              <span className="text-xs text-slate-300 w-1/4 truncate pr-2" title={item.label}>{item.label}</span>
              <div className="flex-1 bg-slate-600 rounded-sm overflow-hidden">
                <div
                  className={`${barHeight} ${barColor} transition-all duration-500 ease-out flex items-center justify-end px-1.5`}
                  style={{ width: `${barWidthPercentage}%` }}
                  role="progressbar"
                  aria-valuenow={item.value}
                  aria-valuemin={0} 
                  aria-valuemax={maxValue}
                  aria-label={`${item.label}: ${item.value}`}
                >
                  {showValueLabel && barWidthPercentage > 10 && ( 
                    <span className={`text-xs font-medium ${valueTextColor}`}>
                      {item.value.toLocaleString()}
                    </span>
                  )}
                </div>
              </div>
              {showValueLabel && barWidthPercentage <= 10 && ( 
                 <span className="text-xs text-slate-300 ml-1.5">{item.value.toLocaleString()}</span>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default BarChart;