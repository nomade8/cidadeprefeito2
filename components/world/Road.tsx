
import React from 'react';
// import * as THREE from 'three';
// import { TILE_SIZE } from '../../game/settings';

// The rendering logic for Roads is now handled by InstancedBuildingRenderer.tsx 
// and buildingDefinitions.ts. This file is kept for potential future use,
// such as defining variations or for placeholder logic if it were to be separated.

interface RoadProps {
  // position: THREE.Vector3; // No longer used for instanced rendering here
  // uniqueRoadProperty?: any; // Example if roads had variations
}

const Road: React.FC<RoadProps> = (/*{ position }*/) => {
  // console.log("Individual Road component rendered - this should ideally not happen for instanced roads.");
  // If this component were to be used for a unique, non-instanced road, its old logic would go here.
  // For now, it does nothing as instancing handles roads.
  return null;
};

export default Road;
