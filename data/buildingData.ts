
import { BuildingType, BuildingConfig } from '../types';
import { 
    PEOPLE_PER_HOUSE, 
    PEOPLE_PER_APARTMENT, 
    HAPPINESS_PER_SCHOOL_MONTHLY, 
    HAPPINESS_PER_HEALTH_POST_MONTHLY, 
    HAPPINESS_PER_POLICE_STATION_MONTHLY,
    DEFAULT_ELECTRICITY_CONSUMPTION,
    DEFAULT_AIR_QUALITY_EFFECT_ROAD,
    DEFAULT_AIR_QUALITY_EFFECT_INDUSTRIAL,
    DEFAULT_WATER_QUALITY_EFFECT_INDUSTRIAL,
    DEFAULT_BIODIVERSITY_EFFECT_URBAN
} from '../game/settings';

export const BUILDING_DATA: BuildingConfig = {
  [BuildingType.ROAD]: { 
    cost: 50, 
    maintenance: 10,
    capacity: 100,
    capacityUnit: "UNIT_PERCENT",
    electricityConsumption: 0.1, // Minimal for street lights
    airQualityEffectMonthly: DEFAULT_AIR_QUALITY_EFFECT_ROAD, // Vehicle pollution
    waterQualityEffectMonthly: -0.01, // Runoff
    biodiversityEffectMonthly: -0.01, // Habitat fragmentation
  },
  [BuildingType.HOUSE]: { 
    cost: 250, 
    income: 50,
    housingProvided: PEOPLE_PER_HOUSE,
    capacity: PEOPLE_PER_HOUSE,
    capacityUnit: "UNIT_CITIZENS",
    electricityConsumption: DEFAULT_ELECTRICITY_CONSUMPTION * 0.5,
    airQualityEffectMonthly: -0.02,
    waterQualityEffectMonthly: -0.02,
    biodiversityEffectMonthly: DEFAULT_BIODIVERSITY_EFFECT_URBAN,
  },
  [BuildingType.MARKET]: {
    cost: 1000, 
    income: 150, 
    maintenance: 40,
    capacity: 60,
    capacityUnit: "UNIT_CLIENTS",
    electricityConsumption: DEFAULT_ELECTRICITY_CONSUMPTION * 2,
    airQualityEffectMonthly: -0.05,
    waterQualityEffectMonthly: -0.03,
    biodiversityEffectMonthly: DEFAULT_BIODIVERSITY_EFFECT_URBAN,
  },
  [BuildingType.PARK]: {
    cost: 500, 
    income: 0, 
    maintenance: 20,
    capacity: 100,
    capacityUnit: "UNIT_VISITORS",
    electricityConsumption: 0.2, // Lights, water pumps
    airQualityEffectMonthly: 0.3, // Improves air quality
    waterQualityEffectMonthly: 0.1, // Can help with runoff
    biodiversityEffectMonthly: 0.5, // Improves biodiversity
  },
  [BuildingType.POWER_PLANT]: { // Conventional / Fossil Fuel Plant
    cost: 3000,
    income: 0, 
    maintenance: 100,
    electricityProduction: 100, // MW
    capacity: 100,
    capacityUnit: "UNIT_MW",
    airQualityEffectMonthly: DEFAULT_AIR_QUALITY_EFFECT_INDUSTRIAL * 2.5, // -0.5
    waterQualityEffectMonthly: DEFAULT_WATER_QUALITY_EFFECT_INDUSTRIAL,   // -0.1
    biodiversityEffectMonthly: -0.1,
  },
  [BuildingType.SOLAR_POWER_PLANT]: {
    cost: 4500,
    maintenance: 50,
    electricityProduction: 70, // MW
    capacity: 70,
    capacityUnit: "UNIT_MW",
    airQualityEffectMonthly: 0.05, // Slight positive due to land use change, or neutral
    waterQualityEffectMonthly: 0,
    biodiversityEffectMonthly: -0.05, // Land use
  },
  [BuildingType.HYDRO_POWER_PLANT]: {
    cost: 6000,
    maintenance: 120,
    electricityProduction: 150, // MW
    capacity: 150,
    capacityUnit: "UNIT_MW",
    airQualityEffectMonthly: 0,
    waterQualityEffectMonthly: 0, // Assuming minimal operational impact after construction
    biodiversityEffectMonthly: -0.2, // Impact of dam on river ecosystem
    requiresRiver: true,
  },
  [BuildingType.APARTMENT]: { 
    cost: 2000,
    income: 300,
    maintenance: 60,
    housingProvided: PEOPLE_PER_APARTMENT,
    capacity: PEOPLE_PER_APARTMENT,
    capacityUnit: "UNIT_CITIZENS",
    electricityConsumption: DEFAULT_ELECTRICITY_CONSUMPTION * 1.5,
    airQualityEffectMonthly: -0.04,
    waterQualityEffectMonthly: -0.04,
    biodiversityEffectMonthly: DEFAULT_BIODIVERSITY_EFFECT_URBAN,
  },
  [BuildingType.SCHOOL]: {
    cost: 1800,
    maintenance: 150,
    happinessEffectMonthly: HAPPINESS_PER_SCHOOL_MONTHLY,
    capacity: 120,
    capacityUnit: "UNIT_STUDENTS",
    electricityConsumption: DEFAULT_ELECTRICITY_CONSUMPTION * 1.2,
    airQualityEffectMonthly: -0.01,
    waterQualityEffectMonthly: -0.01,
    biodiversityEffectMonthly: DEFAULT_BIODIVERSITY_EFFECT_URBAN * 0.5,
  },
  [BuildingType.HEALTH_POST]: {
    cost: 1200,
    maintenance: 100,
    happinessEffectMonthly: HAPPINESS_PER_HEALTH_POST_MONTHLY,
    capacity: 50,
    capacityUnit: "UNIT_PATIENTS",
    electricityConsumption: DEFAULT_ELECTRICITY_CONSUMPTION * 1,
    airQualityEffectMonthly: -0.01,
    waterQualityEffectMonthly: -0.01,
    biodiversityEffectMonthly: DEFAULT_BIODIVERSITY_EFFECT_URBAN * 0.5,
  },
  [BuildingType.POLICE_STATION]: {
    cost: 1500,
    maintenance: 120,
    happinessEffectMonthly: HAPPINESS_PER_POLICE_STATION_MONTHLY,
    capacity: 80,
    capacityUnit: "UNIT_OFFICERS",
    electricityConsumption: DEFAULT_ELECTRICITY_CONSUMPTION * 0.8,
    airQualityEffectMonthly: -0.01,
    waterQualityEffectMonthly: -0.01,
    biodiversityEffectMonthly: DEFAULT_BIODIVERSITY_EFFECT_URBAN * 0.5,
  },
  [BuildingType.WATER_TREATMENT_PLANT]: {
    cost: 2800,
    maintenance: 150,
    capacity: 1500,
    capacityUnit: "UNIT_M3_DAY",
    electricityConsumption: DEFAULT_ELECTRICITY_CONSUMPTION * 2.0,
    waterQualityEffectMonthly: 0.8, // Significant positive impact
    airQualityEffectMonthly: -0.02, // Minor operational impact
    biodiversityEffectMonthly: -0.06, // Land use
  },
  [BuildingType.TECH_INDUSTRY]: {
    cost: 5000,
    income: 800,
    maintenance: 250,
    capacity: 100,
    capacityUnit: "UNIT_JOBS",
    electricityConsumption: DEFAULT_ELECTRICITY_CONSUMPTION * 5.0,
    airQualityEffectMonthly: -0.01,
    waterQualityEffectMonthly: -0.01,
    biodiversityEffectMonthly: -0.05,
    happinessEffectMonthly: 1.0, 
  },
  [BuildingType.HEAVY_INDUSTRY]: {
    cost: 3500,
    income: 1200,
    maintenance: 400,
    capacity: 200,
    capacityUnit: "UNIT_JOBS",
    electricityConsumption: DEFAULT_ELECTRICITY_CONSUMPTION * 8.0,
    airQualityEffectMonthly: -0.8, 
    waterQualityEffectMonthly: -0.6, 
    biodiversityEffectMonthly: -0.3,
    happinessEffectMonthly: -2.0, 
  },
};
