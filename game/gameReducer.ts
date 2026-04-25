

import { GameState, GameAction, BuildingType, Building, GridPosition, TranslationKeys, PolicyLevel, PoliciesState, GameEvent, ActiveEvent, CitizenDemand } from '../types';
import { 
  INITIAL_MONEY, 
  INITIAL_MONTH, 
  GRID_SIZE, 
  TILE_SIZE,
  INITIAL_HAPPINESS,
  HAPPINESS_PER_PARK_MONTHLY,
  MAX_HAPPINESS_FROM_PARKS,
  MIN_POP_FOR_NO_PARK_PENALTY,
  HAPPINESS_PENALTY_NO_PARKS_HIGH_POP_MONTHLY,
  HAPPINESS_PENALTY_LOW_ELECTRICITY_MONTHLY,
  MIN_ELECTRICITY_COVERAGE_FOR_NO_PENALTY,
  MARKET_INCOME_POWER_BOOST_FACTOR,
  HAPPINESS_MIN_CAP,
  HAPPINESS_MAX_CAP,
  MANDATE_DURATION_MONTHS,
  MAX_HAPPINESS_FROM_PUBLIC_SERVICES, 
  PEOPLE_PER_HOUSE,
  PEOPLE_PER_APARTMENT,
  INITIAL_AIR_QUALITY,
  INITIAL_WATER_QUALITY,
  INITIAL_BIODIVERSITY,
  ENV_METRIC_MIN_CAP,
  ENV_METRIC_MAX_CAP,
  MIN_HAPPINESS_FOR_HOUSE_SPAWN,
  ROAD_PROXIMITY_FOR_HOUSING,
  SERVICE_PROXIMITY_FOR_HOUSING,
  MIN_HAPPINESS_FOR_APARTMENT_SPAWN,
  MAX_APARTMENTS_SPAWN_PER_MONTH,
  MIN_MARKET_PROXIMITY_FOR_APARTMENT,
  MIN_SCHOOL_PROXIMITY_FOR_APARTMENT,
  APARTMENT_UNLOCK_MANDATE,
  MIN_HOUSES_PER_QUADRANT_FOR_APARTMENT,
  MIN_HOUSES_IN_QUADRANT_FOR_CONVERSION,
  HOUSES_TO_CONVERT_TO_APARTMENT,    
  MAX_APARTMENT_CONVERSIONS_PER_MONTH,
  PARK_RIVER_WATER_QUALITY_BONUS_MONTHLY, 
  DEMOLITION_COST,
  COMMERCE_TAX_CONFIG,
  PROPERTY_TAX_CONFIG,
  GREEN_INITIATIVES_MONTHLY_COST,
  GREEN_INITIATIVES_PARK_MAINTENANCE_MODIFIER,
  GREEN_INITIATIVES_GREEN_ENERGY_PRODUCTION_MODIFIER,
  GREEN_INITIATIVES_HAPPINESS_BONUS,
  BASE_HOUSES_SPAWN_PER_MONTH,
  MARKET_SPAWN_BONUS_PER_MARKET,
  MAX_SPAWN_BONUS_FROM_MARKETS,
  SCHOOL_SPAWN_BONUS_PER_SCHOOL,
  MAX_SPAWN_BONUS_FROM_SCHOOLS,
  ELECTRICITY_SPAWN_BONUS_IF_COVERED,
  OVERALL_MAX_HOUSES_SPAWN_PER_MONTH,
  MAX_REMOTE_HOUSES_ALLOWED_PER_MONTH,
  MIN_RESIDENTIAL_FOR_FIRST_MARKET,
  RESIDENTIAL_PER_MARKET_RATIO,
  PARK_INFLUENCE_RANGE,
  DEMAND_LIFESPAN_MONTHS
} from './settings';
import { BUILDING_DATA } from '../data/buildingData';
import { v4 as uuidv4 } from 'uuid';

// Function to generate random river and mountains
function generateRandomMapFeatures(gridSize: number) {
  const riverTiles: GridPosition[] = [];
  // Simple random walk for river (left-to-right or top-to-bottom)
  const isHorizontal = Math.random() < 0.5;
  
  if (isHorizontal) {
    let currZ = Math.floor(Math.random() * (gridSize - 8)) + 4;
    for (let x = 0; x < gridSize; x++) {
      riverTiles.push({ x, z: currZ });
      riverTiles.push({ x, z: currZ + 1 }); // 2 tiles wide
      if (Math.random() < 0.4) {
        currZ += Math.random() < 0.5 ? 1 : -1;
        currZ = Math.max(1, Math.min(gridSize - 3, currZ));
      }
    }
  } else {
    let currX = Math.floor(Math.random() * (gridSize - 8)) + 4;
    for (let z = 0; z < gridSize; z++) {
      riverTiles.push({ x: currX, z });
      riverTiles.push({ x: currX + 1, z }); // 2 tiles wide
      if (Math.random() < 0.4) {
        currX += Math.random() < 0.5 ? 1 : -1;
        currX = Math.max(1, Math.min(gridSize - 3, currX));
      }
    }
  }

  const mountainTiles: GridPosition[] = [];
  const mSize = Math.floor(Math.random() * 2) + 4; // 4 to 5
  const startX = Math.floor(Math.random() * (gridSize - mSize));
  const startZ = Math.floor(Math.random() * (gridSize - mSize));
  
  for (let x = startX; x < startX + mSize; x++) {
    for (let z = startZ; z < startZ + mSize; z++) {
      if (!riverTiles.some(rt => rt.x === x && rt.z === z)) {
        mountainTiles.push({ x, z });
      }
    }
  }

  return { riverTiles, mountainTiles };
}

const initialFeatures = generateRandomMapFeatures(GRID_SIZE);

