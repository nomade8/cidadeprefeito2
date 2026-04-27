
import * as THREE from 'three';
import { BuildingType } from '../../types';
import { TILE_SIZE } from '../../game/settings';

// Materials
const roadMaterial = new THREE.MeshStandardMaterial({ color: "#505050", roughness: 0.85, metalness: 0.1 });
const houseBaseMaterial = new THREE.MeshStandardMaterial({ color: "#D2B48C", roughness: 0.8, metalness: 0.1 });
const houseRoofMaterial = new THREE.MeshStandardMaterial({ color: "#8B4513", roughness: 0.7, metalness: 0.1 });
const houseChimneyMaterial = new THREE.MeshStandardMaterial({ color: "#696969", roughness: 0.7 });
const parkGroundMaterial = new THREE.MeshStandardMaterial({ color: "#228B22", roughness: 0.9, metalness: 0 });
const treeTrunkMaterial = new THREE.MeshStandardMaterial({ color: "#8B4513", roughness: 0.8 });
const treeCanopyMaterial = new THREE.MeshStandardMaterial({ color: "#006400", roughness: 0.8 });
const marketBaseMaterial = new THREE.MeshStandardMaterial({ color: "#A0522D", roughness: 0.8, metalness: 0.1 });
const marketRoofMaterial = new THREE.MeshStandardMaterial({ color: "#8B0000", roughness: 0.7, metalness: 0.1 });
const marketAwningMaterial = new THREE.MeshStandardMaterial({ color: "#F0E68C", roughness: 0.8 });
const industrialBaseMaterial = new THREE.MeshStandardMaterial({ color: "#696969", roughness: 0.7, metalness: 0.3 });
const industrialDetailMaterial = new THREE.MeshStandardMaterial({ color: "#404040", roughness: 0.6, metalness: 0.2 });
const schoolBaseMaterial = new THREE.MeshStandardMaterial({ color: "#E0C097", roughness: 0.8 });
const schoolRoofMaterial = new THREE.MeshStandardMaterial({ color: "#FFD700", roughness: 0.7, metalness: 0.1 });
const healthBaseMaterial = new THREE.MeshStandardMaterial({ color: "#FFFFFF", roughness: 0.7 });
const policeBaseMaterial = new THREE.MeshStandardMaterial({ color: "#2F4F4F", roughness: 0.7 });
const waterBaseMaterial = new THREE.MeshStandardMaterial({ color: "#800080", roughness: 0.7 });
const techBaseMaterial = new THREE.MeshStandardMaterial({ color: "#F0F8FF", roughness: 0.2, metalness: 0.8 });
const techDetailMaterial = new THREE.MeshStandardMaterial({ color: "#00BFFF", emissive: "#003366", roughness: 0.1 });
const heavyBaseMaterial = new THREE.MeshStandardMaterial({ color: "#2A2A2A", roughness: 0.9, metalness: 0.4 });
const heavyDetailMaterial = new THREE.MeshStandardMaterial({ color: "#A0A0A0", roughness: 0.8 });
const industrialWhiteMaterial = new THREE.MeshStandardMaterial({ color: "#FFFFFF", roughness: 0.7 });
const doorMaterial = new THREE.MeshStandardMaterial({ color: "#5C4033", roughness: 0.7 });
const glassMaterial = new THREE.MeshStandardMaterial({ color: "#ADD8E6", roughness: 0.3, metalness: 0.6, transparent: true, opacity: 0.8, emissive: "#000000" });
const redMaterial = new THREE.MeshStandardMaterial({ color: "#FF0000" });
const blueMaterial = new THREE.MeshStandardMaterial({ color: "#0000FF", emissive: "#000000" });
const apartmentWallMaterial = new THREE.MeshStandardMaterial({ color: "#B0C4DE", roughness: 0.7, metalness: 0.1 });
const apartmentRoofMaterial = new THREE.MeshStandardMaterial({ color: "#778899", roughness: 0.6 });
const apartmentWindowMaterial = new THREE.MeshStandardMaterial({ color: "#ADD8E6", side: THREE.DoubleSide, emissive: "#000000" });
const apartmentDoorMaterial = new THREE.MeshStandardMaterial({ color: "#8B4513", side: THREE.DoubleSide });
const solarPanelMaterial = new THREE.MeshStandardMaterial({ color: "#191970", roughness: 0.1, metalness: 0.8 });

