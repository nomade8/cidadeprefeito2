

import { useGame } from '../context/GameContext';
import { useLanguage, Language } from '../context/LanguageContext';
import { BuildingType, GridPosition, TranslationKeys, PoliciesState, PolicyLevel } from '../types'; 
import { BUILDING_DATA } from '../data/buildingData'; 
import { MARKET_INCOME_POWER_BOOST_FACTOR, DEMOLITION_COST, APARTMENT_UNLOCK_MANDATE } from '../game/settings';
import { useMemo } from 'react';

export const useGameLogic = () => {
  const context = useGame(); 
  const { t, language } = useLanguage(); 

  const getUIMessage = (): string | null => {
    const currentMessageKey = context.messageKey;
    if (!currentMessageKey) return null;
    
    if (context.isDemolishModeActive && currentMessageKey === 'DEMOLISH_MODE_ACTIVE_INFO') {
      return t('DEMOLISH_MODE_ACTIVE_INFO', { cost: DEMOLITION_COST });
    }
    
    if (currentMessageKey === 'BUILDING_BUILT' && context.messagePayload?.isBridge === 'true') {
        const buildingName = context.messagePayload.buildingName ? t(context.messagePayload.buildingName as TranslationKeys) : '';
        const baseMessage = t('BUILDING_BUILT', { 
            buildingName: buildingName, 
            cost: context.messagePayload.cost,
            isBridge: '' 
        });
        return baseMessage.trim() + t('BRIDGE_SUFFIX');
    }

    if (currentMessageKey === 'BUILDING_SELECTED_MESSAGE' && context.messagePayload?.buildingName) {
      const buildingNameTranslationKey = context.messagePayload.buildingName as TranslationKeys;
      if (buildingNameTranslationKey === 'BUILDING_ROAD_NAME') {
        return t('ROAD_PLACEMENT_START');
      }
      return t('BUILDING_SELECTED_MESSAGE', { buildingName: t(buildingNameTranslationKey) });
    }
    
    if (currentMessageKey === 'BUILDING_REQUIRES_RIVER' && context.messagePayload?.buildingName) {
      const buildingNameTranslationKey = context.messagePayload.buildingName as TranslationKeys;
      return t('BUILDING_REQUIRES_RIVER', { buildingName: t(buildingNameTranslationKey) });
    }
    
    if (currentMessageKey === 'POLICY_CHANGED_MESSAGE' && context.messagePayload?.policyName) {
        const policyNameKey = context.messagePayload.policyName as TranslationKeys;
        const policyValueKey = context.messagePayload.policyValue as string; 
        let translatedValue = policyValueKey;

        if (policyValueKey === 'LOW' || policyValueKey === 'NORMAL' || policyValueKey === 'HIGH') {
            translatedValue = t(`POLICY_LEVEL_${policyValueKey}` as TranslationKeys);
        } else if (policyValueKey === 'true') {
            translatedValue = t('POLICY_STATUS_ACTIVE');
        } else if (policyValueKey === 'false') {
            translatedValue = t('POLICY_STATUS_INACTIVE');
        }
        return t('POLICY_CHANGED_MESSAGE', { policyName: t(policyNameKey), policyValue: translatedValue });
    }

    if (currentMessageKey === 'APARTMENTS_LOCKED' || currentMessageKey === 'TOOLTIP_APARTMENT_LOCKED' || currentMessageKey === 'AUTO_HOUSING_INFO_MESSAGE') {
      return t(currentMessageKey, { ...context.messagePayload, unlockMandate: APARTMENT_UNLOCK_MANDATE });
    }

    if (currentMessageKey?.toString().startsWith('EVENT_')) {
      return t(currentMessageKey);
    }
        
    return t(currentMessageKey, context.messagePayload); 
  };


  const selectBuildingType = (type: BuildingType | null) => {
    if (context.mandateEnded || context.isPaused) return; 

    if (type === BuildingType.APARTMENT || type === BuildingType.HOUSE) { 
      context.dispatch({ type: 'SET_MESSAGE', payload: { key: 'APARTMENTS_AUTO_ONLY' } });
      return;
    }
    context.dispatch({ type: 'SELECT_BUILDING', payload: type });
  };

  const buildStructure = (gridX: number, gridZ: number) => {
    if (context.gameOver || context.mandateEnded || context.isPaused || context.isDemolishModeActive) { 
      if (context.isDemolishModeActive) {
         context.dispatch({ type: 'SET_MESSAGE', payload: { key: 'DEMOLISH_MODE_ACTIVE_INFO', msgPayload: {cost: DEMOLITION_COST}}});
      } else if (context.isPaused) {
        // Message handled by reducer or button being disabled
      } else {
        context.dispatch({ type: 'SET_MESSAGE', payload: { key: 'GAME_PAUSED_CANNOT_BUILD' } }); 
      }
      return;
    }
    if (!context.selectedBuildingType) {
      context.dispatch({ type: 'SET_MESSAGE', payload: { key: 'SELECT_BUILDING_FIRST' } });
      return;
    }
    
    if (context.selectedBuildingType === BuildingType.APARTMENT || context.selectedBuildingType === BuildingType.HOUSE) { 
      context.dispatch({ type: 'SET_MESSAGE', payload: { key: 'APARTMENTS_AUTO_ONLY' } }); // Generic message can cover both
      return;
    }

    const position: GridPosition = { x: gridX, z: gridZ };
    const cost = BUILDING_DATA[context.selectedBuildingType].cost;
    if (!context.canAfford(cost)) {
      context.dispatch({ type: 'SET_MESSAGE', payload: { key: 'NOT_ENOUGH_MONEY' } });
      return;
    }
    
    context.dispatch({
      type: 'BUILD_STRUCTURE',
      payload: { type: context.selectedBuildingType, position },
    });
  };

  const batchBuildStructures = (type: BuildingType, positions: GridPosition[]) => {
    if (context.gameOver || context.mandateEnded || context.isPaused || context.isDemolishModeActive) return;

    const costPerUnit = BUILDING_DATA[type].cost;
    const totalMaxCost = costPerUnit * positions.length;
    
    // We don't strictly check full cost here because the reducer will build as many as possible
    // but we can at least check if they can afford one.
    if (!context.canAfford(costPerUnit)) {
      context.dispatch({ type: 'SET_MESSAGE', payload: { key: 'NOT_ENOUGH_MONEY' } });
      return;
    }

    context.dispatch({
      type: 'BATCH_BUILD_STRUCTURES',
      payload: { type, positions }
    });
  };

  const toggleDemolishMode = () => {
    if (context.mandateEnded || context.gameOver || context.isPaused) return;
    context.dispatch({ type: 'TOGGLE_DEMOLISH_MODE' });
  };

  const demolishStructure = (position: GridPosition) => {
    if (context.mandateEnded || context.gameOver || context.isPaused || !context.isDemolishModeActive) return;
    
    const buildingToDemolish = context.getBuildingAt(position);
    if (!buildingToDemolish) {
        context.dispatch({type: 'SET_MESSAGE', payload: { key: 'DEMOLISH_FAILED_NO_BUILDING' }});
        return;
    }

    if (!context.canAfford(DEMOLITION_COST)) {
        context.dispatch({ type: 'SET_MESSAGE', payload: { key: 'DEMOLISH_FAILED_NO_FUNDS', msgPayload: {cost: DEMOLITION_COST}}});
        return;
    }
    context.dispatch({ type: 'DEMOLISH_STRUCTURE', payload: { position } });
  };
  
  const resetGame = () => {
    context.dispatch({ type: 'RESET_GAME' });
  };

  const startNewMandate = () => {
    context.dispatch({ type: 'START_NEW_MANDATE' });
  };

  const clearMessage = () => {
    if (context.isDemolishModeActive && context.messageKey === 'DEMOLISH_MODE_ACTIVE_INFO') return;
    if (context.messageKey === 'POLICY_CHANGED_MESSAGE') return;
    if (context.messageKey === 'GAME_PAUSED_MESSAGE' || context.messageKey === 'GAME_RESUMED_MESSAGE') return; 

    if (context.messageKey) {
      context.dispatch({type: 'SET_MESSAGE', payload: { key: null }});
    }
  };

  const setPolicy = (policyToUpdate: keyof PoliciesState, value: PolicyLevel | boolean) => {
    if (context.mandateEnded || context.gameOver || context.isPaused) return;
    context.dispatch({ type: 'SET_POLICY', payload: { policy: policyToUpdate, value } });
  };

  const togglePause = () => {
    if (context.gameOver || context.mandateEnded) return;
    context.dispatch({ type: 'TOGGLE_PAUSE' });
  };

  const calculatedMetrics = useMemo(() => {
    let totalHouses = 0;
    let totalRoads = 0; 
    let totalMarkets = 0;
    let totalParks = 0;
    let totalFossilPowerPlants = 0; 
    let totalSolarPowerPlants = 0;
    let totalHydroPowerPlants = 0;
    let totalApartments = 0; 
    let totalSchools = 0;
    let totalHealthPosts = 0;
    let totalPoliceStations = 0;
    let totalWaterTreatmentPlants = 0; 
    let totalTechIndustries = 0;
    let totalHeavyIndustries = 0;
    let currentMonthlyIncome = 0;
    let currentMonthlyMaintenance = 0;
    let currentHousingCapacity = 0; 

    const buildings = context.buildings || [];
    const isBuildingsArray = Array.isArray(buildings);

    const anyPowerPlantExists = isBuildingsArray && buildings.some(b => 
        b.type === BuildingType.POWER_PLANT || 
        b.type === BuildingType.SOLAR_POWER_PLANT || 
        b.type === BuildingType.HYDRO_POWER_PLANT
    );

    if (isBuildingsArray) {
      buildings.forEach(building => {
        const config = BUILDING_DATA[building.type];
        if (!config) return; // Skip if config missing

        let buildingIncome = config.income || 0;

        if (config.housingProvided) {
          currentHousingCapacity += config.housingProvided;
        }

        switch (building.type) {
          case BuildingType.HOUSE: totalHouses++; break;
          case BuildingType.ROAD: totalRoads++; break;
          case BuildingType.MARKET:
            totalMarkets++;
            if (anyPowerPlantExists) { 
              buildingIncome *= MARKET_INCOME_POWER_BOOST_FACTOR;
            }
            break;
          case BuildingType.PARK: totalParks++; break;
          case BuildingType.POWER_PLANT: totalFossilPowerPlants++; break;
          case BuildingType.SOLAR_POWER_PLANT: totalSolarPowerPlants++; break;
          case BuildingType.HYDRO_POWER_PLANT: totalHydroPowerPlants++; break;
          case BuildingType.APARTMENT: totalApartments++; break;
          case BuildingType.SCHOOL: totalSchools++; break;
          case BuildingType.HEALTH_POST: totalHealthPosts++; break;
          case BuildingType.POLICE_STATION: totalPoliceStations++; break;
          case BuildingType.WATER_TREATMENT_PLANT: totalWaterTreatmentPlants++; break; 
          case BuildingType.TECH_INDUSTRY: totalTechIndustries++; break;
          case BuildingType.HEAVY_INDUSTRY: totalHeavyIndustries++; break;
        }
        currentMonthlyIncome += buildingIncome;
        if (config.maintenance) currentMonthlyMaintenance += config.maintenance;
      });
    }

    const population = currentHousingCapacity; // Population is now equivalent to housing capacity
    const netCashFlow = currentMonthlyIncome - currentMonthlyMaintenance;

    return {
      totalHouses, totalRoads, totalMarkets, totalParks, 
      totalFossilPowerPlants, totalSolarPowerPlants, totalHydroPowerPlants,
      totalApartments, totalSchools, totalHealthPosts, totalPoliceStations, 
      totalWaterTreatmentPlants, totalTechIndustries, totalHeavyIndustries,
      monthlyIncome: currentMonthlyIncome, monthlyMaintenance: currentMonthlyMaintenance,
      population, housingCapacity: currentHousingCapacity, netCashFlow,
    };
  }, [context.buildings]); 


  return {
    // Game State
    money: context.money,
    month: context.month,
    buildings: context.buildings,
    selectedBuildingType: context.selectedBuildingType,
    gameOver: context.gameOver, 
    happiness: context.happiness,
    // desiredPopulation: context.desiredPopulation, // Removed
    mandateEnded: context.mandateEnded,
    currentMandate: context.currentMandate,
    mandateTargetMonth: context.mandateTargetMonth,
    isDemolishModeActive: context.isDemolishModeActive,
    policies: context.policies, 
    isPaused: context.isPaused,
    trafficCongestion: context.trafficCongestion,
    activeEvents: context.activeEvents,
    timeOfDay: context.timeOfDay,
    
    // Terrain
    riverTiles: context.riverTiles,
    mountainTiles: context.mountainTiles,
    unbuildableTiles: context.unbuildableTiles,
    
    // Environmental & Electricity
    airQuality: context.airQuality,
    waterQuality: context.waterQuality,
    biodiversity: context.biodiversity,
    electricityProduction: context.electricityProduction,
    electricityConsumption: context.electricityConsumption,
    electricityCoveragePercent: context.electricityCoveragePercent,
    electricityDemandSatisfaction: context.electricityDemandSatisfaction,
    
    // Messages
    messageKey: context.messageKey,
    messagePayload: context.messagePayload,
    uiMessage: getUIMessage(), 

    // Actions
    selectBuildingType,
    buildStructure,
    batchBuildStructures,
    toggleDemolishMode,
    demolishStructure,
    resetGame,
    startNewMandate, 
    clearMessage,
    setPolicy, 
    togglePause,

    // Helpers from context
    canAfford: context.canAfford,
    isOccupied: context.isOccupied, 
    getBuildingAt: context.getBuildingAt,

    // Calculated Metrics
    ...calculatedMetrics, 
    
    // Language
    currentLanguage: language,
    setLanguage: useLanguage().setLanguage, 
    translate: t, 
  };
};