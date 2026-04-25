
import React, { useState, useMemo } from 'react';
import { motion } from 'motion/react';
import { useGameLogic } from '../../hooks/useGameLogic';
import { BuildingType, TranslationKeys } from '../../types'; 
import { BUILDING_DATA } from '../../data/buildingData';
import Button from './Button';
import Notification from './Notification';
import Dashboard from './Dashboard'; 
import PoliciesPanel from './PoliciesPanel'; 
import { Language } from '../../context/LanguageContext';
import { APARTMENT_UNLOCK_MANDATE, DEMOLITION_COST } from '../../game/settings'; 
import { 
  Zap, 
  Cpu,
  Factory,
  HardHat,
  Route, 
  Store, 
  Trees, 
  Sun, 
  Waves, 
  GraduationCap, 
  HeartPulse, 
  Shield, 
  Droplets, 
  Trash2,
  ChevronDown,
  ChevronUp,
  LayoutGrid,
  ColumnsIcon,
  GripHorizontal
} from 'lucide-react';

const StatDisplay: React.FC<{ label: string; value: string | number; className?: string, icon?: string }> = ({ label, value, className, icon }) => (
  <div className={`bg-slate-700/80 backdrop-blur-sm p-3 rounded-lg shadow-md flex items-center ${className}`}>
    {icon && <span className="mr-2 text-xl">{icon}</span>}
    <div>
      <span className="text-sm text-slate-300 block">{label}</span>
      <span className="font-bold text-xl text-sky-300">{value}</span>
    </div>
  </div>
);

interface GameUIProps {
  containerRef?: React.RefObject<HTMLDivElement>;
}