// --- Shared Detail Constants ---
const windowGeo = new THREE.PlaneGeometry(TILE_SIZE * 0.12, TILE_SIZE * 0.12);
const doorGeo = new THREE.PlaneGeometry(TILE_SIZE * 0.15, TILE_SIZE * 0.22);

// --- House Definition ---
const houseBaseWidth = TILE_SIZE * 0.5;
const houseBaseDepth = TILE_SIZE * 0.5;
const houseBaseHeight = TILE_SIZE * 0.3;
const houseRoofHeight = TILE_SIZE * 0.3;
const houseRoofRadius = houseBaseWidth * 0.75;
const chimneyWidth = TILE_SIZE * 0.1;
const chimneyHeight = TILE_SIZE * 0.2;
const chimneyDepth = TILE_SIZE * 0.1;

const houseBaseGeo = new THREE.BoxGeometry(houseBaseWidth, houseBaseHeight, houseBaseDepth);
const houseRoofGeo = new THREE.ConeGeometry(houseRoofRadius, houseRoofHeight, 4);
const houseChimneyGeo = new THREE.BoxGeometry(chimneyWidth, chimneyHeight, chimneyDepth);

const houseParts = [
  {
    name: 'base',
    geometry: houseBaseGeo,
    material: houseBaseMaterial,
    relativeTransform: new THREE.Matrix4().setPosition(0, houseBaseHeight / 2, 0),
  },
  {
    name: 'roof',
    geometry: houseRoofGeo,
    material: houseRoofMaterial,
    relativeTransform: new THREE.Matrix4().makeRotationY(Math.PI / 4).setPosition(0, houseBaseHeight + houseRoofHeight / 2, 0),
  },
  {
    name: 'chimney',
    geometry: houseChimneyGeo,
    material: houseChimneyMaterial,
    relativeTransform: new THREE.Matrix4().setPosition(houseBaseWidth * 0.25, houseBaseHeight + chimneyHeight / 2, -houseBaseDepth * 0.25),
  },
  {
    name: 'door',
    geometry: doorGeo,
    material: doorMaterial,
    relativeTransform: new THREE.Matrix4().setPosition(0, (TILE_SIZE * 0.22) / 2, houseBaseDepth / 2 + 0.01),
  },
  {
    name: 'window-l',
    geometry: windowGeo,
    material: glassMaterial,
    relativeTransform: new THREE.Matrix4().setPosition(-houseBaseWidth * 0.22, houseBaseHeight * 0.6, houseBaseDepth / 2 + 0.01),
  },
  {
    name: 'window-r',
    geometry: windowGeo,
    material: glassMaterial,
    relativeTransform: new THREE.Matrix4().setPosition(houseBaseWidth * 0.22, houseBaseHeight * 0.6, houseBaseDepth / 2 + 0.01),
  },
];

// --- Road Definition ---
const roadThickness = TILE_SIZE * 0.1;
const roadDimension = TILE_SIZE * 0.95;
const roadGeo = new THREE.BoxGeometry(roadDimension, roadThickness, roadDimension);
const roadParts = [
  {
    name: 'surface',
    geometry: roadGeo,
    material: roadMaterial,
    relativeTransform: new THREE.Matrix4().setPosition(0, roadThickness / 2, 0),
  },
];

// --- Park Definition ---
const parkGroundHeight = TILE_SIZE * 0.05;
const parkTreeTrunkHeight = TILE_SIZE * 0.4;
const parkTreeTrunkRadius = TILE_SIZE * 0.04;
const parkTreeCanopyRadius = TILE_SIZE * 0.25;

