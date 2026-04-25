
import { GridPosition, PolicyLevel } from "../types";

export const INITIAL_MONEY = 10000;
export const INITIAL_MONTH = 1;
export const GRID_SIZE = 30; 
export const TILE_SIZE = 2; 
export const PLANE_SIZE = GRID_SIZE * TILE_SIZE; 

export const CAMERA_POSITION: [number, number, number] = [0, PLANE_SIZE * 0.6, PLANE_SIZE * 0.6]; 
export const CAMERA_FOV = 50;

export const MONTH_ADVANCE_INTERVAL = 10000; 
export const PEOPLE_PER_HOUSE = 4;
export const PEOPLE_PER_APARTMENT = 24;

export const MANDATE_DURATION_MONTHS = 60; 
export const MARKET_INCOME_POWER_BOOST_FACTOR = 1.5; 

// Happiness settings
export const INITIAL_HAPPINESS = 75; 
export const HAPPINESS_MIN_CAP = 0;
export const HAPPINESS_MAX_CAP = 100;
export const HAPPINESS_PER_PARK_MONTHLY = 2; 
export const MAX_HAPPINESS_FROM_PARKS = 30; 
export const HAPPINESS_PER_SCHOOL_MONTHLY = 1;
export const HAPPINESS_PER_HEALTH_POST_MONTHLY = 1;
export const HAPPINESS_PER_POLICE_STATION_MONTHLY = 1;
export const MAX_HAPPINESS_FROM_PUBLIC_SERVICES = 20;
export const HAPPINESS_PENALTY_NO_PARKS_HIGH_POP_MONTHLY = -3; 
export const MIN_POP_FOR_NO_PARK_PENALTY = 20; 
// export const HAPPINESS_PENALTY_UNMET_HOUSING_MONTHLY = -1; // Removed
export const HAPPINESS_PENALTY_LOW_ELECTRICITY_MONTHLY = -2; 
export const MIN_ELECTRICITY_COVERAGE_FOR_NO_PENALTY = 0.8; 

// Desired Population (Housing Demand) - Removed
// export const INITIAL_DESIRED_POPULATION = 10; 
// export const DESIRED_POPULATION_GROWTH_PER_MONTH = 18; // Increased from 15 to 18

// Auto-Housing Development Settings
export const MIN_HAPPINESS_FOR_HOUSE_SPAWN = 45;
export const ROAD_PROXIMITY_FOR_HOUSING = 2; // Reduced from 4 to make them clump closer "along" the road
export const SERVICE_PROXIMITY_FOR_HOUSING = 5; // Range to check for schools, clinics, etc.
export const POWER_PLANT_INFLUENCE_RANGE = 12; // Visual range for power plants
export const WATER_TREATMENT_INFLUENCE_RANGE = 8; // Visual range for ETA
export const PARK_INFLUENCE_RANGE = 6; // Visual range for Parks

export const BASE_HOUSES_SPAWN_PER_MONTH = 2; // Reduced from 4 to slow down growth
export const MARKET_SPAWN_BONUS_PER_MARKET = 1; 
export const MAX_SPAWN_BONUS_FROM_MARKETS = 4;   
export const SCHOOL_SPAWN_BONUS_PER_SCHOOL = 1; 
export const MAX_SPAWN_BONUS_FROM_SCHOOLS = 4;   
export const ELECTRICITY_SPAWN_BONUS_IF_COVERED = 2; 
export const OVERALL_MAX_HOUSES_SPAWN_PER_MONTH = 6; // Reduced from 12 to slow down growth
export const MAX_REMOTE_HOUSES_ALLOWED_PER_MONTH = 0.3; // Small chance for houses far from roads

// Auto-Market Spawning Settings
export const MIN_RESIDENTIAL_FOR_FIRST_MARKET = 20; // First market after 20 houses/apartments
export const RESIDENTIAL_PER_MARKET_RATIO = 20;     // 1 market for every 20 residential buildings

// Apartment Development - Spawning on Empty Lots
export const MIN_HAPPINESS_FOR_APARTMENT_SPAWN = 50; 
export const MAX_APARTMENTS_SPAWN_PER_MONTH = 1; // Limit to 1 new spawn on empty lots
export const MIN_MARKET_PROXIMITY_FOR_APARTMENT = 2; 
export const MIN_SCHOOL_PROXIMITY_FOR_APARTMENT = 3; 
export const APARTMENT_UNLOCK_MANDATE = 1; // Apartments (both types) unlock in 2nd Mandate
export const MIN_HOUSES_PER_QUADRANT_FOR_APARTMENT = 30; // Increased from 18 to require higher concentration

// Apartment Development - Conversion from Existing Houses
export const MIN_HOUSES_IN_QUADRANT_FOR_CONVERSION = 40; // Increased from 22 to require much higher density
export const HOUSES_TO_CONVERT_TO_APARTMENT = 4;       // Number of houses replaced by one apartment
export const MAX_APARTMENT_CONVERSIONS_PER_MONTH = 1;  // Limit to 1 conversion per month


// Environmental Metrics - Initial Values & Caps
export const INITIAL_AIR_QUALITY = 80; 
export const INITIAL_WATER_QUALITY = 75; 
export const INITIAL_BIODIVERSITY = 70; 
export const ENV_METRIC_MIN_CAP = 0;
export const ENV_METRIC_MAX_CAP = 100;
export const PARK_RIVER_WATER_QUALITY_BONUS_MONTHLY = 0.3; // New bonus for parks next to rivers

// Default electricity consumption for generic buildings (can be overridden in BUILDING_DATA)
export const DEFAULT_ELECTRICITY_CONSUMPTION = 1; // MW

// Default environmental effects (can be overridden)
export const DEFAULT_AIR_QUALITY_EFFECT_ROAD = -0.05;
export const DEFAULT_AIR_QUALITY_EFFECT_INDUSTRIAL = -0.2;
export const DEFAULT_WATER_QUALITY_EFFECT_INDUSTRIAL = -0.1;
export const DEFAULT_BIODIVERSITY_EFFECT_URBAN = -0.05;

// Demolition
export const DEMOLITION_COST = 100;

export const DEMAND_LIFESPAN_MONTHS = 2; // Citizen demands disappear after 2 months if not addressed

// Policies Configuration
export const COMMERCE_TAX_CONFIG = {
  [PolicyLevel.LOW]: { incomeModifier: 0.9, happinessEffect: 1 },
  [PolicyLevel.NORMAL]: { incomeModifier: 1.0, happinessEffect: 0 },
  [PolicyLevel.HIGH]: { incomeModifier: 1.15, happinessEffect: -2 },
};

export const PROPERTY_TAX_CONFIG = {
  // ratePercent is applied to the base income of House/Apartment
  [PolicyLevel.LOW]: { ratePercent: 1.5, happinessEffect: 1 }, 
  [PolicyLevel.NORMAL]: { ratePercent: 3.0, happinessEffect: 0 }, 
  [PolicyLevel.HIGH]: { ratePercent: 5.0, happinessEffect: -3 }, 
};

export const GREEN_INITIATIVES_MONTHLY_COST = 150;
export const GREEN_INITIATIVES_PARK_MAINTENANCE_MODIFIER = 0.8; 
export const GREEN_INITIATIVES_GREEN_ENERGY_PRODUCTION_MODIFIER = 1.05; 
export const GREEN_INITIATIVES_HAPPINESS_BONUS = 1;


// Terrain Features - Removed static definitions in favor of randomization
export const RIVER_TILES: GridPosition[] = [];
export const MOUNTAIN_BASE_TILES: GridPosition[] = [];
