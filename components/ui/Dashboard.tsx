
import React from 'react';
import { useGameLogic } from '../../hooks/useGameLogic'; 
import Button from './Button'; 
import BarChart from './BarChart'; 
import { useLanguage, Language } from '../../context/LanguageContext';
import { TranslationKeys, BuildingType } from '../../types'; 

interface DashboardProps {
  isOpen: boolean;
  onClose: () => void;
}

const StatItem: React.FC<{ label: string; value: string | number; unit?: string; positiveIsGood?: boolean; isCurrency?: boolean; icon?: string; currentLanguage?: Language }> = 
({ label, value, unit, positiveIsGood, isCurrency, icon, currentLanguage }) => {
  let valueColor = "text-sky-300"; 

  if (typeof value === 'number' && positiveIsGood !== undefined) {
    if (value > 0 && positiveIsGood) valueColor = "text-green-400";
    else if (value < 0 && positiveIsGood) valueColor = "text-red-400";
    else if (value > 0 && !positiveIsGood) valueColor = "text-red-400"; 
    else if (value < 0 && !positiveIsGood) valueColor = "text-green-400";
  }
  
  const displayValue = isCurrency && typeof value === 'number' 
    ? (currentLanguage === Language.PT_BR ? `R$${value.toLocaleString('pt-BR')}` : `$${value.toLocaleString('en-US')}`)
    : (typeof value === 'number' ? value.toLocaleString(currentLanguage === Language.PT_BR ? 'pt-BR' : 'en-US') : value);


  return (
    <div className="flex justify-between items-center py-2.5 border-b border-slate-700 last:border-b-0">
      <span className="text-slate-300 text-sm flex items-center">
        {icon && <span className="mr-2 text-base">{icon}</span>}
        {label}:
      </span>
      <span className={`font-semibold text-base ${valueColor}`}>
        {displayValue}
        {unit && <span className="text-xs text-slate-400 ml-1.5">{unit}</span>}
      </span>
    </div>
  );
};