const parkGroundGeo = new THREE.BoxGeometry(TILE_SIZE * 0.95, parkGroundHeight, TILE_SIZE * 0.95);
const parkTreeTrunkGeo = new THREE.CylinderGeometry(parkTreeTrunkRadius, parkTreeTrunkRadius, parkTreeTrunkHeight, 8);
const parkTreeCanopyGeo = new THREE.SphereGeometry(parkTreeCanopyRadius, 8, 8);

const parkTreePositions = [
    { x: -TILE_SIZE * 0.3, z: -TILE_SIZE * 0.3, s: 1.1 },
    { x: TILE_SIZE * 0.3, z: TILE_SIZE * 0.2, s: 0.7 },
];

const parkParts = [
  {
    name: 'ground',
    geometry: parkGroundGeo,
    material: parkGroundMaterial,
    relativeTransform: new THREE.Matrix4().setPosition(0, parkGroundHeight / 2, 0),
  },
  ...parkTreePositions.flatMap((treePos, index) => [
    {
      name: `trunk-${index}`,
      geometry: parkTreeTrunkGeo,
      material: treeTrunkMaterial,
      relativeTransform: new THREE.Matrix4().setPosition(treePos.x, parkGroundHeight + parkTreeTrunkHeight / 2, treePos.z),
    },
    {
      name: `canopy-${index}`,
      geometry: parkTreeCanopyGeo,
      material: treeCanopyMaterial,
      relativeTransform: new THREE.Matrix4().compose(
        new THREE.Vector3(treePos.x, parkGroundHeight + parkTreeTrunkHeight + parkTreeCanopyRadius * treePos.s * 0.8, treePos.z),
        new THREE.Quaternion(),
        new THREE.Vector3(treePos.s, treePos.s, treePos.s)
      ),
    },
  ]),
];

// --- Market Definition ---
const marketBaseWidth = TILE_SIZE * 0.9;
const marketBaseDepth = TILE_SIZE * 0.9;
const marketBaseHeight = TILE_SIZE * 0.5;
const marketRoofHeight = TILE_SIZE * 0.1;
const marketAwningDepth = TILE_SIZE * 0.2;
const marketAwningWidth = marketBaseWidth;
const marketAwningHeight = TILE_SIZE * 0.1;

const marketBaseGeo = new THREE.BoxGeometry(marketBaseWidth, marketBaseHeight, marketBaseDepth);
const marketRoofGeo = new THREE.BoxGeometry(marketBaseWidth * 1.05, marketRoofHeight, marketBaseDepth * 1.05); // Simple pitched roof placeholder
const marketAwningGeo = new THREE.BoxGeometry(marketAwningWidth, marketAwningHeight, marketAwningDepth);

// --- Apartment Definition ---
const apartmentFloorHeight = TILE_SIZE * 0.5;
const apartmentBaseWidth = TILE_SIZE * 0.8;
const apartmentBaseDepth = TILE_SIZE * 0.7;
const apartmentTotalFloors = 3;
const apartmentBaseHeight = apartmentFloorHeight * apartmentTotalFloors;
const apartmentRoofHeight = TILE_SIZE * 0.15;
const apartmentRoofOverhang = TILE_SIZE * 0.05;

const apartmentBaseGeo = new THREE.BoxGeometry(apartmentBaseWidth, apartmentBaseHeight, apartmentBaseDepth);
const apartmentRoofGeo = new THREE.BoxGeometry(apartmentBaseWidth + apartmentRoofOverhang, apartmentRoofHeight, apartmentBaseDepth + apartmentRoofOverhang);
const apartmentWindowGeo = new THREE.PlaneGeometry(TILE_SIZE * 0.15, TILE_SIZE * 0.15);
const apartmentDoorGeo = new THREE.PlaneGeometry(TILE_SIZE * 0.2, TILE_SIZE * 0.25);

