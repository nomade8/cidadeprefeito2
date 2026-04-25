
import React from 'react';
import * as THREE from 'three';
import { TILE_SIZE } from '../../game/settings';
interface HydroPowerPlantProps {
  position: THREE.Vector3; 
}

const HydroPowerPlant: React.FC<HydroPowerPlantProps> = ({ position }) => {
  const damWidth = TILE_SIZE * 0.95; // Span across the tile
  const damHeight = TILE_SIZE * 0.7;
  const damThicknessTop = TILE_SIZE * 0.2;
  const damThicknessBottom = TILE_SIZE * 0.4;
  const powerhouseWidth = TILE_SIZE * 0.4;
  const powerhouseHeight = TILE_SIZE * 0.35;
  const powerhouseDepth = TILE_SIZE * 0.3;

  // Create a trapezoidal prism shape for the dam
  const shape = new THREE.Shape();
  shape.moveTo(-damThicknessBottom / 2, 0);
  shape.lineTo(damThicknessBottom / 2, 0);
  shape.lineTo(damThicknessTop / 2, damHeight);
  shape.lineTo(-damThicknessTop / 2, damHeight);
  shape.closePath();

  const extrudeSettings = {
    steps: 1,
    depth: damWidth, // Extrude along the width of the tile
    bevelEnabled: false,
  };
  
  const yGroupBase = position.y;

  return (
    <group position={[position.x, yGroupBase, position.z]}>
      {/* Dam Structure (extruding along X-axis, then rotating) */}
      <mesh
        rotation={[0, Math.PI / 2, 0]} // Rotate so depth becomes width
        castShadow
        receiveShadow
      >
        <extrudeGeometry args={[shape, extrudeSettings]} />
        <meshStandardMaterial color="#ed6d05" roughness={0.6} metalness={0.3} /> {/* Dark Gray Concrete */}
      </mesh>

      {/* Powerhouse building on top or side of dam */}
      <mesh
        position={[0, damHeight + powerhouseHeight / 2 - TILE_SIZE * 0.1, 0]} // Positioned slightly lower than full dam height
        castShadow
        receiveShadow
      >
        <boxGeometry args={[powerhouseWidth, powerhouseHeight, powerhouseDepth]} />
        <meshStandardMaterial color="#D3D3D3" roughness={0.7} metalness={0.1} /> {/* Light Gray */}
      </mesh>
    </group>
  );
};

export default HydroPowerPlant;
