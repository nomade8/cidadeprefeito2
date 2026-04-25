
import React from 'react';
// import * as THREE from 'three';
// import { TILE_SIZE } from '../../game/settings';

// The rendering logic for Markets is now handled by InstancedBuildingRenderer.tsx 
// and buildingDefinitions.ts. This file is kept for potential future use.

interface MarketProps {
  // position: THREE.Vector3; // No longer used for instanced rendering here
}

const Market: React.FC<MarketProps> = (/*{ position }*/) => {
  // console.log("Individual Market component rendered - this should not happen for instanced markets.");
  // For now, it does nothing as instancing handles markets.
  return null;
};

export default Market;