const apartmentParts = [
  {
    name: 'base',
    geometry: apartmentBaseGeo,
    material: apartmentWallMaterial,
    relativeTransform: new THREE.Matrix4().setPosition(0, apartmentBaseHeight / 2, 0),
  },
  {
    name: 'roof',
    geometry: apartmentRoofGeo,
    material: apartmentRoofMaterial,
    relativeTransform: new THREE.Matrix4().setPosition(0, apartmentBaseHeight + apartmentRoofHeight / 2, 0),
  },
  {
    name: 'door',
    geometry: apartmentDoorGeo,
    material: apartmentDoorMaterial,
    relativeTransform: new THREE.Matrix4().setPosition(0, (TILE_SIZE * 0.25) / 2, apartmentBaseDepth / 2 + 0.01),
  },
  // Windows - Floor 1
  {
    name: 'window-f1-l',
    geometry: apartmentWindowGeo,
    material: apartmentWindowMaterial,
    relativeTransform: new THREE.Matrix4().setPosition(-apartmentBaseWidth * 0.25, apartmentFloorHeight * 0.5, apartmentBaseDepth / 2 + 0.01),
  },
  {
    name: 'window-f1-r',
    geometry: apartmentWindowGeo,
    material: apartmentWindowMaterial,
    relativeTransform: new THREE.Matrix4().setPosition(apartmentBaseWidth * 0.25, apartmentFloorHeight * 0.5, apartmentBaseDepth / 2 + 0.01),
  },
  // Windows - Floor 2
  {
    name: 'window-f2-l',
    geometry: apartmentWindowGeo,
    material: apartmentWindowMaterial,
    relativeTransform: new THREE.Matrix4().setPosition(-apartmentBaseWidth * 0.25, apartmentFloorHeight * 1.5, apartmentBaseDepth / 2 + 0.01),
  },
  {
    name: 'window-f2-r',
    geometry: apartmentWindowGeo,
    material: apartmentWindowMaterial,
    relativeTransform: new THREE.Matrix4().setPosition(apartmentBaseWidth * 0.25, apartmentFloorHeight * 1.5, apartmentBaseDepth / 2 + 0.01),
  },
  // Windows - Floor 3
  {
    name: 'window-f3-l',
    geometry: apartmentWindowGeo,
    material: apartmentWindowMaterial,
    relativeTransform: new THREE.Matrix4().setPosition(-apartmentBaseWidth * 0.25, apartmentFloorHeight * 2.5, apartmentBaseDepth / 2 + 0.01),
  },
  {
    name: 'window-f3-r',
    geometry: apartmentWindowGeo,
    material: apartmentWindowMaterial,
    relativeTransform: new THREE.Matrix4().setPosition(apartmentBaseWidth * 0.25, apartmentFloorHeight * 2.5, apartmentBaseDepth / 2 + 0.01),
  },
];

const marketParts = [
    {
        name: 'base',
        geometry: marketBaseGeo,
        material: marketBaseMaterial,
        relativeTransform: new THREE.Matrix4().setPosition(0, marketBaseHeight / 2, 0),
    },
    {
        name: 'roof',
        geometry: marketRoofGeo,
        material: marketRoofMaterial,
        relativeTransform: new THREE.Matrix4().setPosition(0, marketBaseHeight + marketRoofHeight / 2, 0),
    },
    {
        name: 'awning',
        geometry: marketAwningGeo,
        material: marketAwningMaterial,
        relativeTransform: new THREE.Matrix4().setPosition(0, marketBaseHeight * 0.85, marketBaseDepth / 2 + marketAwningDepth / 2),
    },
    {
        name: 'door',
        geometry: doorGeo,
        material: doorMaterial,
        relativeTransform: new THREE.Matrix4().setPosition(0, (TILE_SIZE * 0.22) / 2, marketBaseDepth / 2 + 0.01),
    },
    {
        name: 'window-l',
        geometry: windowGeo,
        material: glassMaterial,
        relativeTransform: new THREE.Matrix4().setPosition(-marketBaseWidth * 0.3, marketBaseHeight * 0.5, marketBaseDepth / 2 + 0.01),
    },
    {
        name: 'window-r',
        geometry: windowGeo,
        material: glassMaterial,
        relativeTransform: new THREE.Matrix4().setPosition(marketBaseWidth * 0.3, marketBaseHeight * 0.5, marketBaseDepth / 2 + 0.01),
    }
];


