
import React, { useState } from 'react';
import { useGameLogic } from '../../hooks/useGameLogic';
import { useLanguage } from '../../context/LanguageContext';
import { TranslationKeys } from '../../types';

interface MetricDisplayProps {
  labelKey: TranslationKeys;
  value: number;
  unit?: string;
  isPercentage?: boolean;
  lowerIsBetter?: boolean;
  icon?: string;
  barColor?: string; // Optional: specific color for the bar
}

const MetricDisplay: React.FC<MetricDisplayProps> = ({ labelKey, value, unit = '', isPercentage = false, lowerIsBetter = false, icon, barColor }) => {
  const { t } = useLanguage(); 
  
  // Display value with one decimal place for percentages or typical 0-100 environmental metrics
  const formattedValue = (isPercentage || (value >= 0 && value <= 100 && !unit)) ? value.toFixed(1) : Math.round(value).toLocaleString();
  const displayValueText = isPercentage ? `${formattedValue}%` : formattedValue;
  
  const numericValueForBar = parseFloat(value.toFixed(1)); // Use a numeric value for comparisons and bar width

  let qualityColorClass = 'bg-slate-500'; // Default

  if (isPercentage || (numericValueForBar >=0 && numericValueForBar <=100 && !barColor)) { 
    if (lowerIsBetter) {
        if (numericValueForBar <= 25) qualityColorClass = 'bg-green-500';
        else if (numericValueForBar <= 50) qualityColorClass = 'bg-yellow-500';
        else if (numericValueForBar <= 75) qualityColorClass = 'bg-orange-500';
        else qualityColorClass = 'bg-red-500';
    } else { // Higher is better
        if (numericValueForBar >= 75) qualityColorClass = 'bg-green-500';
        else if (numericValueForBar >= 50) qualityColorClass = 'bg-yellow-500';
        else if (numericValueForBar >= 25) qualityColorClass = 'bg-orange-500';
        else qualityColorClass = 'bg-red-500';
    }
  }
  if (barColor) qualityColorClass = barColor;


  return (
    <div className="mb-3">
      <div className="flex justify-between items-center text-sm mb-0.5">
        <span className="text-slate-300 font-medium flex items-center">
            {icon && <span className="mr-1.5 text-base">{icon}</span>}
            {t(labelKey)}
        </span>
        <span className="text-sky-200 font-semibold">{displayValueText}{unit && !isPercentage && <span className="text-xs ml-1">{unit}</span>}</span>
      </div>
      <div className="w-full bg-slate-600 rounded-full h-2.5 overflow-hidden">
        <div 
            className={`${qualityColorClass} h-2.5 rounded-full transition-all duration-300 ease-in-out`} 
            style={{ width: `${(isPercentage || (numericValueForBar >=0 && numericValueForBar <=100)) ? Math.max(0, Math.min(100,numericValueForBar)) : 100}%` }} 
            role="progressbar"
            aria-valuenow={numericValueForBar}
            aria-valuemin={0}
            aria-valuemax={100}
        ></div>
      </div>
    </div>
  );
};


