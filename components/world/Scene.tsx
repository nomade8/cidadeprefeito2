

import * as THREE from 'three';
import { useGame } from '../../context/GameContext';
import { BuildingType } from '../../types';
import { gridToWorldCoords } from '../../utils/gridUtils';
import Terrain from './Terrain';
import HydroPowerPlant from './HydroPowerPlant'; 
import Mountain from './Mountain'; 
import CameraControlsComponent from './CameraControls';
import InstancedBuildingRenderer from './InstancedBuildingRenderer';
import { PLANE_SIZE, TILE_SIZE, GRID_SIZE } from '../../game/settings';
import { buildingDefinitions } from './buildingDefinitions';

const Scene: React.FC = () => {
  const { buildings, mountainTiles, airQuality } = useGame();

  // Daytime Colors and Lighting
  const finalSkyColor = new THREE.Color('#87CEEB'); // Fixed Noon Blue

  // Fog Logic: Smog starts increasing as airQuality drops below 85%
  const smogThreshold = 85;
  const smogIntensity = airQuality >= smogThreshold 
    ? 0 
    : Math.pow((smogThreshold - airQuality) / smogThreshold, 0.8);

  const fogNear = THREE.MathUtils.lerp(PLANE_SIZE * 0.8, -PLANE_SIZE * 0.2, smogIntensity);
  const fogFar = THREE.MathUtils.lerp(PLANE_SIZE * 2.8, PLANE_SIZE * 0.4, smogIntensity);
  
  const smogColor = new THREE.Color('#555555');
  const currentFogColor = finalSkyColor.clone().lerp(smogColor, smogIntensity);

  // Lighting Intensities (Fixed at Noon)
  const ambientIntensity = 0.8;
  const directIntensity = 1.5;
  const hemisphereIntensity = 0.6;

  let mountainWorldPos = gridToWorldCoords(0,0,0); 
  let mountainBaseSize = 3; 

  if (mountainTiles && mountainTiles.length > 0) {
    let avgX = 0;
    let avgZ = 0;
    let minX = GRID_SIZE, maxX = 0, minZ = GRID_SIZE, maxZ = 0;

    mountainTiles.forEach(tile => {
        if(tile.x < minX) minX = tile.x;
        if(tile.x > maxX) maxX = tile.x;
        if(tile.z < minZ) minZ = tile.z;
        if(tile.z > maxZ) maxZ = tile.z;
    });
    avgX = (minX + maxX) / 2;
    avgZ = (minZ + maxZ) / 2;
    mountainWorldPos = gridToWorldCoords(avgX, avgZ, 0);
    mountainBaseSize = Math.max( (maxX - minX + 1), (maxZ - minZ + 1) );
    if (mountainBaseSize <= 0) {
        mountainBaseSize = 1;
    }
  }

  const nonInstancedBuildings = Array.isArray(buildings) 
    ? buildings.filter(building => !buildingDefinitions[building.type])
    : [];

  return (
    <>
      <color attach="background" args={[currentFogColor]} />
      <ambientLight intensity={ambientIntensity} color="#ffffff" /> 
      <directionalLight
        position={[PLANE_SIZE * 0.4, PLANE_SIZE, PLANE_SIZE * 0.4]} 
        intensity={directIntensity} 
        color="#ffffff"
        castShadow
        shadow-mapSize-width={4096} 
        shadow-mapSize-height={4096}
        shadow-camera-far={PLANE_SIZE * 2.5} 
        shadow-camera-left={-PLANE_SIZE * 0.8}
        shadow-camera-right={PLANE_SIZE * 0.8}
        shadow-camera-top={PLANE_SIZE * 0.8}
        shadow-camera-bottom={-PLANE_SIZE * 0.8}
        shadow-bias={-0.0005}
      />
      <hemisphereLight args={["#87ceeb", "#6B8E23", hemisphereIntensity]} /> 

      <CameraControlsComponent />
      <Terrain />
      {mountainTiles && mountainTiles.length > 0 && <Mountain position={mountainWorldPos} baseSize={mountainBaseSize} />}

      <InstancedBuildingRenderer />

      {/* Render non-instanced buildings individually (for those not yet converted) */}
      {nonInstancedBuildings.map((building) => {
        const worldPos = gridToWorldCoords(building.position.x, building.position.z, 0);
        switch (building.type) {
          // Cases for HOUSE, ROAD, PARK, MARKET are removed as they are now instanced
          case BuildingType.HYDRO_POWER_PLANT:
            return <HydroPowerPlant key={building.id} position={worldPos} />;
          default:
            return null;
        }
      })}

      <fog attach="fog" args={[currentFogColor, fogNear, fogFar]} />
    </>
  );
};

export default Scene;