// --- Power Plant Definition ---
const powerBaseWidth = TILE_SIZE * 0.82;
const powerBaseHeight = TILE_SIZE * 0.7;
const powerStackHeight = TILE_SIZE * 0.9;
const powerStackRadius = TILE_SIZE * 0.12;

const powerBaseGeo = new THREE.BoxGeometry(powerBaseWidth, powerBaseHeight, powerBaseWidth);
const powerStackGeo = new THREE.CylinderGeometry(powerStackRadius * 0.8, powerStackRadius, powerStackHeight, 16);

const powerPlantParts = [
    {
        name: 'base',
        geometry: powerBaseGeo,
        material: industrialBaseMaterial,
        relativeTransform: new THREE.Matrix4().setPosition(0, powerBaseHeight / 2, 0),
    },
    {
        name: 'stack-1',
        geometry: powerStackGeo,
        material: industrialDetailMaterial,
        relativeTransform: new THREE.Matrix4().setPosition(powerBaseWidth * 0.25, powerBaseHeight + powerStackHeight / 2, powerBaseWidth * 0.25),
    },
    {
        name: 'stack-2',
        geometry: powerStackGeo,
        material: industrialDetailMaterial,
        relativeTransform: new THREE.Matrix4().setPosition(-powerBaseWidth * 0.25, powerBaseHeight + powerStackHeight / 2, -powerBaseWidth * 0.25),
    }
];

// --- Solar Power Plant Definition ---
const solarFrameHeight = TILE_SIZE * 0.1;
const solarPanelWidth = TILE_SIZE * 0.4;
const solarPanelHeight = TILE_SIZE * 0.05;
const solarPanelDepth = TILE_SIZE * 0.4;

const solarBaseGeo = new THREE.BoxGeometry(TILE_SIZE * 0.9, solarFrameHeight, TILE_SIZE * 0.9);
const solarPanelGeo = new THREE.BoxGeometry(solarPanelWidth, solarPanelHeight, solarPanelDepth);

const solarPlantParts = [
    {
        name: 'base',
        geometry: solarBaseGeo,
        material: industrialWhiteMaterial,
        relativeTransform: new THREE.Matrix4().setPosition(0, solarFrameHeight / 2, 0),
    },
    ...[
        {x: -0.22, z: -0.22}, {x: 0.22, z: -0.22},
        {x: -0.22, z: 0.22}, {x: 0.22, z: 0.22}
    ].map((pos, idx) => ({
        name: `panel-${idx}`,
        geometry: solarPanelGeo,
        material: solarPanelMaterial,
        relativeTransform: new THREE.Matrix4().makeRotationX(Math.PI / 6).setPosition(pos.x * TILE_SIZE, solarFrameHeight + TILE_SIZE * 0.1, pos.z * TILE_SIZE),
    }))
];

// --- School Definition ---
const schoolBaseWidth = TILE_SIZE * 0.9;
const schoolBaseHeight = TILE_SIZE * 0.55;
const schoolRoofHeight = TILE_SIZE * 0.1;

const schoolBaseGeo = new THREE.BoxGeometry(schoolBaseWidth, schoolBaseHeight, TILE_SIZE * 0.75);
const schoolRoofGeo = new THREE.BoxGeometry(schoolBaseWidth + 0.05, schoolRoofHeight, TILE_SIZE * 0.8);