export const initialState: GameState = {
  money: INITIAL_MONEY,
  month: INITIAL_MONTH,
  buildings: [],
  selectedBuildingType: null,
  gameOver: false, 
  messageKey: 'WELCOME_MESSAGE', 
  messagePayload: undefined,
  gridSize: GRID_SIZE,
  tileSize: TILE_SIZE,
  happiness: INITIAL_HAPPINESS,
  riverTiles: initialFeatures.riverTiles,
  mountainTiles: initialFeatures.mountainTiles,
  unbuildableTiles: [...initialFeatures.riverTiles, ...initialFeatures.mountainTiles], 
  mandateEnded: false,
  currentMandate: 1,
  mandateTargetMonth: MANDATE_DURATION_MONTHS,
  airQuality: INITIAL_AIR_QUALITY,
  waterQuality: INITIAL_WATER_QUALITY,
  biodiversity: INITIAL_BIODIVERSITY,
  electricityProduction: 0,
  electricityConsumption: 0,
  electricityCoveragePercent: 100, 
  electricityDemandSatisfaction: 100,
  isDemolishModeActive: false,
  policies: {
    commerceTaxLevel: PolicyLevel.NORMAL,
    propertyTaxLevel: PolicyLevel.NORMAL,
    greenInitiativesActive: false,
  },
  isPaused: false,
  activeEvents: [],
  trafficCongestion: 0,
  demands: [],
  timeOfDay: 0.5, // Start at noon
};

// Helper to shuffle an array
function shuffleArray<T>(array: T[]): T[] {
  const newArray = [...array]; // Create a copy to avoid mutating the original
  for (let i = newArray.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [newArray[i], newArray[j]] = [newArray[j], newArray[i]];
  }
  return newArray;
}

// Helper to get all grid positions
function getAllGridPositions(gridSize: number): GridPosition[] {
  const positions: GridPosition[] = [];
  for (let x = 0; x < gridSize; x++) {
    for (let z = 0; z < gridSize; z++) {
      positions.push({ x, z });
    }
  }
  return positions;
}

function isTileInList(position: GridPosition, tileList: GridPosition[]): boolean {
  return tileList.some(
    (tile) => tile.x === position.x && tile.z === position.z
  );
}

// New helper function to check if a position is orthogonally adjacent to a river tile
function isAdjacentToRiver(position: GridPosition, riverTiles: GridPosition[], gridSize: number): boolean {
    const { x, z } = position;
    const neighbors: GridPosition[] = [
        { x: x + 1, z },
        { x: x - 1, z },
        { x, z: z + 1 },
        { x, z: z - 1 },
    ];

    for (const neighbor of neighbors) {
        if (neighbor.x >= 0 && neighbor.x < gridSize && neighbor.z >= 0 && neighbor.z < gridSize) {
            if (isTileInList(neighbor, riverTiles)) {
                return true;
            }
        }
    }
    return false;
}


function clamp(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, value));
}

function calculateHousingCapacity(buildings: Building[]): number {
    return buildings.reduce((acc, b) => {
        const config = BUILDING_DATA[b.type];
        return acc + (config.housingProvided || 0);
    }, 0);
}

function isBuildingTypeNearby(
    position: GridPosition,
    buildings: Building[],
    gridSize: number,
    range: number,
    targetType: BuildingType
): boolean {
    for (let dx = -range; dx <= range; dx++) {
        for (let dz = -range; dz <= range; dz++) {
             // Manhattan distance check for diamond shape, or remove for square
             if (Math.abs(dx) + Math.abs(dz) > range && range > 0) continue; 
             if (dx === 0 && dz === 0 && range > 0) continue; // Don't check the tile itself if range > 0
            
            const checkX = position.x + dx;
            const checkZ = position.z + dz;

            if (checkX >= 0 && checkX < gridSize && checkZ >= 0 && checkZ < gridSize) {
                if (buildings.some(b => b.position.x === checkX && b.position.z === checkZ && b.type === targetType)) {
                    return true;
                }
            }
        }
    }
    return false;
}

// Helper function to determine the quadrant of a tile
function getQuadrantId(position: GridPosition, gridSize: number): number {
    const midX = gridSize / 2;
    const midZ = gridSize / 2;
    if (position.x < midX && position.z < midZ) return 0; // Top-Left (Q0)
    if (position.x >= midX && position.z < midZ) return 1; // Top-Right (Q1)
    if (position.x < midX && position.z >= midZ) return 2; // Bottom-Left (Q2)
    if (position.x >= midX && position.z >= midZ) return 3; // Bottom-Right (Q3)
    console.warn(`Position ${position.x},${position.z} out of quadrant bounds for grid size ${gridSize}`);
    return -1; 
}

// Helper to find empty buildable neighbors
function getEmptyNeighbors(position: GridPosition, buildings: Building[], unbuildableTiles: GridPosition[], gridSize: number): GridPosition[] {
    const { x, z } = position;
    const neighbors: GridPosition[] = [
        { x: x + 1, z },
        { x: x - 1, z },
        { x, z: z + 1 },
        { x, z: z - 1 },
    ];

    return neighbors.filter(n => 
        n.x >= 0 && n.x < gridSize && n.z >= 0 && n.z < gridSize &&
        !buildings.some(b => b.position.x === n.x && b.position.z === n.z) &&
        !unbuildableTiles.some(u => u.x === n.x && u.z === n.z)
    );
}