const EnvironmentalDashboard: React.FC = () => {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const { 
    airQuality, waterQuality, biodiversity, 
    electricityProduction, electricityConsumption, electricityCoveragePercent,
    population, totalHouses, totalApartments, // Added population and housing stats
  } = useGameLogic();
  const { t } = useLanguage(); 

  const toggleCollapse = () => setIsCollapsed(!isCollapsed);

  const coverage = electricityCoveragePercent > 500 ? '>500' : Math.round(electricityCoveragePercent);
  const coverageNumeric = electricityCoveragePercent > 500 ? 500 : electricityCoveragePercent;


  return (
    <div 
        className={`bg-slate-800/80 backdrop-blur-md shadow-lg text-white transition-all duration-300 ease-in-out h-full overflow-y-auto relative flex-shrink-0 ${isCollapsed ? 'w-12 hover:w-16' : 'w-64 p-3'}`}
        style={{ scrollbarWidth: 'thin', scrollbarColor: '#4A5568 #2D3748' }}
    >
      <div className={`mb-6 ${isCollapsed ? 'mt-12' : 'mt-8'} flex flex-col ${isCollapsed ? 'items-center overflow-hidden' : ''}`}>
        <h1 className={`font-bold text-sky-100 drop-shadow-[0_2px_2px_rgba(0,0,0,0.5)] transition-all ${isCollapsed ? 'text-[8px] transform -rotate-90 uppercase tracking-tighter' : 'text-xl'}`}>
          {t('GAME_TITLE')}
        </h1>
        <div className="h-1 w-full bg-sky-500/30 mt-2 rounded-full hidden md:block" />
      </div>

      <button 
        onClick={toggleCollapse} 
        className={`absolute top-2 text-sky-300 hover:text-sky-100 p-1 rounded transition-colors ${isCollapsed ? 'right-1.5' : 'right-2'}`}
        title={isCollapsed ? t('ENV_DASHBOARD_EXPAND') : t('ENV_DASHBOARD_COLLAPSE')}
      >
        {isCollapsed ? '📊➡️' : '⬅️'}
      </button>

      {!isCollapsed && (
        <>
          <h3 className="text-lg font-semibold text-sky-400 mb-3 mt-1">{t('ENV_DASHBOARD_TITLE')}</h3>
          
          <MetricDisplay labelKey="ENV_AIR_QUALITY" value={airQuality} isPercentage icon="🌬️" />
          <MetricDisplay labelKey="ENV_WATER_QUALITY" value={waterQuality} isPercentage icon="💧"/>
          <MetricDisplay labelKey="ENV_BIODIVERSITY" value={biodiversity} isPercentage icon="🌳"/>

          <div className="mt-4 pt-3 border-t border-slate-700">
            <h4 className="text-md font-semibold text-sky-300 mb-2 flex items-center">
                <span className="mr-1.5 text-base">🏘️</span>
                {t('ENV_POPULATION_HOUSING_TITLE')}
            </h4>
            <div className="flex justify-between items-center text-sm mb-1">
              <span className="text-slate-300 font-medium flex items-center">
                <span className="mr-1.5 text-base">👥</span>{t('ENV_POPULATION')}
              </span>
              <span className="text-sky-200 font-semibold">{population.toLocaleString()}</span>
            </div>
            <div className="flex justify-between items-center text-sm mb-1">
              <span className="text-slate-300 font-medium flex items-center">
                <span className="mr-1.5 text-base">🏡</span>{t('ENV_HOUSES')}
              </span>
              <span className="text-sky-200 font-semibold">{totalHouses.toLocaleString()}</span>
            </div>
            <div className="flex justify-between items-center text-sm">
              <span className="text-slate-300 font-medium flex items-center">
                <span className="mr-1.5 text-base">🏢</span>{t('ENV_APARTMENTS')}
              </span>
              <span className="text-sky-200 font-semibold">{totalApartments.toLocaleString()}</span>
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-slate-700">
            <h4 className="text-md font-semibold text-sky-300 mb-2 flex items-center">
                <span className="mr-1.5 text-base">⚡</span>
                {t('ENV_ELECTRICITY_TITLE')}
            </h4>
            <MetricDisplay labelKey="ENV_ELECTRICITY_PROD" value={electricityProduction} unit={t('UNIT_MW')} barColor="bg-sky-500"/>
            <MetricDisplay labelKey="ENV_ELECTRICITY_CONS" value={electricityConsumption} unit={t('UNIT_MW')} barColor="bg-amber-500" />
            <MetricDisplay labelKey="ENV_ELECTRICITY_COVERAGE" value={coverageNumeric} isPercentage />
          </div>
        </>
      )}
      {isCollapsed && (
         <div className="mt-12 flex flex-col items-center space-y-4">
            <span title={t('ENV_DASHBOARD_TITLE')} className="transform -rotate-90 origin-center whitespace-nowrap text-slate-400 text-xs tracking-wider cursor-default">{t('ENV_DASHBOARD_TITLE_COLLAPSED')}</span>
            <div className="mt-4 flex flex-col items-center space-y-3">
                <span title={`${t('ENV_AIR_QUALITY')}: ${airQuality.toFixed(1)}%`} className="text-lg">🌬️</span>
                <span title={`${t('ENV_WATER_QUALITY')}: ${waterQuality.toFixed(1)}%`} className="text-lg">💧</span>
                <span title={`${t('ENV_BIODIVERSITY')}: ${biodiversity.toFixed(1)}%`} className="text-lg">🌳</span>
                <span title={`${t('ENV_POPULATION')}: ${population.toLocaleString()}`} className="text-lg">👥</span>
                <span title={`${t('ENV_HOUSES')}: ${totalHouses.toLocaleString()}`} className="text-lg">🏡</span>
                <span title={`${t('ENV_APARTMENTS')}: ${totalApartments.toLocaleString()}`} className="text-lg">🏢</span>
                <span title={`${t('ENV_ELECTRICITY_TITLE')}: ${coverage}% ${t('ENV_ELECTRICITY_COVERAGE')}`} className="text-lg">⚡</span>
            </div>
         </div>
      )}
    </div>
  );
};

export default EnvironmentalDashboard;