const schoolParts = [
    {
        name: 'base',
        geometry: schoolBaseGeo,
        material: schoolBaseMaterial,
        relativeTransform: new THREE.Matrix4().setPosition(0, schoolBaseHeight / 2, 0),
    },
    {
        name: 'roof',
        geometry: schoolRoofGeo,
        material: schoolRoofMaterial,
        relativeTransform: new THREE.Matrix4().setPosition(0, schoolBaseHeight + schoolRoofHeight / 2, 0),
    },
    {
        name: 'door',
        geometry: doorGeo,
        material: doorMaterial,
        relativeTransform: new THREE.Matrix4().setPosition(0, (TILE_SIZE * 0.22) / 2, TILE_SIZE * 0.375 + 0.01),
    },
    ...[0.2, 0.4].flatMap(x => [-1, 1].map(side => ({
        name: `win-${x}-${side}`,
        geometry: windowGeo,
        material: glassMaterial,
        relativeTransform: new THREE.Matrix4().setPosition(x * TILE_SIZE * side, schoolBaseHeight * 0.6, TILE_SIZE * 0.375 + 0.01),
    })))
];

// --- Health Post Definition ---
const healthParts = [
    {
        name: 'base',
        geometry: new THREE.BoxGeometry(TILE_SIZE * 0.8, TILE_SIZE * 0.5, TILE_SIZE * 0.8),
        material: healthBaseMaterial,
        relativeTransform: new THREE.Matrix4().setPosition(0, TILE_SIZE * 0.25, 0),
    },
    {
        name: 'cross-h',
        geometry: new THREE.BoxGeometry(TILE_SIZE * 0.3, TILE_SIZE * 0.08, TILE_SIZE * 0.02),
        material: redMaterial,
        relativeTransform: new THREE.Matrix4().setPosition(0, TILE_SIZE * 0.35, TILE_SIZE * 0.4 + 0.01),
    },
    {
        name: 'cross-v',
        geometry: new THREE.BoxGeometry(TILE_SIZE * 0.08, TILE_SIZE * 0.3, TILE_SIZE * 0.02),
        material: redMaterial,
        relativeTransform: new THREE.Matrix4().setPosition(0, TILE_SIZE * 0.35, TILE_SIZE * 0.4 + 0.01),
    }
];

// --- Police Station Definition ---
const policeParts = [
    {
        name: 'base',
        geometry: new THREE.BoxGeometry(TILE_SIZE * 0.85, TILE_SIZE * 0.65, TILE_SIZE * 0.8),
        material: policeBaseMaterial,
        relativeTransform: new THREE.Matrix4().setPosition(0, TILE_SIZE * 0.325, 0),
    },
    {
        name: 'siren',
        geometry: new THREE.BoxGeometry(TILE_SIZE * 0.15, TILE_SIZE * 0.08, TILE_SIZE * 0.15),
        material: blueMaterial,
        relativeTransform: new THREE.Matrix4().setPosition(0, TILE_SIZE * 0.65 + TILE_SIZE * 0.04, 0),
    },
    {
        name: 'door',
        geometry: doorGeo,
        material: industrialDetailMaterial,
        relativeTransform: new THREE.Matrix4().setPosition(0, (TILE_SIZE * 0.22) / 2, TILE_SIZE * 0.4 + 0.01),
    }
];

// --- Water Treatment Definition ---
const waterParts = [
    {
        name: 'base',
        geometry: new THREE.BoxGeometry(TILE_SIZE * 0.9, TILE_SIZE * 0.4, TILE_SIZE * 0.9),
        material: waterBaseMaterial,
        relativeTransform: new THREE.Matrix4().setPosition(0, TILE_SIZE * 0.2, 0),
    },
    {
        name: 'tank-1',
        geometry: new THREE.CylinderGeometry(TILE_SIZE * 0.2, TILE_SIZE * 0.2, TILE_SIZE * 0.2, 16),
        material: industrialBaseMaterial,
        relativeTransform: new THREE.Matrix4().setPosition(TILE_SIZE * 0.2, TILE_SIZE * 0.4 + TILE_SIZE * 0.1, TILE_SIZE * 0.2),
    },
    {
        name: 'tank-2',
        geometry: new THREE.CylinderGeometry(TILE_SIZE * 0.2, TILE_SIZE * 0.2, TILE_SIZE * 0.2, 16),
        material: industrialBaseMaterial,
        relativeTransform: new THREE.Matrix4().setPosition(-TILE_SIZE * 0.2, TILE_SIZE * 0.4 + TILE_SIZE * 0.1, -TILE_SIZE * 0.2),
    }
];