export function gameReducer(state: GameState, action: GameAction): GameState {
  // This block handles general game over / mandate ended states.
  // Specific actions like RESET_GAME, START_NEW_MANDATE, SET_POLICY, TOGGLE_PAUSE are allowed to proceed.
  // SET_MESSAGE actions will also proceed to the main switch statement.
  if (state.gameOver && 
      action.type !== 'RESET_GAME' && 
      action.type !== 'START_NEW_MANDATE' && 
      action.type !== 'SET_POLICY' && 
      action.type !== 'TOGGLE_PAUSE' &&
      action.type !== 'SET_MESSAGE' // Allowing SET_MESSAGE to pass through to its handler
     ) {
    if (state.mandateEnded) {
      return {...state, messageKey: 'MANDATE_COMPLETE', messagePayload: { mandateNumber: state.currentMandate, month: state.month }};
    }
    return { ...state, messageKey: 'GAME_OVER_BANKRUPT', messagePayload: {month: state.month, money: state.money } };
  }

  switch (action.type) {
    case 'TOGGLE_PAUSE': {
      if (state.gameOver || state.mandateEnded) return state; 
      const newPausedState = !state.isPaused;
      return {
        ...state,
        isPaused: newPausedState,
        messageKey: newPausedState ? 'GAME_PAUSED_MESSAGE' : 'GAME_RESUMED_MESSAGE',
        messagePayload: undefined,
      };
    }

    case 'UPDATE_TIME_OF_DAY': {
      if (state.isPaused || state.gameOver || state.mandateEnded) return state;
      return { ...state, timeOfDay: action.payload };
    }

    case 'DISMISS_DEMAND': {
      return { ...state, demands: state.demands.filter(d => d.id !== action.payload) };
    }
    case 'SELECT_BUILDING': {
      if (state.mandateEnded || state.isPaused) return state; 
      const buildingNameKey = action.payload ? `BUILDING_${action.payload}_NAME` as TranslationKeys : null;
      return { 
        ...state, 
        selectedBuildingType: action.payload, 
        isDemolishModeActive: false, 
        messageKey: action.payload ? 'BUILDING_SELECTED_MESSAGE' : 'BUILDING_SELECTION_CLEARED',
        messagePayload: action.payload && buildingNameKey ? { buildingName: buildingNameKey } : undefined,
      };
    }
    
    case 'BUILD_STRUCTURE': {
      if (state.mandateEnded || state.isPaused || state.isDemolishModeActive) return state; 
      const { type, position } = action.payload;
      const config = BUILDING_DATA[type];
      const buildingNameDisplayKey = `BUILDING_${type}_NAME` as TranslationKeys;

      const existingBuilding = state.buildings.find(
        (b) => b.position.x === position.x && b.position.z === position.z
      );

      let updatedBuildings = state.buildings;
      let buildCost = config.cost;

      if (existingBuilding) {
        // Road priority logic: Roads can overwrite other buildings
        if (type === BuildingType.ROAD && existingBuilding.type !== BuildingType.ROAD) {
          if (state.money < config.cost + DEMOLITION_COST) {
            return { ...state, messageKey: 'NOT_ENOUGH_MONEY' };
          }
          updatedBuildings = state.buildings.filter(b => b.id !== existingBuilding.id);
          buildCost = config.cost + DEMOLITION_COST;
        } else {
          return { ...state, messageKey: 'TILE_OCCUPIED_BUILDING' };
        }
      } else if (state.money < config.cost) {
        return { ...state, messageKey: 'NOT_ENOUGH_MONEY' };
      }

      if (isTileInList(position, state.mountainTiles)) {
        return { ...state, messageKey: 'CANNOT_BUILD_ON_MOUNTAIN' };
      }
      
      const isRiverTile = isTileInList(position, state.riverTiles);

      if (config.requiresRiver && !isRiverTile) {
        return { ...state, messageKey: 'BUILDING_REQUIRES_RIVER', messagePayload: { buildingName: buildingNameDisplayKey } };
      }
      if (!config.requiresRiver && isRiverTile && type !== BuildingType.ROAD) {
         return { ...state, messageKey: 'ONLY_ROADS_ON_RIVER' };
      }
      
      if (type === BuildingType.APARTMENT || type === BuildingType.HOUSE) { // Houses also auto-only
          return { ...state, messageKey: 'APARTMENTS_AUTO_ONLY'}; // Generic message can cover both
      }

      const newBuildingItem: Building = { id: uuidv4(), type, position, builtAt: Date.now() };
      const isBridge = isRiverTile && type === BuildingType.ROAD;

      return {
        ...state,
        money: state.money - buildCost,
        buildings: [...updatedBuildings, newBuildingItem],
        messageKey: 'BUILDING_BUILT',
        messagePayload: { buildingName: buildingNameDisplayKey, cost: buildCost, isBridge: isBridge ? 'true' : '' },
      };
    }
    
    case 'BATCH_BUILD_STRUCTURES': {
      if (state.mandateEnded || state.isPaused || state.isDemolishModeActive) return state;
      const { type, positions } = action.payload;
      const config = BUILDING_DATA[type];
      const buildingNameDisplayKey = `BUILDING_${type}_NAME` as TranslationKeys;

      let currentMoney = state.money;
      let currentBuildings = [...state.buildings];
      const newBuildingsBatch: Building[] = [];
      let totalBatchCost = 0;
      let bridgesBatchCount = 0;

      for (const position of positions) {
        // Find existing building at this position (either in original or already in this batch)
        const existingInOriginal = currentBuildings.find(b => b.position.x === position.x && b.position.z === position.z);
        const existingInBatch = newBuildingsBatch.find(b => b.position.x === position.x && b.position.z === position.z);
        
        let costToBuildThis = config.cost;
        let demolitionPerformed = false;

        if (existingInOriginal || existingInBatch) {
            // Road priority logic for batch placement
            if (type === BuildingType.ROAD && ((existingInOriginal && existingInOriginal.type !== BuildingType.ROAD) || (existingInBatch && existingInBatch.type !== BuildingType.ROAD))) {
                costToBuildThis += DEMOLITION_COST;
                demolitionPerformed = true;
            } else {
                continue; // Cannot overwrite or already has a road
            }
        }

        if (currentMoney < costToBuildThis) break;

        if (isTileInList(position, state.mountainTiles)) continue;

        const isRiverTile = isTileInList(position, state.riverTiles);
        if (config.requiresRiver && !isRiverTile) continue;
        if (!config.requiresRiver && isRiverTile && type !== BuildingType.ROAD) continue;

        // Perform demolition if needed
        if (demolitionPerformed) {
            currentBuildings = currentBuildings.filter(b => b.position.x !== position.x || b.position.z !== position.z);
        }

        newBuildingsBatch.push({ id: uuidv4(), type, position, builtAt: Date.now() });
        currentMoney -= costToBuildThis;
        totalBatchCost += costToBuildThis;
        if (isRiverTile && type === BuildingType.ROAD) bridgesBatchCount++;
      }

      if (newBuildingsBatch.length === 0) return state;

      return {
        ...state,
        money: currentMoney,
        buildings: [...currentBuildings, ...newBuildingsBatch],
        messageKey: 'BUILDING_BUILT',
        messagePayload: { 
          buildingName: buildingNameDisplayKey, 
          cost: totalBatchCost, 
          isBridge: bridgesBatchCount > 0 ? 'true' : '' 
        },
      };
    }

    case 'TOGGLE_DEMOLISH_MODE': {
      if (state.mandateEnded || state.isPaused) return state;
      const newDemolishModeState = !state.isDemolishModeActive;
      return {
        ...state,
        isDemolishModeActive: newDemolishModeState,
        selectedBuildingType: null, 
        messageKey: newDemolishModeState ? 'DEMOLISH_MODE_ACTIVE_INFO' : 'BUILDING_SELECTION_CLEARED',
        messagePayload: newDemolishModeState ? { cost: DEMOLITION_COST } : undefined,
      };
    }

    case 'DEMOLISH_STRUCTURE': {
      if (state.mandateEnded || state.isPaused || !state.isDemolishModeActive) return state;
      const { position } = action.payload;

      const buildingIndex = state.buildings.findIndex(
        (b) => b.position.x === position.x && b.position.z === position.z
      );

      if (buildingIndex === -1) {
        return { ...state, messageKey: 'DEMOLISH_FAILED_NO_BUILDING' };
      }

      if (state.money < DEMOLITION_COST) {
        return { ...state, messageKey: 'DEMOLISH_FAILED_NO_FUNDS', messagePayload: { cost: DEMOLITION_COST } };
      }

      const updatedBuildings = state.buildings.filter((_, index) => index !== buildingIndex);

      return {
        ...state,
        money: state.money - DEMOLITION_COST,
        buildings: updatedBuildings,
        messageKey: 'DEMOLISH_SUCCESS',
        messagePayload: { cost: DEMOLITION_COST },
      };
    }

    case 'SET_POLICY': {
      if (state.mandateEnded || state.isPaused) return state; 
      const { policy, value } = action.payload;
      return {
        ...state,
        policies: {
          ...state.policies,
          [policy]: value,
        },
         messageKey: 'POLICY_CHANGED_MESSAGE', 
         messagePayload: { policyName: `POLICY_NAME_${policy.toUpperCase()}` as TranslationKeys, policyValue: String(value) }
      };
    }

    case 'ADVANCE_MONTH': {
      if (state.isPaused || state.mandateEnded || state.gameOver) return state; 

      let currentMoney = state.money;
      const happinessAtStartOfMonth = state.happiness; 
      let autoBuildMessageKey: TranslationKeys | null = null;

      let incomeThisMonth = 0;
      let maintenanceThisMonth = 0;
      let parksCount = 0;
      let powerPlantsCount = 0; 
      let marketCount = 0;
      let schoolCount = 0;
      let healthPostCount = 0;
      let totalResidentialCountAtStartOfMonth = 0;
      let residentialPerQuadrantAtStartOfMonth = [0, 0, 0, 0]; 
      
      let totalElectricityProduction = 0;
      let totalElectricityConsumption = 0;
      let airQualityModifier = 0;
      let waterQualityModifier = 0;
      let biodiversityModifier = 0;
      let happinessFromPolicies = 0;

      if (state.policies.greenInitiativesActive) {
        currentMoney -= GREEN_INITIATIVES_MONTHLY_COST;
        happinessFromPolicies += GREEN_INITIATIVES_HAPPINESS_BONUS;
      }
      happinessFromPolicies += COMMERCE_TAX_CONFIG[state.policies.commerceTaxLevel].happinessEffect;
      happinessFromPolicies += PROPERTY_TAX_CONFIG[state.policies.propertyTaxLevel].happinessEffect;

      state.buildings.forEach((building) => {
        const config = BUILDING_DATA[building.type];
        if (building.type === BuildingType.PARK) {
            parksCount++;
            if (isAdjacentToRiver(building.position, state.riverTiles, state.gridSize)) {
                waterQualityModifier += PARK_RIVER_WATER_QUALITY_BONUS_MONTHLY;
            }
        }
        if (building.type === BuildingType.MARKET) marketCount++;
        if (building.type === BuildingType.SCHOOL) schoolCount++;
        if (building.type === BuildingType.HEALTH_POST) healthPostCount++;
        if (building.type === BuildingType.POWER_PLANT || building.type === BuildingType.SOLAR_POWER_PLANT || building.type === BuildingType.HYDRO_POWER_PLANT) {
            powerPlantsCount++;
        }
        if (building.type === BuildingType.HOUSE || building.type === BuildingType.APARTMENT) {
            totalResidentialCountAtStartOfMonth++;
            const qId = getQuadrantId(building.position, state.gridSize);
            if (qId !== -1) residentialPerQuadrantAtStartOfMonth[qId]++;
        }
        
        let currentBuildingIncome = config.income || 0;
        if (building.type === BuildingType.MARKET && powerPlantsCount > 0) {
            currentBuildingIncome *= MARKET_INCOME_POWER_BOOST_FACTOR;
        }
        if (building.type === BuildingType.MARKET) {
            currentBuildingIncome *= COMMERCE_TAX_CONFIG[state.policies.commerceTaxLevel].incomeModifier;
        }
        incomeThisMonth += currentBuildingIncome;

        if ((building.type === BuildingType.HOUSE || building.type === BuildingType.APARTMENT) && config.income) {
            const propertyTaxAmount = config.income * (PROPERTY_TAX_CONFIG[state.policies.propertyTaxLevel].ratePercent / 100);
            incomeThisMonth += propertyTaxAmount;
        }

        let currentBuildingMaintenance = config.maintenance || 0;
        if (building.type === BuildingType.PARK && state.policies.greenInitiativesActive) {
            currentBuildingMaintenance *= GREEN_INITIATIVES_PARK_MAINTENANCE_MODIFIER;
        }
        maintenanceThisMonth += currentBuildingMaintenance;

        let currentBuildingElecProduction = config.electricityProduction || 0;
        if ((building.type === BuildingType.SOLAR_POWER_PLANT || building.type === BuildingType.HYDRO_POWER_PLANT) && state.policies.greenInitiativesActive) {
            currentBuildingElecProduction *= GREEN_INITIATIVES_GREEN_ENERGY_PRODUCTION_MODIFIER;
        }
        totalElectricityProduction += currentBuildingElecProduction;

        if (config.electricityConsumption) totalElectricityConsumption += config.electricityConsumption;
        if (config.airQualityEffectMonthly) airQualityModifier += config.airQualityEffectMonthly;
        if (config.waterQualityEffectMonthly) waterQualityModifier += config.waterQualityEffectMonthly;
        if (config.biodiversityEffectMonthly) biodiversityModifier += config.biodiversityEffectMonthly;
      });
      
      const housingCapacityAtStartOfMonth = calculateHousingCapacity(state.buildings);
      const currentPopulation = housingCapacityAtStartOfMonth; // Population is now equivalent to housing capacity

      const newAirQuality = clamp(state.airQuality + airQualityModifier, ENV_METRIC_MIN_CAP, ENV_METRIC_MAX_CAP);
      const newWaterQuality = clamp(state.waterQuality + waterQualityModifier, ENV_METRIC_MIN_CAP, ENV_METRIC_MAX_CAP);
      const newBiodiversity = clamp(state.biodiversity + biodiversityModifier, ENV_METRIC_MIN_CAP, ENV_METRIC_MAX_CAP);
      
      let newCalculatedHappiness = 55 + happinessFromPolicies; 
      newCalculatedHappiness += Math.min(parksCount * HAPPINESS_PER_PARK_MONTHLY, MAX_HAPPINESS_FROM_PARKS);
      
      let happinessFromServices = 0;
      state.buildings.forEach(b => {
        const bConfig = BUILDING_DATA[b.type];
        if(bConfig.happinessEffectMonthly) happinessFromServices += bConfig.happinessEffectMonthly;
      });
      newCalculatedHappiness += Math.min(happinessFromServices, MAX_HAPPINESS_FROM_PUBLIC_SERVICES);
            
      if (parksCount === 0 && currentPopulation >= MIN_POP_FOR_NO_PARK_PENALTY) {
          newCalculatedHappiness += HAPPINESS_PENALTY_NO_PARKS_HIGH_POP_MONTHLY;
      }

      // --- Events & Traffic Logic ---
      let currentActiveEvents = (state.activeEvents || [])
        .map(e => ({ ...e, remainingMonths: e.remainingMonths - 1 }))
        .filter(e => e.remainingMonths > 0);
      
      let newTrafficCongestion = 0; // Traffic system deactivated
      
      if (currentActiveEvents.length < 2 && Math.random() < 0.15) {
          const possibleNewEvents: {type: GameEvent, chance: number, condition: boolean}[] = [
              { type: GameEvent.HEALTH_PROTEST, chance: 0.3, condition: happinessAtStartOfMonth < 45 },
              { type: GameEvent.POWER_OUTAGE, chance: 0.4, condition: state.electricityCoveragePercent < 90 },
              { type: GameEvent.ECONOMY_BOOM, chance: 0.2, condition: happinessAtStartOfMonth > 75 },
              { type: GameEvent.PARK_FESTIVAL, chance: 0.3, condition: parksCount > 2 },
          ];
          
          const triggered = possibleNewEvents.find(e => e.condition && Math.random() < e.chance && !currentActiveEvents.some(ae => ae.type === e.type));
          if (triggered) {
              currentActiveEvents.push({ type: triggered.type, remainingMonths: 3 });
              autoBuildMessageKey = `EVENT_${triggered.type}_STARTED` as TranslationKeys;
          }
      }
      
      currentActiveEvents.forEach(event => {
          switch(event.type) {
              case GameEvent.HEALTH_PROTEST:
                  newCalculatedHappiness -= 15;
                  incomeThisMonth *= 0.8;
                  break;
              case GameEvent.POWER_OUTAGE:
                  newCalculatedHappiness -= 20;
                  incomeThisMonth *= 0.5;
                  break;
              case GameEvent.ECONOMY_BOOM:
                  incomeThisMonth *= 1.3;
                  currentMoney += 500;
                  break;
              case GameEvent.PARK_FESTIVAL:
                  newCalculatedHappiness += 10;
                  currentMoney -= 200;
                  break;
          }
      });
      
      currentMoney += incomeThisMonth;
      currentMoney -= maintenanceThisMonth;

      // --- Citizen Demands Logic (DEACTIVATED) ---
      let currentDemands: CitizenDemand[] = []; // Clear all demands
      
      /* Generation logic removed per user request */
      
      // --- Auto-Housing & Commerce Development Logic ---
      let buildingsForNextMonth = [...state.buildings];
      let moneyAfterAutoBuild = currentMoney;
      
      const electricityCoveragePercent = totalElectricityConsumption > 0 ? (totalElectricityProduction / totalElectricityConsumption) * 100 : 100;
      const allPossibleTiles = getAllGridPositions(state.gridSize);
      const buildableTiles = allPossibleTiles.filter(tile => {
          const isOccupied = buildingsForNextMonth.some(b => b.position.x === tile.x && b.position.z === tile.z);
          const isUnbuildableNatural = isTileInList(tile, state.unbuildableTiles);
          return !isOccupied && !isUnbuildableNatural;
      });

      let currentHousingCapacityForSpawnConsideration = calculateHousingCapacity(buildingsForNextMonth);
      let currentResidentialPerQuadrant = [...residentialPerQuadrantAtStartOfMonth];
      
      let housesSpawnedThisMonthCount = 0;
      let apartmentsSpawnedOnEmptyLotsCount = 0;
      let apartmentsConvertedFromHousesCount = 0;
      let autoBuildMessagePayload: Record<string, string | number> | undefined = undefined;
      
      // Happiness before considering electricity penalty for spawn checks
      const happinessForSpawningConsideration = clamp(Math.round(newCalculatedHappiness), HAPPINESS_MIN_CAP, HAPPINESS_MAX_CAP); 

      let noMoreSpaceForNewResidences = false; 
      if (happinessForSpawningConsideration >= Math.min(MIN_HAPPINESS_FOR_HOUSE_SPAWN, MIN_HAPPINESS_FOR_APARTMENT_SPAWN)) {
          let potentialResidentialSpotsFound = false;
          // Determine max remote houses based on probability for this check
          let maxRemoteForSpaceCheck = 0;
          if (MAX_REMOTE_HOUSES_ALLOWED_PER_MONTH > 0 && Math.random() < MAX_REMOTE_HOUSES_ALLOWED_PER_MONTH) {
            maxRemoteForSpaceCheck = 1;
          }

          for (const tile of shuffleArray([...allPossibleTiles])) {
              const isOccupied = buildingsForNextMonth.some(b => b.position.x === tile.x && b.position.z === tile.z);
              const isUnbuildableNatural = isTileInList(tile, state.unbuildableTiles);
              
              if (!isOccupied && !isUnbuildableNatural) {
                  // Check for house potential
                  const hasRoadAccess = isBuildingTypeNearby(tile, buildingsForNextMonth, state.gridSize, ROAD_PROXIMITY_FOR_HOUSING, BuildingType.ROAD);
                  if (hasRoadAccess || maxRemoteForSpaceCheck > 0) { // Use the probabilistically determined allowance
                      potentialResidentialSpotsFound = true;
                      break;
                  }
                  // Check for apartment potential (if unlocked and conditions met)
                  if (state.currentMandate >= APARTMENT_UNLOCK_MANDATE && 
                      isBuildingTypeNearby(tile, buildingsForNextMonth, state.gridSize, ROAD_PROXIMITY_FOR_HOUSING, BuildingType.ROAD) &&
                      isBuildingTypeNearby(tile, buildingsForNextMonth, state.gridSize, MIN_MARKET_PROXIMITY_FOR_APARTMENT, BuildingType.MARKET) &&
                      isBuildingTypeNearby(tile, buildingsForNextMonth, state.gridSize, MIN_SCHOOL_PROXIMITY_FOR_APARTMENT, BuildingType.SCHOOL) ) {
                      potentialResidentialSpotsFound = true;
                      break;
                  }
              }
          }
          if (!potentialResidentialSpotsFound) {
              noMoreSpaceForNewResidences = true;
          }
      }
      
      const electricityDemandSatisfaction = clamp(electricityCoveragePercent, 0, 100);

      if (electricityCoveragePercent < MIN_ELECTRICITY_COVERAGE_FOR_NO_PENALTY * 100 && totalElectricityConsumption > 0) {
        newCalculatedHappiness += HAPPINESS_PENALTY_LOW_ELECTRICITY_MONTHLY;
      }
      
      const happinessForSpawning = clamp(Math.round(newCalculatedHappiness), HAPPINESS_MIN_CAP, HAPPINESS_MAX_CAP);
      
      let dynamicMaxHousesThisMonth = BASE_HOUSES_SPAWN_PER_MONTH;
      dynamicMaxHousesThisMonth += Math.min(marketCount * MARKET_SPAWN_BONUS_PER_MARKET, MAX_SPAWN_BONUS_FROM_MARKETS);
      dynamicMaxHousesThisMonth += Math.min(schoolCount * SCHOOL_SPAWN_BONUS_PER_SCHOOL, MAX_SPAWN_BONUS_FROM_SCHOOLS);
      if (electricityCoveragePercent >= MIN_ELECTRICITY_COVERAGE_FOR_NO_PENALTY * 100) {
        dynamicMaxHousesThisMonth += ELECTRICITY_SPAWN_BONUS_IF_COVERED;
      }
      dynamicMaxHousesThisMonth = Math.min(dynamicMaxHousesThisMonth, OVERALL_MAX_HOUSES_SPAWN_PER_MONTH);

      // Determine if a remote house spawn attempt is allowed this month based on probability
      let allowedRemoteSpawnsThisMonth = 0;
      if (MAX_REMOTE_HOUSES_ALLOWED_PER_MONTH > 0 && Math.random() < MAX_REMOTE_HOUSES_ALLOWED_PER_MONTH) {
          allowedRemoteSpawnsThisMonth = 1; // Allow up to 1 remote house if probability check passes
      }
      let remoteHousesSpawnedThisAttemptCycle = 0; 

      if (happinessForSpawning >= MIN_HAPPINESS_FOR_HOUSE_SPAWN) {
        let housesToAttemptThisMonth = dynamicMaxHousesThisMonth;
        
        // Tiered logic: Infrastructure Priority vs Budget Expansion
        const roadAccessTiles = buildableTiles.filter(tile => 
          isBuildingTypeNearby(tile, buildingsForNextMonth, state.gridSize, ROAD_PROXIMITY_FOR_HOUSING, BuildingType.ROAD)
        );
        
        // Define what counts as infrastructure for "premium" spots
        const serviceTypes = [BuildingType.SCHOOL, BuildingType.HEALTH_POST, BuildingType.POLICE_STATION, BuildingType.PARK, BuildingType.MARKET];
        
        const tier1Premium = roadAccessTiles.filter(tile => 
          serviceTypes.some(type => isBuildingTypeNearby(tile, buildingsForNextMonth, state.gridSize, SERVICE_PROXIMITY_FOR_HOUSING, type))
        );
        
        const tier2Standard = roadAccessTiles.filter(tile => !tier1Premium.includes(tile));
        
        const tier3Budget = buildableTiles.filter(tile => !roadAccessTiles.includes(tile));

        const shuffledTier1 = shuffleArray(tier1Premium);
        const shuffledTier2 = shuffleArray(tier2Standard);
        const shuffledTier3 = shuffleArray(tier3Budget);

        for (let i = 0; i < housesToAttemptThisMonth; i++) {
          const roll = Math.random();
          let selectedTile: GridPosition | null = null;
          let isFromRoadAccess = false;

          // Probabilistic selection to simulate economic variety
          // ~60% Premium (infra), ~30% Standard (road only), ~10% Budget (remote)
          if (roll < 0.6 && shuffledTier1.length > 0) {
            selectedTile = shuffledTier1.pop() || null;
            isFromRoadAccess = true;
          } else if (roll < 0.9 && shuffledTier2.length > 0) {
            selectedTile = shuffledTier2.pop() || null;
            isFromRoadAccess = true;
          } else if (shuffledTier3.length > 0) {
            selectedTile = shuffledTier3.pop() || null;
            isFromRoadAccess = false;
          } else {
            // Fallbacks if rolled tier is empty
            selectedTile = shuffledTier1.pop() || shuffledTier2.pop() || shuffledTier3.pop() || null;
            if (selectedTile) {
              isFromRoadAccess = tier1Premium.includes(selectedTile) || tier2Standard.includes(selectedTile);
            }
          }

          if (selectedTile) {
            // Re-verify occupancy against buildings added during this monthly sweep
            const stillEmpty = !buildingsForNextMonth.some(b => b.position.x === selectedTile!.x && b.position.z === selectedTile!.z);
            if (!stillEmpty) continue;

            // Final remote check using allowance logic
            if (!isFromRoadAccess && remoteHousesSpawnedThisAttemptCycle >= allowedRemoteSpawnsThisMonth) {
              continue; 
            }

            const newHouse: Building = { id: uuidv4(), type: BuildingType.HOUSE, position: selectedTile, builtAt: Date.now() };
            buildingsForNextMonth.push(newHouse);
            currentHousingCapacityForSpawnConsideration += PEOPLE_PER_HOUSE; 
            housesSpawnedThisMonthCount++;
            
            const qId = getQuadrantId(selectedTile, state.gridSize);
            if (qId !== -1) currentResidentialPerQuadrant[qId]++;

            if (!isFromRoadAccess) {
              remoteHousesSpawnedThisAttemptCycle++;
            }
          }
        }
      }
      
      // Auto-Apartment Spawning on Empty Lots
      if (state.currentMandate >= APARTMENT_UNLOCK_MANDATE &&
          happinessForSpawning >= MIN_HAPPINESS_FOR_APARTMENT_SPAWN 
         ) {
        let apartmentsToAttemptThisMonth = MAX_APARTMENTS_SPAWN_PER_MONTH; 
        
        // Filter candidate tiles that satisfy all proximities
        const candidateApartmentTiles = buildableTiles.filter(tile => {
            const isOccupied = buildingsForNextMonth.some(b => b.position.x === tile.x && b.position.z === tile.z);
            return !isOccupied &&
                   isBuildingTypeNearby(tile, buildingsForNextMonth, state.gridSize, ROAD_PROXIMITY_FOR_HOUSING, BuildingType.ROAD) &&
                   isBuildingTypeNearby(tile, buildingsForNextMonth, state.gridSize, MIN_MARKET_PROXIMITY_FOR_APARTMENT, BuildingType.MARKET) &&
                   isBuildingTypeNearby(tile, buildingsForNextMonth, state.gridSize, MIN_SCHOOL_PROXIMITY_FOR_APARTMENT, BuildingType.SCHOOL);
        });

        for (const tile of shuffleArray(candidateApartmentTiles)) { 
          if (apartmentsToAttemptThisMonth <= 0) break;
          
          const quadrantIdOfTile = getQuadrantId(tile, state.gridSize);
          if (quadrantIdOfTile !== -1 && currentResidentialPerQuadrant[quadrantIdOfTile] >= MIN_HOUSES_PER_QUADRANT_FOR_APARTMENT) {
              const newApartment: Building = { id: uuidv4(), type: BuildingType.APARTMENT, position: tile, builtAt: Date.now() };
              buildingsForNextMonth.push(newApartment);
              currentHousingCapacityForSpawnConsideration += PEOPLE_PER_APARTMENT; 
              apartmentsSpawnedOnEmptyLotsCount++;
              apartmentsToAttemptThisMonth--;
          }
        }
      }
      
      const canConsiderConversionDueToHappinessOrNoSpace = 
          happinessForSpawning >= MIN_HAPPINESS_FOR_APARTMENT_SPAWN ||
          (noMoreSpaceForNewResidences && happinessForSpawning >= (MIN_HAPPINESS_FOR_HOUSE_SPAWN - 5));


      if (state.currentMandate >= APARTMENT_UNLOCK_MANDATE &&
          canConsiderConversionDueToHappinessOrNoSpace &&
          moneyAfterAutoBuild >= BUILDING_DATA[BuildingType.APARTMENT].cost 
          ) {
          let conversionsAttemptedThisMonth = 0;
          const shuffledQuadrantIds = shuffleArray([0, 1, 2, 3]);

          for (const quadrantId of shuffledQuadrantIds) {
              if (conversionsAttemptedThisMonth >= MAX_APARTMENT_CONVERSIONS_PER_MONTH) break;

              if (currentResidentialPerQuadrant[quadrantId] >= MIN_HOUSES_IN_QUADRANT_FOR_CONVERSION) {
                  const housesInQuadrant = buildingsForNextMonth.filter(
                      b => b.type === BuildingType.HOUSE && getQuadrantId(b.position, state.gridSize) === quadrantId
                  );

                  if (housesInQuadrant.length >= HOUSES_TO_CONVERT_TO_APARTMENT) {
                      const selectedHousesForConversion = shuffleArray(housesInQuadrant).slice(0, HOUSES_TO_CONVERT_TO_APARTMENT);
                      const potentialApartmentSite = selectedHousesForConversion[0].position; 

                      const siteSuitableForApartment = 
                          isBuildingTypeNearby(potentialApartmentSite, buildingsForNextMonth, state.gridSize, ROAD_PROXIMITY_FOR_HOUSING, BuildingType.ROAD) &&
                          isBuildingTypeNearby(potentialApartmentSite, buildingsForNextMonth, state.gridSize, MIN_MARKET_PROXIMITY_FOR_APARTMENT, BuildingType.MARKET) &&
                          isBuildingTypeNearby(potentialApartmentSite, buildingsForNextMonth, state.gridSize, MIN_SCHOOL_PROXIMITY_FOR_APARTMENT, BuildingType.SCHOOL);

                      if (siteSuitableForApartment) {
                          const houseIdsToRemove = new Set(selectedHousesForConversion.map(h => h.id));
                          buildingsForNextMonth = buildingsForNextMonth.filter(b => !houseIdsToRemove.has(b.id));
                          
                          const newApartment: Building = { id: uuidv4(), type: BuildingType.APARTMENT, position: potentialApartmentSite, builtAt: Date.now() };
                          buildingsForNextMonth.push(newApartment);

                          currentHousingCapacityForSpawnConsideration -= (PEOPLE_PER_HOUSE * HOUSES_TO_CONVERT_TO_APARTMENT);
                          currentHousingCapacityForSpawnConsideration += PEOPLE_PER_APARTMENT;
                          
                          currentResidentialPerQuadrant[quadrantId] -= HOUSES_TO_CONVERT_TO_APARTMENT;
                          apartmentsConvertedFromHousesCount++;
                          conversionsAttemptedThisMonth++;
                      }
                  }
              }
          }
      }
      
      let happinessChangeMessageKey: TranslationKeys | null = null;
      
      if (happinessForSpawning < happinessAtStartOfMonth) {
        const electricityShortageActive = electricityCoveragePercent < MIN_ELECTRICITY_COVERAGE_FOR_NO_PENALTY * 100 && totalElectricityConsumption > 0;
        const noParksPenaltyActive = parksCount === 0 && currentPopulation >= MIN_POP_FOR_NO_PARK_PENALTY;
        const highCommerceTaxPenaltyActive = COMMERCE_TAX_CONFIG[state.policies.commerceTaxLevel].happinessEffect < 0;
        const highPropertyTaxPenaltyActive = PROPERTY_TAX_CONFIG[state.policies.propertyTaxLevel].happinessEffect < 0;

        if (electricityShortageActive) {
            happinessChangeMessageKey = 'HAPPINESS_DROP_LOW_ELECTRICITY';
        } else if (noParksPenaltyActive) {
            happinessChangeMessageKey = 'HAPPINESS_DROP_NO_PARKS';
        } else if (highPropertyTaxPenaltyActive) {
            happinessChangeMessageKey = 'HAPPINESS_DROP_HIGH_PROPERTY_TAX';
        } else if (highCommerceTaxPenaltyActive) {
            happinessChangeMessageKey = 'HAPPINESS_DROP_HIGH_COMMERCE_TAX';
        } else {
            happinessChangeMessageKey = 'HAPPINESS_DROP_GENERIC';
        }
      }

      if (apartmentsConvertedFromHousesCount > 0) {
        if (noMoreSpaceForNewResidences) { 
             autoBuildMessageKey = 'AUTO_APARTMENT_CONVERSION_NO_SPACE_MESSAGE';
        } else {
            autoBuildMessageKey = 'AUTO_APARTMENT_CONVERSION_MESSAGE';
        }
        autoBuildMessagePayload = { count: apartmentsConvertedFromHousesCount };
      } else if (apartmentsSpawnedOnEmptyLotsCount > 0) {
        autoBuildMessageKey = 'AUTO_APARTMENTS_SPAWNED_MESSAGE';
        autoBuildMessagePayload = { count: apartmentsSpawnedOnEmptyLotsCount };
      } else if (housesSpawnedThisMonthCount > 0) {
        autoBuildMessageKey = 'AUTO_HOUSES_SPAWNED_MESSAGE';
        autoBuildMessagePayload = { count: housesSpawnedThisMonthCount };
      }
      
      const nextMonth = state.month + 1;
      
      let finalMessageKeyToSet: TranslationKeys | null = null;
      let finalMessagePayloadToSet: Record<string, string | number> | undefined = undefined;

      if (happinessChangeMessageKey) {
        finalMessageKeyToSet = happinessChangeMessageKey;
      } else if (autoBuildMessageKey) {
        finalMessageKeyToSet = autoBuildMessageKey;
        finalMessagePayloadToSet = autoBuildMessagePayload;
      } else if (state.messageKey === 'POLICY_CHANGED_MESSAGE') {
         finalMessageKeyToSet = 'POLICY_EFFECTS_APPLY_NEXT_MONTH'; 
      } else if (state.messageKey === 'GAME_PAUSED_MESSAGE' || state.messageKey === 'GAME_RESUMED_MESSAGE') {
        finalMessageKeyToSet = state.messageKey;
        finalMessagePayloadToSet = state.messagePayload;
      }
      
      if (moneyAfterAutoBuild < 0) {
        return {
          ...state,
          money: moneyAfterAutoBuild,
          month: nextMonth,
          buildings: buildingsForNextMonth, 
          gameOver: true, 
          mandateEnded: false, 
          messageKey: 'GAME_OVER_BANKRUPT', 
          messagePayload: { month: nextMonth, money: moneyAfterAutoBuild },
          selectedBuildingType: null,
          happiness: happinessForSpawning, 
          airQuality: newAirQuality, waterQuality: newWaterQuality, biodiversity: newBiodiversity,
          electricityProduction: totalElectricityProduction, electricityConsumption: totalElectricityConsumption,
          electricityCoveragePercent: electricityCoveragePercent, electricityDemandSatisfaction,
          isDemolishModeActive: false, 
          isPaused: state.isPaused,
          activeEvents: currentActiveEvents,
          trafficCongestion: newTrafficCongestion
        };
      }

      if (nextMonth > state.mandateTargetMonth) { 
        return {
          ...state,
          money: moneyAfterAutoBuild,
          month: nextMonth -1, 
          buildings: buildingsForNextMonth,
          gameOver: true, 
          mandateEnded: true,
          messageKey: 'MANDATE_COMPLETE', 
          messagePayload: { mandateNumber: state.currentMandate, month: nextMonth -1 },
          selectedBuildingType: null,
          happiness: happinessForSpawning, 
          airQuality: newAirQuality, waterQuality: newWaterQuality, biodiversity: newBiodiversity,
          electricityProduction: totalElectricityProduction, electricityConsumption: totalElectricityConsumption,
          electricityCoveragePercent: electricityCoveragePercent, electricityDemandSatisfaction,
          isDemolishModeActive: false, 
          isPaused: state.isPaused,
          activeEvents: currentActiveEvents,
          trafficCongestion: newTrafficCongestion
        };
      }

      return {
        ...state,
        money: moneyAfterAutoBuild,
        month: nextMonth,
        buildings: buildingsForNextMonth,
        happiness: happinessForSpawning, 
        messageKey: finalMessageKeyToSet, 
        messagePayload: finalMessagePayloadToSet,
        airQuality: newAirQuality, waterQuality: newWaterQuality, biodiversity: newBiodiversity,
        electricityProduction: totalElectricityProduction, electricityConsumption: totalElectricityConsumption,
        electricityCoveragePercent: electricityCoveragePercent, electricityDemandSatisfaction,
        activeEvents: currentActiveEvents,
        trafficCongestion: newTrafficCongestion,
        demands: currentDemands
      };
    }
    
    case 'START_NEW_MANDATE': {
      if (!state.mandateEnded) return state; 
      const nextMandateNumber = state.currentMandate + 1;
      let msgKey: TranslationKeys = 'START_NEW_MANDATE_MESSAGE';
      if (nextMandateNumber >= APARTMENT_UNLOCK_MANDATE && state.currentMandate < APARTMENT_UNLOCK_MANDATE) {
         msgKey = 'START_NEW_MANDATE_APARTMENTS_UNLOCKED';
      }

      return {
        ...state,
        gameOver: false, 
        mandateEnded: false,
        currentMandate: nextMandateNumber,
        mandateTargetMonth: state.month + MANDATE_DURATION_MONTHS, 
        messageKey: msgKey,
        messagePayload: { mandateNumber: nextMandateNumber },
        isDemolishModeActive: false, 
        isPaused: false, 
      };
    }

    case 'SET_MESSAGE':
      return { ...state, messageKey: action.payload.key, messagePayload: action.payload.msgPayload };

    case 'RESET_GAME': {
      const newFeatures = generateRandomMapFeatures(GRID_SIZE);
      const newInitialState = { 
        ...initialState,
        riverTiles: newFeatures.riverTiles,
        mountainTiles: newFeatures.mountainTiles,
        unbuildableTiles: [...newFeatures.riverTiles, ...newFeatures.mountainTiles],
        policies: { 
          commerceTaxLevel: PolicyLevel.NORMAL,
          propertyTaxLevel: PolicyLevel.NORMAL,
          greenInitiativesActive: false,
        },
        messageKey: 'GAME_RESET_MESSAGE' as TranslationKeys,
        isPaused: false,
      };
      return newInitialState;
    }
      
    default:
      return state;
  }
}
