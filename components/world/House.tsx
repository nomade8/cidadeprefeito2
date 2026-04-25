
import React from 'react';
// import * as THREE from 'three';
// import { TILE_SIZE } from '../../game/settings';

// The rendering logic for Houses is now handled by InstancedBuildingRenderer.tsx 
// and buildingDefinitions.ts. This file is kept for potential future use.

interface HouseProps {
  // position: THREE.Vector3; // No longer used for instanced rendering here
}

const House: React.FC<HouseProps> = (/*{ position }*/) => {
  // console.log("Individual House component rendered - this should not happen for instanced houses.");
  // For now, it does nothing as instancing handles houses.
  return null;
};

export default House;