// --- Tech Industry Definition ---
const techParts = [
    {
        name: 'base',
        geometry: new THREE.BoxGeometry(TILE_SIZE * 0.85, TILE_SIZE * 0.6, TILE_SIZE * 0.85),
        material: techBaseMaterial,
        relativeTransform: new THREE.Matrix4().setPosition(0, TILE_SIZE * 0.3, 0),
    },
    {
        name: 'tower',
        geometry: new THREE.BoxGeometry(TILE_SIZE * 0.3, TILE_SIZE * 0.8, TILE_SIZE * 0.3),
        material: techBaseMaterial,
        relativeTransform: new THREE.Matrix4().setPosition(TILE_SIZE * 0.2, TILE_SIZE * 0.4, -TILE_SIZE * 0.2),
    },
    {
        name: 'glow-accent',
        geometry: new THREE.BoxGeometry(TILE_SIZE * 0.86, TILE_SIZE * 0.05, TILE_SIZE * 0.86),
        material: techDetailMaterial,
        relativeTransform: new THREE.Matrix4().setPosition(0, TILE_SIZE * 0.45, 0),
    }
];

// --- Heavy Industry Definition ---
const heavyParts = [
    {
        name: 'base',
        geometry: new THREE.BoxGeometry(TILE_SIZE * 0.9, TILE_SIZE * 0.45, TILE_SIZE * 0.9),
        material: heavyBaseMaterial,
        relativeTransform: new THREE.Matrix4().setPosition(0, TILE_SIZE * 0.225, 0),
    },
    ...[
        {x: -0.25, z: -0.25}, {x: 0.25, z: -0.25}, {x: 0, z: 0.25}
    ].map((pos, idx) => ({
        name: `stack-${idx}`,
        geometry: new THREE.CylinderGeometry(TILE_SIZE * 0.08, TILE_SIZE * 0.12, TILE_SIZE * 0.6, 12),
        material: heavyDetailMaterial,
        relativeTransform: new THREE.Matrix4().setPosition(pos.x * TILE_SIZE, TILE_SIZE * 0.45 + TILE_SIZE * 0.3, pos.z * TILE_SIZE),
    }))
];

export interface BuildingPart {
  name: string;
  geometry: THREE.BufferGeometry;
  material: THREE.Material;
  relativeTransform: THREE.Matrix4; // Transform relative to the building's anchor point (center of its tile)
}

export interface BuildingTypeDefinition {
  parts: BuildingPart[];
}

export const buildingDefinitions: Record<BuildingType, BuildingTypeDefinition | undefined> = {
  [BuildingType.HOUSE]: { parts: houseParts },
  [BuildingType.ROAD]: { parts: roadParts },
  [BuildingType.PARK]: { parts: parkParts },
  [BuildingType.MARKET]: { parts: marketParts },
  [BuildingType.POWER_PLANT]: { parts: powerPlantParts }, 
  [BuildingType.SOLAR_POWER_PLANT]: { parts: solarPlantParts },
  [BuildingType.HYDRO_POWER_PLANT]: undefined, // Keep Hydro non-instanced for now (it needs river logic)
  [BuildingType.APARTMENT]: { parts: apartmentParts },
  [BuildingType.SCHOOL]: { parts: schoolParts },
  [BuildingType.HEALTH_POST]: { parts: healthParts },
  [BuildingType.POLICE_STATION]: { parts: policeParts },
  [BuildingType.WATER_TREATMENT_PLANT]: { parts: waterParts },
  [BuildingType.TECH_INDUSTRY]: { parts: techParts },
  [BuildingType.HEAVY_INDUSTRY]: { parts: heavyParts },
};