const GameUI: React.FC<GameUIProps> = ({ containerRef }) => {
  const { 
    money, 
    month, 
    happiness,
    selectedBuildingType, 
    gameOver, 
    mandateEnded,
    currentMandate,
    isDemolishModeActive,
    isPaused, 
    togglePause, 
    selectBuildingType, 
    toggleDemolishMode,
    resetGame,
    startNewMandate,
    timeOfDay,
    population, netCashFlow,
    translate: t, 
    currentLanguage, 
    setLanguage, 
    uiMessage, 
  } = useGameLogic();

  const [isDashboardOpen, setIsDashboardOpen] = useState(false);
  const [isPoliciesPanelOpen, setIsPoliciesPanelOpen] = useState(false); 
  const [isMenuExpanded, setIsMenuExpanded] = useState(true); 
  const [isVertical, setIsVertical] = useState(false);

  const buildingIcons: Record<string, React.ReactNode> = {
    [BuildingType.ROAD]: <Route size={18} />,
    [BuildingType.MARKET]: <Store size={18} />,
    [BuildingType.PARK]: <Trees size={18} />,
    [BuildingType.POWER_PLANT]: <Zap size={18} />,
    [BuildingType.SOLAR_POWER_PLANT]: <Sun size={18} />,
    [BuildingType.HYDRO_POWER_PLANT]: <Waves size={18} />,
    [BuildingType.SCHOOL]: <GraduationCap size={18} />,
    [BuildingType.HEALTH_POST]: <HeartPulse size={18} />,
    [BuildingType.POLICE_STATION]: <Shield size={18} />,
    [BuildingType.WATER_TREATMENT_PLANT]: <Droplets size={18} />,
    [BuildingType.TECH_INDUSTRY]: <Cpu size={18} />,
    [BuildingType.HEAVY_INDUSTRY]: <Factory size={18} />,
  };
  
  const manualBuildingTypes = [
    BuildingType.ROAD, BuildingType.MARKET, 
    BuildingType.PARK, 
    BuildingType.TECH_INDUSTRY, BuildingType.HEAVY_INDUSTRY,
    BuildingType.POWER_PLANT, 
    BuildingType.SOLAR_POWER_PLANT, BuildingType.HYDRO_POWER_PLANT,
    BuildingType.SCHOOL,
    BuildingType.HEALTH_POST, BuildingType.POLICE_STATION,
    BuildingType.WATER_TREATMENT_PLANT,
  ];
  // BuildingType.HOUSE is intentionally removed as it's auto-spawn only.
  // BuildingType.APARTMENT is also auto-spawn only.

  const buildingTypesForMenu = manualBuildingTypes;

  const happinessIcon = happiness >= 80 ? '😊' : happiness >= 60 ? '🙂' : happiness >= 40 ? '😐' : happiness >= 20 ? '😟' : '😥';
  const isBankrupt = gameOver && !mandateEnded; 
  const isGameEffectivelyPaused = gameOver || mandateEnded || isPaused;

  const toggleLanguage = () => {
    setLanguage(currentLanguage === Language.EN ? Language.PT_BR : Language.EN);
  };
  
  const formatCurrency = (value: number) => {
    return currentLanguage === Language.PT_BR 
        ? `R$${value.toLocaleString('pt-BR')}` 
        : `$${value.toLocaleString('en-US')}`;
  };

  const demolishButtonCostText = t('DEMOLISH_COST_INFO', {cost: formatCurrency(DEMOLITION_COST)});
  const autoHousingInfoMessage = t('AUTO_HOUSING_INFO_MESSAGE', { unlockMandate: APARTMENT_UNLOCK_MANDATE });

  return (
    <>
      {/* Top UI Bar */}
      <div className="absolute top-0 left-0 right-0 p-3 md:p-4 z-10 flex flex-col md:flex-row justify-end items-start md:items-center space-y-2 md:space-y-0 pointer-events-none">
        <div className="flex flex-wrap gap-2 md:gap-3 items-center pointer-events-auto">
          <StatDisplay label={t('FUNDS_LABEL')} value={formatCurrency(money)} icon="💰" />
          <StatDisplay label={t('MONTH_LABEL')} value={month} icon="🗓️" />
          <StatDisplay label={t('HAPPINESS_LABEL')} value={`${Math.round(happiness)}%`} icon={happinessIcon} />
          <Button 
            onClick={() => setIsPoliciesPanelOpen(true)} 
            variant="secondary" 
            size="sm"
            className="ml-1 md:ml-2 !py-2 !px-3" 
            title={t('POLICIES_PANEL_BUTTON_TITLE')}
            aria-label={t('POLICIES_PANEL_BUTTON_TITLE')}
            disabled={isGameEffectivelyPaused}
          >
            <span role="img" aria-label="Scroll icon" className="mr-1 md:mr-2">📜</span>
            <span className="hidden sm:inline">{t('POLICIES_PANEL_BUTTON_TEXT')}</span>
          </Button>
          <Button 
            onClick={() => setIsDashboardOpen(true)} 
            variant="secondary" 
            size="sm"
            className="ml-1 md:ml-2 !py-2 !px-3" 
            title={t('DASHBOARD_BUTTON_TITLE')}
            aria-label={t('DASHBOARD_BUTTON_TITLE')}
          >
            <span role="img" aria-label="Chart increasing icon" className="mr-1 md:mr-2">📊</span>
            <span className="hidden sm:inline">{t('DASHBOARD_BUTTON_TEXT')}</span>
          </Button>
           <Button
            onClick={togglePause}
            variant="secondary"
            size="sm"
            className="ml-1 md:ml-2 !py-2 !px-3"
            title={isPaused ? t('RESUME_BUTTON') : t('PAUSE_BUTTON')}
            disabled={gameOver || mandateEnded} 
          >
            {isPaused ? '▶️' : '⏸️'} {isPaused ? t('RESUME_BUTTON') : t('PAUSE_BUTTON')}
          </Button>
          <Button
            onClick={toggleLanguage}
            variant="secondary"
            size="sm"
            className="ml-1 md:ml-2 !py-2 !px-3"
            title={currentLanguage === Language.EN ? t('SWITCH_TO_PORTUGUESE') : t('SWITCH_TO_ENGLISH')}
          >
            {currentLanguage === Language.EN ? '🇧🇷 PT' : '🇺🇸 EN'}
          </Button>
        </div>
      </div>

      {/* Construction Menu */}
      <motion.div 
        drag
        dragConstraints={containerRef}
        dragElastic={0}
        dragMomentum={false}
        className={`absolute z-10 pointer-events-none ${isVertical ? 'top-4 left-4' : 'top-4 left-4 xl:left-8'}`}
        initial={false}
      >
        {isBankrupt ? (
          <div className="bg-red-700/90 backdrop-blur-sm p-4 rounded-lg shadow-xl text-center space-y-3 pointer-events-auto">
            <h2 className="text-2xl font-bold text-white">{t('GAME_OVER_TITLE')}</h2>
            {uiMessage && <p className="text-red-100">{uiMessage.startsWith(t('GAME_OVER_TITLE')) ? uiMessage.substring(t('GAME_OVER_TITLE').length).trim() : uiMessage}</p>}
            <Button onClick={resetGame} variant="danger" size="lg" className="w-full sm:w-auto">
              {t('PLAY_AGAIN_BUTTON')}
            </Button>
          </div>
        ) : mandateEnded ? (
          <div className="bg-sky-700/90 backdrop-blur-sm p-4 rounded-lg shadow-xl text-center space-y-3 pointer-events-auto cursor-move">
            <h2 className="text-2xl font-bold text-white">{t('MANDATE_ENDED_TITLE', { currentMandate })}</h2>
            <p className="text-sky-100">{t('MANDATE_MONTH_INFO', { month })}</p>
            <p className="text-sky-100">{t('MANDATE_FUNDS_INFO', { money: formatCurrency(money) })}</p>
            <p className="text-sky-100">{t('MANDATE_POPULATION_INFO', { population })}</p>
            <p className="text-sky-100">{t('MANDATE_HAPPINESS_INFO', { happiness: Math.round(happiness) })}</p>
            <p className="text-sky-100">{t('MANDATE_CASHFLOW_INFO', { netCashFlow: formatCurrency(netCashFlow) })}</p>
            {uiMessage && !uiMessage.startsWith(t('MANDATE_ENDED_TITLE', { currentMandate }).substring(0,10) ) && <p className="text-sky-200 mt-1">{uiMessage}</p>}
            <div className="flex flex-col sm:flex-row justify-center gap-3 mt-3">
              <Button onClick={() => setIsDashboardOpen(true)} variant="secondary" size="md">
                {t('VIEW_FULL_DASHBOARD_BUTTON')}
              </Button>
              <Button onClick={startNewMandate} variant="success" size="lg">
                {t('START_NEXT_MANDATE_BUTTON')}
              </Button>
            </div>
            <Button onClick={resetGame} variant="danger" size="sm" className="mt-4 opacity-80 hover:opacity-100">
                {t('END_GAME_RESET_BUTTON')}
            </Button>
          </div>
        ) : (
          <div className={`bg-slate-900/90 backdrop-blur-md p-1.5 rounded-lg shadow-2xl border border-slate-700/40 pointer-events-auto cursor-grab active:cursor-grabbing flex flex-col ${isVertical ? 'w-fit min-w-[50px] max-h-[75vh]' : 'w-fit max-w-[85vw]'}`}>
            <div className="flex justify-between items-center px-1 mb-1">
              <div className="flex items-center gap-1.5">
                <GripHorizontal className="text-slate-500" size={14} />
              </div>
              <div className="flex gap-1">
                <Button
                  onClick={() => setIsVertical(!isVertical)}
                  variant="secondary"
                  size="sm"
                  className="!py-0.5 !px-1"
                  title={isVertical ? "Horizontal" : "Vertical"}
                >
                  {isVertical ? <LayoutGrid size={12} /> : <ColumnsIcon size={12} />}
                </Button>
                <Button
                  onClick={() => setIsMenuExpanded(!isMenuExpanded)}
                  variant="secondary"
                  size="sm"
                  className="!py-0.5 !px-1"
                  title={isMenuExpanded ? t('TOGGLE_MENU_COLLAPSE') : t('TOGGLE_MENU_EXPAND')}
                >
                  {isMenuExpanded ? <ChevronDown size={12} /> : <ChevronUp size={12} />}
                </Button>
              </div>
            </div>

            {isMenuExpanded && (
              <div className="overflow-y-auto custom-scrollbar pr-1">
                <div className={`grid gap-1 ${isVertical ? 'grid-cols-1' : 'grid-cols-7 sm:grid-cols-9 md:grid-cols-13'}`}>
                  {buildingTypesForMenu.map((type) => {
                    const config = BUILDING_DATA[type];
                    const buildingNameKey = `BUILDING_${type}_NAME` as TranslationKeys;
                    const typeName = t(buildingNameKey);
                    
                    let tooltipParts = [t('TOOLTIP_COST', {cost: formatCurrency(config.cost)})];
                    if(config.maintenance) tooltipParts.push(t('TOOLTIP_MAINTENANCE', {maintenance: formatCurrency(config.maintenance)}));
                    if(config.income) tooltipParts.push(t('TOOLTIP_INCOME', {income: formatCurrency(config.income)}));
                    if(config.happinessEffectMonthly) tooltipParts.push(t('TOOLTIP_HAPPINESS_EFFECT', {value: config.happinessEffectMonthly}));
                    if(config.electricityProduction) tooltipParts.push(t('TOOLTIP_ELECTRICITY_PROD', {value: config.electricityProduction}));
                    if(config.electricityConsumption) tooltipParts.push(t('TOOLTIP_ELECTRICITY_CONS', {value: config.electricityConsumption}));
                    if(config.airQualityEffectMonthly) tooltipParts.push(t('TOOLTIP_AIR_QUALITY_EFFECT', {value: config.airQualityEffectMonthly.toFixed(2)}));
                    if(config.waterQualityEffectMonthly) tooltipParts.push(t('TOOLTIP_WATER_QUALITY_EFFECT', {value: config.waterQualityEffectMonthly.toFixed(2)}));
                    if(config.requiresRiver) tooltipParts.push(t('TOOLTIP_REQUIRES_RIVER'));

                    const title = `${typeName} - ${tooltipParts.join(', ')}`;

                    return (
                      <Button
                        key={type}
                        onClick={() => selectBuildingType(selectedBuildingType === type ? null : type)}
                        active={selectedBuildingType === type && !isDemolishModeActive && !isPaused}
                        disabled={isGameEffectivelyPaused || money < config.cost}
                        title={title}
                        variant={"primary"}
                        size="sm"
                        className={`flex flex-col items-center justify-center !p-1 h-10 w-10 relative group overflow-hidden ${isVertical ? 'w-full h-11' : ''}`}
                      >
                        <div className="group-hover:scale-110 transition-transform">
                          {buildingIcons[type]}
                        </div>
                      </Button>
                    );
                  })}
                  <Button
                      key="demolish"
                      onClick={toggleDemolishMode}
                      active={isDemolishModeActive && !isPaused}
                      disabled={isGameEffectivelyPaused || money < DEMOLITION_COST}
                      title={`${t('DEMOLISH_MODE_BUTTON_TEXT')} (${formatCurrency(DEMOLITION_COST)})`}
                      variant="danger"
                      size="sm"
                      className={`flex flex-col items-center justify-center !p-1 h-10 w-10 relative ${isVertical ? 'w-full h-11' : ''}`}
                  >
                      <Trash2 size={18} />
                  </Button>
                </div>
                {isDemolishModeActive && !isPaused && (
                  <p className="text-[10px] text-yellow-300 mt-2 italic text-center">{t('DEMOLISH_MODE_ACTIVE_INFO', {cost: formatCurrency(DEMOLITION_COST)})}</p>
                )}
                {isPaused && (
                  <p className="text-[10px] text-sky-300 mt-2 italic font-semibold text-center">{t('GAME_PAUSED_MESSAGE')}</p>
                )}
              </div>
            )}
          </div>
        )}
      </motion.div>
      <Notification />
      
      <Dashboard isOpen={isDashboardOpen} onClose={() => setIsDashboardOpen(false)} />
      <PoliciesPanel isOpen={isPoliciesPanelOpen} onClose={() => setIsPoliciesPanelOpen(false)} />
    </>
  );
};

export default GameUI;