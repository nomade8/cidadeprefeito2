

import React from 'react';
import * as THREE from 'three';
import { TILE_SIZE } from '../../game/settings';

interface MountainProps {
  position: THREE.Vector3; // World coordinates for the center of the mountain base
  baseSize?: number; // Approximate size of the mountain base (e.g., 3x3 tiles)
}

const Mountain: React.FC<MountainProps> = ({ position, baseSize = 3 }) => {
  const mountainHeight = TILE_SIZE * baseSize * 0.8; // Mountain height proportional to base
  const mountainRadius = (TILE_SIZE * baseSize) / 2 * 0.9; // Radius of the cone base

  // Colors for a rocky mountain with some snow
  const rockColor = "#8B8989"; // CadetBlue-like gray
  const snowColor = "#5e310e"; // Snow white

  const yPos = position.y + mountainHeight / 2; // Center the cone vertically

  return (
    <group position={new THREE.Vector3(position.x, 0, position.z)} castShadow receiveShadow>
      {/* Main mountain cone (rock part) */}
      <mesh position={[0, yPos * 0.8, 0]} castShadow receiveShadow> 
        <coneGeometry args={[mountainRadius, mountainHeight * 0.8, 16]} /> 
        <meshStandardMaterial color={rockColor} roughness={0.9} metalness={0.1} />
      </mesh>
      
      {/* Snow cap cone */}
      <mesh position={[0, yPos * 0.8 + (mountainHeight * 0.8 * 0.35) , 0]} castShadow receiveShadow>
        <coneGeometry args={[mountainRadius * 0.4, mountainHeight * 0.4, 16]} />
        <meshStandardMaterial color={snowColor} roughness={0.85} />
      </mesh>

      {/* Adding some smaller "foothills" or rock details */}
      <mesh position={[-mountainRadius * 0.3, TILE_SIZE * 0.5, mountainRadius * 0.3]} castShadow receiveShadow>
        <dodecahedronGeometry args={[TILE_SIZE * 0.7, 0]} /> 
        <meshStandardMaterial color={rockColor} roughness={0.95} flatShading={true} />
      </mesh>
       <mesh position={[mountainRadius * 0.4, TILE_SIZE * 0.4, -mountainRadius * 0.2]} castShadow receiveShadow>
        <dodecahedronGeometry args={[TILE_SIZE * 0.6, 0]} />
        <meshStandardMaterial color={rockColor} roughness={0.95} flatShading={true}/>
      </mesh>
    </group>
  );
};

export default Mountain;