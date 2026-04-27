
import { en } from './locales/en'; // Import for TranslationKeys

export type TranslationKeys = keyof typeof en; // Central definition of TranslationKeys

export enum BuildingType {
  ROAD = 'ROAD', // Unified road type
  HOUSE = 'HOUSE',
  MARKET = 'MARKET',
  PARK = 'PARK',
  POWER_PLANT = 'POWER_PLANT', // Assumed to be fossil fuel / thermal
  APARTMENT = 'APARTMENT', 
  SCHOOL = 'SCHOOL', 
  HEALTH_POST = 'HEALTH_POST', 
  POLICE_STATION = 'POLICE_STATION', 
  SOLAR_POWER_PLANT = 'SOLAR_POWER_PLANT', 
  HYDRO_POWER_PLANT = 'HYDRO_POWER_PLANT', 
  WATER_TREATMENT_PLANT = 'WATER_TREATMENT_PLANT', // New
  TECH_INDUSTRY = 'TECH_INDUSTRY',
  HEAVY_INDUSTRY = 'HEAVY_INDUSTRY',
}

export interface GridPosition {
  x: number;
  z: number;
}

export interface Building {
  id: string; 
  type: BuildingType;
  position: GridPosition;
  builtAt?: number; // Timestamp for build animation
}

export enum PolicyLevel {
  LOW = 'LOW',
  NORMAL = 'NORMAL',
  HIGH = 'HIGH',
}

export interface PoliciesState {
  commerceTaxLevel: PolicyLevel;
  propertyTaxLevel: PolicyLevel;
  greenInitiativesActive: boolean;
}

export enum GameEvent {
  TRAFFIC_JAM = 'TRAFFIC_JAM',
  HEALTH_PROTEST = 'HEALTH_PROTEST',
  POWER_OUTAGE = 'POWER_OUTAGE',
  ECONOMY_BOOM = 'ECONOMY_BOOM',
  PARK_FESTIVAL = 'PARK_FESTIVAL',
}

export interface ActiveEvent {
  type: GameEvent;
  remainingMonths: number;
}

export interface GameState {
  money: number;
  month: number;
  buildings: Building[];
  selectedBuildingType: BuildingType | null;
  gameOver: boolean; 
  
  messageKey: TranslationKeys | null; 
  messagePayload?: Record<string, string | number>; 

  activeEvents: ActiveEvent[];
  trafficCongestion: number; // Overall city congestion (0-100)

  gridSize: number; 
  tileSize: number;
  happiness: number; 
  riverTiles: GridPosition[];
  mountainTiles: GridPosition[];
  unbuildableTiles: GridPosition[]; 
  
  mandateEnded: boolean; 
  currentMandate: number; 
  mandateTargetMonth: number; 

  // Environmental Metrics
  airQuality: number; // 0-100 (100 = best)
  waterQuality: number; // 0-100 (100 = best)
  biodiversity: number; // 0-100 (100 = best)
  
  // Electricity Metrics
  electricityProduction: number; // Total MW produced
  electricityConsumption: number; // Total MW consumed
  electricityCoveragePercent: number; // (production / consumption) * 100, capped at 100+
  electricityDemandSatisfaction: number; // 0-100, how well demand is met, affects happiness

  // Demolition Mode
  isDemolishModeActive: boolean;

  // Policies
  policies: PoliciesState;

  // Demand State (DEACTIVATED)
  demands: CitizenDemand[];

  // Game Speed / Flow
  isPaused: boolean;

  // Time of Day (0 to 1, where 0 is start of day, 0.5 is noon, 1.0 is end of day)
  timeOfDay: number; 
}

export interface CitizenDemand {
  id: string;
  type: 'HEALTH' | 'EDUCATION' | 'SECURITY' | 'PARK' | 'ELECTRICITY' | 'MARKET';
  position: GridPosition;
  message: string;
  createdAt: number; // Month index when it appeared
}

export interface BuildingData {
  cost: number;
  income?: number; 
  maintenance?: number; 
  housingProvided?: number; 
  happinessEffectMonthly?: number; 
  
  // Environmental Effects & Electricity
  electricityConsumption?: number; // MW consumed
  electricityProduction?: number; // MW produced
  airQualityEffectMonthly?: number; // Change per month
  waterQualityEffectMonthly?: number; // Change per month
  biodiversityEffectMonthly?: number; // Change per month
  requiresRiver?: boolean; // True if must be built on a river tile
  capacity?: number; // General capacity value
  capacityUnit?: string; // Unit for the capacity (e.g., "Citizens", "MW")
}

export type BuildingConfig = {
  [key in BuildingType]: BuildingData;
};

export type GameAction =
  | { type: 'SELECT_BUILDING'; payload: BuildingType | null }
  | { type: 'BUILD_STRUCTURE'; payload: { type: BuildingType; position: GridPosition } }
  | { type: 'BATCH_BUILD_STRUCTURES'; payload: { type: BuildingType; positions: GridPosition[] } }
  | { type: 'ADVANCE_MONTH' }
  | { type: 'SET_MESSAGE'; payload: { key: TranslationKeys | null; msgPayload?: Record<string, string | number> } }
  | { type: 'RESET_GAME' }
  | { type: 'START_NEW_MANDATE' }
  | { type: 'TOGGLE_DEMOLISH_MODE' }
  | { type: 'DEMOLISH_STRUCTURE'; payload: { position: GridPosition } }
  | { type: 'SET_POLICY'; payload: { policy: keyof PoliciesState; value: PolicyLevel | boolean } }
  | { type: 'TOGGLE_PAUSE' }
  | { type: 'UPDATE_TIME_OF_DAY'; payload: number }
  | { type: 'DISMISS_DEMAND'; payload: string };

export interface GameContextType extends GameState {
  dispatch: React.Dispatch<GameAction>;
  canAfford: (cost: number) => boolean;
  isOccupied: (position: GridPosition) => boolean; // Checks only for existing buildings
  getBuildingAt: (position: GridPosition) => Building | undefined;
}