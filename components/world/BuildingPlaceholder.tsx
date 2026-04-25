import React from 'react';
import * as THREE from 'three';
import { BuildingType } from '../../types';
import { TILE_SIZE } from '../../game/settings';

interface BuildingPlaceholderProps {
  position: THREE.Vector3; // World coordinates for the center of the tile
  type: BuildingType;
  // Optional: Pass validity for color coding, or handle color in Terrain.tsx's direct render of this.
  // isValidPlacement?: boolean; 
}

const BuildingPlaceholder: React.FC<BuildingPlaceholderProps> = ({ position, type /*, isValidPlacement = true */ }) => {
    const roadHeight = TILE_SIZE * 0.05;
    const roadDim = TILE_SIZE * 0.9; // Placeholder slightly smaller than actual road width for clarity
    const houseSize = TILE_SIZE * 0.8; // Placeholder slightly smaller
    const houseHeight = TILE_SIZE * 0.7;
    const marketSize = TILE_SIZE * 0.9;
    const marketHeight = TILE_SIZE * 0.6;
    const parkSize = TILE_SIZE * 0.95;
    const parkHeight = TILE_SIZE * 0.05;
    const powerPlantSize = TILE_SIZE * 0.8;
    const powerPlantHeight = TILE_SIZE * 1.2;
    const placeholderYOffset = TILE_SIZE * 0.02; // Ensure it's visible above terrain/grid

    // const color = isValidPlacement ? "rgb(100, 220, 100)" : "rgb(220, 100, 100)";
    // Simplified: Color logic moved to an internal component in Terrain.tsx or handled there.
    // This component will just render with a generic placeholder color if not controlled.
    const genericPlaceholderColor = "rgb(120, 200, 120)";


    let geometry;
    let yPos = position.y + placeholderYOffset;
    let currentHeight = 0;

    switch (type) {
        case BuildingType.HOUSE:
            currentHeight = houseHeight;
            geometry = <boxGeometry args={[houseSize, currentHeight, houseSize]} />;
            break;
        case BuildingType.ROAD: // Unified road type
            currentHeight = roadHeight;
            geometry = <boxGeometry args={[roadDim, currentHeight, roadDim]} />;
            break;
        case BuildingType.MARKET:
            currentHeight = marketHeight;
            geometry = <boxGeometry args={[marketSize, currentHeight, marketSize]} />;
            break;
        case BuildingType.PARK:
            currentHeight = parkHeight;
            geometry = <boxGeometry args={[parkSize, currentHeight, parkSize]} />;
            break;
        case BuildingType.POWER_PLANT:
            currentHeight = powerPlantHeight;
            geometry = <boxGeometry args={[powerPlantSize, currentHeight, powerPlantSize]} />;
            break;
        default:
            return null; // Should not happen if type is valid
    }
    
    // Adjust y position to be center of the geometry
    yPos += currentHeight / 2;


    return (
        <mesh position={new THREE.Vector3(position.x, yPos, position.z)}>
            {geometry}
            <meshStandardMaterial 
                color={genericPlaceholderColor} 
                transparent 
                opacity={0.5} 
                depthWrite={false} // So it doesn't hide things behind it completely
            />
        </mesh>
    );
};

export default BuildingPlaceholder;