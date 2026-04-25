
import React from 'react';
// import * as THREE from 'three';
// import { TILE_SIZE } from '../../game/settings';

// The rendering logic for Parks is now handled by InstancedBuildingRenderer.tsx 
// and buildingDefinitions.ts. This file is kept for potential future use.

interface ParkProps {
  // position: THREE.Vector3; // No longer used for instanced rendering here
}

const Park: React.FC<ParkProps> = (/*{ position }*/) => {
  // console.log("Individual Park component rendered - this should not happen for instanced parks.");
  // For now, it does nothing as instancing handles parks.
  return null;
};

export default Park;