const Dashboard: React.FC<DashboardProps> = ({ isOpen, onClose }) => {
  const {
    money, month, totalHouses, totalRoads, totalMarkets, totalParks, 
    totalFossilPowerPlants, totalSolarPowerPlants, totalHydroPowerPlants, 
    totalApartments, totalSchools, totalHealthPosts, totalPoliceStations, 
    totalWaterTreatmentPlants, totalTechIndustries, totalHeavyIndustries,
    monthlyIncome, monthlyMaintenance, population, housingCapacity, totalJobs,
    // desiredPopulation, // Removed
    netCashFlow, happiness, gameOver, translate: t, currentLanguage,
    trafficCongestion, activeEvents
  } = useGameLogic();

  if (!isOpen) return null;

  const happinessPercentage = Math.round(happiness);
  const happinessIcon = happinessPercentage >= 80 ? '😊' : happinessPercentage >= 60 ? '🙂' : happinessPercentage >= 40 ? '😐' : happinessPercentage >= 20 ? '😟' : '😥';

  const financialChartData = [
    { label: t('DASHBOARD_STAT_MONTHLY_INCOME'), value: monthlyIncome, color: "bg-green-500" },
    { label: t('DASHBOARD_STAT_MONTHLY_MAINTENANCE'), value: monthlyMaintenance, color: "bg-red-500" },
  ];

  const buildingChartData = [
    { label: t('BUILDING_HOUSE_NAME'), value: totalHouses, color: "bg-blue-500" },
    { label: t('BUILDING_APARTMENT_NAME'), value: totalApartments, color: "bg-purple-500" }, 
    { label: t('BUILDING_MARKET_NAME'), value: totalMarkets, color: "bg-yellow-500" },
    { label: t('BUILDING_PARK_NAME'), value: totalParks, color: "bg-emerald-500" },
    { label: t('BUILDING_POWER_PLANT_NAME'), value: totalFossilPowerPlants, color: "bg-slate-600" }, 
    { label: t('BUILDING_SOLAR_POWER_PLANT_NAME'), value: totalSolarPowerPlants, color: "bg-orange-400" }, 
    { label: t('BUILDING_HYDRO_POWER_PLANT_NAME'), value: totalHydroPowerPlants, color: "bg-sky-500" }, 
    { label: t('BUILDING_SCHOOL_NAME'), value: totalSchools, color: "bg-orange-500" },
    { label: t('BUILDING_HEALTH_POST_NAME'), value: totalHealthPosts, color: "bg-rose-500" },
    { label: t('BUILDING_POLICE_STATION_NAME'), value: totalPoliceStations, color: "bg-sky-600" },
    { label: t('BUILDING_WATER_TREATMENT_PLANT_NAME'), value: totalWaterTreatmentPlants, color: "bg-cyan-500" }, 
    { label: t('BUILDING_TECH_INDUSTRY_NAME'), value: totalTechIndustries, color: "bg-teal-400" },
    { label: t('BUILDING_HEAVY_INDUSTRY_NAME'), value: totalHeavyIndustries, color: "bg-amber-800" },
    { label: t('BUILDING_ROAD_NAME'), value: totalRoads, color: "bg-gray-400" },
  ];
  
  const formatCurrency = (value: number) => {
    return currentLanguage === Language.PT_BR 
        ? `R$${value.toLocaleString('pt-BR')}` 
        : `$${value.toLocaleString('en-US')}`;
  };


  return (
    <div 
      className="fixed inset-0 bg-slate-900/80 backdrop-blur-md z-20 flex justify-center items-center p-2 sm:p-4 transition-opacity duration-300 ease-in-out" 
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-labelledby="dashboard-title"
    >
      <div 
        className="bg-slate-800 p-4 sm:p-5 md:p-6 rounded-xl shadow-2xl w-full max-w-xl md:max-w-2xl max-h-[95vh] overflow-y-auto text-white relative ring-1 ring-slate-700/80"
        onClick={(e) => e.stopPropagation()} 
      >
        <div className="flex justify-between items-center mb-4 pb-3 border-b border-slate-700">
          <h2 id="dashboard-title" className="text-xl md:text-2xl font-bold text-sky-400">{t('DASHBOARD_TITLE')}</h2>
          <Button 
            onClick={onClose} 
            variant="secondary" 
            size="sm" 
            className="!p-2 leading-none bg-slate-700 hover:bg-slate-600"
            aria-label={t('CLOSE')}
          >
            &times;
          </Button>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <StatItem label={t('DASHBOARD_STAT_FUNDS')} value={money} isCurrency icon="💰" currentLanguage={currentLanguage}/>
          <StatItem label={t('DASHBOARD_STAT_MONTH')} value={month} icon="🗓️" currentLanguage={currentLanguage}/>
        </div>
        
        <h3 className="text-lg font-semibold text-sky-300 mt-4 mb-1 pt-3 border-t border-slate-700">{t('DASHBOARD_SECTION_WELLBEING')}</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-4">
            <StatItem label={t('DASHBOARD_STAT_HAPPINESS')} value={`${happinessPercentage}%`} icon={happinessIcon} positiveIsGood={happinessPercentage >= 50} currentLanguage={currentLanguage}/>
            <StatItem label={t('DASHBOARD_STAT_POPULATION')} value={population} unit={t('DASHBOARD_UNIT_CITIZENS')} icon="👥" currentLanguage={currentLanguage}/>
            <StatItem label={t('DASHBOARD_STAT_HOUSING_CAPACITY')} value={housingCapacity} unit={t('DASHBOARD_UNIT_CITIZENS')} icon="🏠" currentLanguage={currentLanguage}/>
            <StatItem label={t('DASHBOARD_STAT_JOBS')} value={totalJobs} icon="💼" currentLanguage={currentLanguage}/>
        </div>

        {activeEvents && activeEvents.length > 0 && (
          <>
            <h3 className="text-lg font-semibold text-red-400 mt-4 mb-1 pt-3 border-t border-slate-700">{t('DASHBOARD_ACTIVE_EVENTS')}</h3>
            <div className="space-y-2">
                {activeEvents.map(event => (
                  <div key={event.type} className="bg-red-900/20 border border-red-500/30 p-2 rounded text-sm text-red-200">
                    <span className="font-bold underline mr-2">{t(`EVENT_${event.type}_STARTED` as any).split('!')[0]}!</span>
                    {t(`EVENT_${event.type}_STARTED` as any).split('!')[1]} ({event.remainingMonths} {t('MONTH_LABEL').toLowerCase()})
                  </div>
                ))}
            </div>
          </>
        )}

        <h3 className="text-lg font-semibold text-sky-300 mt-4 mb-1 pt-3 border-t border-slate-700">{t('DASHBOARD_SECTION_ECONOMY')}</h3>
         <div className="grid grid-cols-1 md:grid-cols-2 gap-x-4">
            <StatItem label={t('DASHBOARD_STAT_MONTHLY_INCOME')} value={monthlyIncome} isCurrency positiveIsGood={true} icon="💸" currentLanguage={currentLanguage}/>
            <StatItem label={t('DASHBOARD_STAT_MONTHLY_MAINTENANCE')} value={monthlyMaintenance} isCurrency positiveIsGood={false} icon="🔧" currentLanguage={currentLanguage}/>
        </div>
        <StatItem label={t('DASHBOARD_STAT_NET_CASHFLOW')} value={netCashFlow} isCurrency positiveIsGood={true} icon="⚖️" currentLanguage={currentLanguage}/>

        <h3 className="text-lg font-semibold text-sky-300 mt-4 mb-1 pt-3 border-t border-slate-700">{t('DASHBOARD_SECTION_STRUCTURES')}</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-4">
            <StatItem label={t('DASHBOARD_STAT_HOUSES')} value={totalHouses} icon="🏡" currentLanguage={currentLanguage}/>
            <StatItem label={t('DASHBOARD_STAT_APARTMENTS')} value={totalApartments} icon="🏢" currentLanguage={currentLanguage}/>
            <StatItem label={t('DASHBOARD_STAT_MARKETS')} value={totalMarkets} icon="🏪" currentLanguage={currentLanguage}/>
            <StatItem label={t('DASHBOARD_STAT_PARKS')} value={totalParks} icon="🌳" currentLanguage={currentLanguage}/>
            <StatItem label={t('DASHBOARD_STAT_FOSSIL_POWER_PLANTS' as TranslationKeys)} value={totalFossilPowerPlants} icon="🏭" currentLanguage={currentLanguage}/>
            <StatItem label={t('DASHBOARD_STAT_SOLAR_POWER_PLANTS' as TranslationKeys)} value={totalSolarPowerPlants} icon="☀️" currentLanguage={currentLanguage}/>
            <StatItem label={t('DASHBOARD_STAT_HYDRO_POWER_PLANTS' as TranslationKeys)} value={totalHydroPowerPlants} icon="🌊" currentLanguage={currentLanguage}/>
            <StatItem label={t('DASHBOARD_STAT_SCHOOLS')} value={totalSchools} icon="🏫" currentLanguage={currentLanguage}/>
            <StatItem label={t('DASHBOARD_STAT_HEALTH_POSTS')} value={totalHealthPosts} icon="🏥" currentLanguage={currentLanguage}/>
            <StatItem label={t('DASHBOARD_STAT_POLICE_STATIONS')} value={totalPoliceStations} icon="🚓" currentLanguage={currentLanguage}/>
            <StatItem label={t('DASHBOARD_STAT_WATER_TREATMENT_PLANTS' as TranslationKeys)} value={totalWaterTreatmentPlants} icon="💧🏭" currentLanguage={currentLanguage}/>
            <StatItem label={t('DASHBOARD_STAT_TECH_INDUSTRIES' as TranslationKeys)} value={totalTechIndustries} icon="💻" currentLanguage={currentLanguage}/>
            <StatItem label={t('DASHBOARD_STAT_HEAVY_INDUSTRIES' as TranslationKeys)} value={totalHeavyIndustries} icon="🏭🏗️" currentLanguage={currentLanguage}/>
            <StatItem label={t('DASHBOARD_STAT_ROAD_SEGMENTS')} value={totalRoads} icon="🛣️" currentLanguage={currentLanguage}/>
        </div>

        <div className="mt-4 pt-3 border-t border-slate-700">
            <BarChart title={t('DASHBOARD_CHART_FINANCIAL_TITLE')} data={financialChartData} translate={t} />
            <BarChart title={t('DASHBOARD_CHART_BUILDING_DIST_TITLE')} data={buildingChartData.filter(item => item.value > 0)} translate={t} />
        </div>
        
        {gameOver && (
          <p className="mt-6 text-center text-red-400 font-semibold bg-red-900/40 p-3 rounded-md">
            {t('DASHBOARD_GAME_ENDED_MESSAGE', { status: netCashFlow < 0 ? t('DASHBOARD_GAME_ENDED_DEFICIT') : t('DASHBOARD_GAME_ENDED_SURPLUS') })}
          </p>
        )}
      </div>
    </div>
  );
};

export default Dashboard;