
import React, { useRef, useState } from 'react';
import { ThreeEvent } from '@react-three/fiber';
import * as THREE from 'three';
import { useGameLogic } from '../../hooks/useGameLogic';
import { worldToGridCoords, gridToWorldCoords } from '../../utils/gridUtils';
import { 
  PLANE_SIZE, 
  TILE_SIZE, 
  GRID_SIZE, 
  DEMOLITION_COST, 
  SERVICE_PROXIMITY_FOR_HOUSING,
  POWER_PLANT_INFLUENCE_RANGE,
  WATER_TREATMENT_INFLUENCE_RANGE,
  PARK_INFLUENCE_RANGE
} from '../../game/settings'; 
import { BUILDING_DATA } from '../../data/buildingData';
import { BuildingType, GridPosition, Building } from '../../types'; 


const RiverMesh: React.FC<{ riverTiles: GridPosition[] }> = ({ riverTiles }) => {
  const { waterQuality } = useGameLogic();
  if (!riverTiles || riverTiles.length === 0) return null;

  // Quantize quality to 4% steps as requested for more noticeable jumps
  const steppedQuality = Math.floor(waterQuality / 4) * 4;
  
  // Use a very aggressive power function to ensure mid-range is dark.
  // power 4 means: 
  // 100% -> 1.0 (Bright Blue)
  // 80% -> 0.40 (Significant graying)
  // 60% -> 0.12 (Almost totally gray/black)
  // 40% -> 0.02 (Total sewer look)
  const factor = Math.pow(steppedQuality / 100, 4.0);

  // Colors:
  // Good: Deep Vibrant Blue (#0055FF) for 100% quality
  // Bad: Deep Murky Sewer Gray (#080A09) - extremely dark, almost no hue
  const poolBlue = new THREE.Color("#0055FF"); 
  const pollutedSewer = new THREE.Color("#080A09");
  
  const waterColor = new THREE.Color().lerpColors(pollutedSewer, poolBlue, factor);
  
  // Emissive Intesity: keep it subtle to avoid "whitening" out the surface
  const emissiveIntesity = 0.3 * Math.pow(factor, 2.0); 
  const emissiveColor = poolBlue.clone().multiplyScalar(emissiveIntesity);
  
  const metalness = 0.1 + (factor * 0.4);
  const roughness = 0.6 - (factor * 0.5); 
  const opacity = 0.75 + (factor * 0.15); 

  return (
    <group>
      {riverTiles.map((tile, index) => {
        const worldPos = gridToWorldCoords(tile.x, tile.z, 0.005); 
        return (
          <mesh key={`river-${index}`} position={worldPos} rotation={[-Math.PI / 2, 0, 0]}>
            <planeGeometry args={[TILE_SIZE, TILE_SIZE]} />
            <meshStandardMaterial 
              color={waterColor} 
              emissive={emissiveColor} 
              roughness={roughness} 
              metalness={metalness} 
              transparent 
              opacity={0.75 + (factor * 0.15)} 
            />
          </mesh>
        );
      })}
    </group>
  );
};

const RangeIndicator: React.FC<{ position: THREE.Vector3, range: number }> = ({ position, range }) => {
  const worldRange = range * TILE_SIZE;
  return (
    <group position={[position.x, 0.05, position.z]}>
      {/* The border ring */}
      <mesh rotation={[-Math.PI / 2, 0, 0]}>
        <ringGeometry args={[worldRange - 0.05, worldRange + 0.1, 64]} />
        <meshBasicMaterial color="#ffffff" transparent opacity={0.6} depthWrite={false} />
      </mesh>
      {/* The semi-transparent fill */}
      <mesh rotation={[-Math.PI / 2, 0, 0]}>
        <circleGeometry args={[worldRange, 64]} />
        <meshBasicMaterial color="#60a5fa" transparent opacity={0.15} depthWrite={false} />
      </mesh>
    </group>
  );
};

const getBuildingRange = (type: BuildingType): number | null => {
  switch (type) {
    case BuildingType.SCHOOL:
    case BuildingType.HEALTH_POST:
    case BuildingType.POLICE_STATION:
    case BuildingType.MARKET:
      return SERVICE_PROXIMITY_FOR_HOUSING;
    case BuildingType.WATER_TREATMENT_PLANT:
      return WATER_TREATMENT_INFLUENCE_RANGE;
    case BuildingType.POWER_PLANT:
    case BuildingType.SOLAR_POWER_PLANT:
    case BuildingType.HYDRO_POWER_PLANT:
      return POWER_PLANT_INFLUENCE_RANGE;
    case BuildingType.PARK:
      return PARK_INFLUENCE_RANGE;
    default:
      return null;
  }
};


const Terrain: React.FC = () => {
  const { 
    buildStructure, 
    demolishStructure,
    batchBuildStructures,
    selectedBuildingType, 
    isDemolishModeActive,
    getBuildingAt,
    gameOver, 
    money, 
    mandateEnded,
    currentMandate,
    buildings,
    riverTiles,
    mountainTiles
  } = useGameLogic();
  const [hoveredGridPos, setHoveredGridPos] = useState<GridPosition | null>(null);
  const [roadStartPos, setRoadStartPos] = useState<GridPosition | null>(null);
  const planeRef = useRef<THREE.Mesh>(null!);

  // Clear road start if building type changes or demolish mode toggles
  React.useEffect(() => {
    setRoadStartPos(null);
  }, [selectedBuildingType, isDemolishModeActive]);

  const getLinePoints = (start: GridPosition, end: GridPosition): GridPosition[] => {
    const points: GridPosition[] = [];
    const dx = end.x - start.x;
    const dz = end.z - start.z;
    
    // Horizontal then vertical (L-shape)
    const xStep = dx >= 0 ? 1 : -1;
    for (let x = start.x; x !== end.x + xStep; x += xStep) {
      points.push({ x, z: start.z });
    }
    
    const zStep = dz >= 0 ? 1 : -1;
    // Start from start.z + zStep to avoid double-adding the corner tile
    for (let z = start.z + zStep; z !== end.z + zStep; z += zStep) {
      points.push({ x: end.x, z });
    }
    
    return points;
  };

  const gridHelper = React.useMemo(() => 
    new THREE.GridHelper(PLANE_SIZE, GRID_SIZE, 0xaaaaaa, 0x666666), 
    [] 
  );
  gridHelper.position.y = 0.01; 

  const handlePointerMove = (event: ThreeEvent<PointerEvent>) => {
    if (gameOver || mandateEnded) {
      if (hoveredGridPos !== null) setHoveredGridPos(null);
      return;
    }
    
    if (!selectedBuildingType && !isDemolishModeActive) {
        if (hoveredGridPos !== null) setHoveredGridPos(null);
        return;
    }
     if (selectedBuildingType === BuildingType.APARTMENT && currentMandate < 2 && !isDemolishModeActive) {
      if (hoveredGridPos !== null) setHoveredGridPos(null);
      return;
    }


    event.stopPropagation();
    const point = event.point;
    const gridPos = worldToGridCoords(point.x, point.z);
    
    if (gridPos?.x !== hoveredGridPos?.x || gridPos?.z !== hoveredGridPos?.z) {
        setHoveredGridPos(gridPos);
    }
  };

  const handlePointerOut = () => {
    setHoveredGridPos(null);
  };

  const handleClick = (event: ThreeEvent<MouseEvent>) => {
    if (gameOver || mandateEnded) return;
    
    event.stopPropagation();
    const point = event.point;
    const gridPos = worldToGridCoords(point.x, point.z);

    if (gridPos) {
      if (isDemolishModeActive) {
        demolishStructure(gridPos);
      } else if (selectedBuildingType) {
        if (selectedBuildingType === BuildingType.APARTMENT && currentMandate < 2) return;
        if (selectedBuildingType === BuildingType.HOUSE) return;

        if (selectedBuildingType === BuildingType.ROAD) {
          if (!roadStartPos) {
            setRoadStartPos(gridPos);
          } else {
            const linePoints = getLinePoints(roadStartPos, gridPos);
            batchBuildStructures(BuildingType.ROAD, linePoints);
            setRoadStartPos(null);
          }
        } else {
          buildStructure(gridPos.x, gridPos.z);
        }
      }
    }
  };
  
  let showBuildPlaceholder = false;
  let roadLinePoints: GridPosition[] = [];
  if (selectedBuildingType && hoveredGridPos && !mandateEnded && !gameOver && !isDemolishModeActive) {
    if (selectedBuildingType === BuildingType.ROAD && roadStartPos) {
      roadLinePoints = getLinePoints(roadStartPos, hoveredGridPos);
    } else if (selectedBuildingType === BuildingType.APARTMENT && currentMandate < 2) {
      showBuildPlaceholder = false;
    } else if (selectedBuildingType === BuildingType.HOUSE) {
      showBuildPlaceholder = false;
    } else {
      showBuildPlaceholder = true;
    }
  }
  
  let showDemolishPlaceholder = false;
  let buildingToDemolish: Building | undefined = undefined;
  if (isDemolishModeActive && hoveredGridPos && !mandateEnded && !gameOver) {
      buildingToDemolish = getBuildingAt(hoveredGridPos);
      if (buildingToDemolish) {
          showDemolishPlaceholder = true;
      }
  }


  return (
    <>
      <mesh
        ref={planeRef}
        rotation={[-Math.PI / 2, 0, 0]}
        onClick={handleClick}
        onPointerMove={handlePointerMove}
        onPointerOut={handlePointerOut}
        receiveShadow
      >
        <planeGeometry args={[PLANE_SIZE, PLANE_SIZE]} />
        <meshStandardMaterial color="#6B8E23" roughness={0.9} metalness={0.1} /> 
      </mesh>
      <primitive object={gridHelper} />
      <RiverMesh riverTiles={riverTiles} />

      {selectedBuildingType && hoveredGridPos && getBuildingRange(selectedBuildingType) !== null && !isDemolishModeActive && (
        <RangeIndicator 
          position={gridToWorldCoords(hoveredGridPos.x, hoveredGridPos.z, 0)} 
          range={getBuildingRange(selectedBuildingType)!} 
        />
      )}
      
      {showBuildPlaceholder && selectedBuildingType && hoveredGridPos && (
         <BuildingPlaceholderWithColorLogic 
            position={gridToWorldCoords(hoveredGridPos.x, hoveredGridPos.z, 0)} 
            type={selectedBuildingType}
            hoveredGridPos={hoveredGridPos}
            existingBuildings={buildings}
            canAfford={money >= BUILDING_DATA[selectedBuildingType].cost}
            isDemolishPreview={false}
            riverTiles={riverTiles}
            mountainTiles={mountainTiles}
          />
      )}

      {selectedBuildingType === BuildingType.ROAD && roadLinePoints.length > 0 && (
        roadLinePoints.map((p, idx) => (
          <BuildingPlaceholderWithColorLogic 
            key={`road-preview-${idx}-${p.x}-${p.z}`}
            position={gridToWorldCoords(p.x, p.z, 0)} 
            type={BuildingType.ROAD}
            hoveredGridPos={p}
            existingBuildings={buildings}
            canAfford={money >= (idx + 1) * BUILDING_DATA[BuildingType.ROAD].cost}
            isDemolishPreview={false}
            riverTiles={riverTiles}
            mountainTiles={mountainTiles}
          />
        ))
      )}
      {showDemolishPlaceholder && hoveredGridPos && buildingToDemolish && (
          <BuildingPlaceholderWithColorLogic
            position={gridToWorldCoords(hoveredGridPos.x, hoveredGridPos.z, 0)}
            type={buildingToDemolish.type} 
            hoveredGridPos={hoveredGridPos}
            existingBuildings={buildings} 
            canAfford={money >= DEMOLITION_COST} 
            isDemolishPreview={true}
            riverTiles={riverTiles}
            mountainTiles={mountainTiles}
          />
      )}
    </>
  );
};

interface BuildingPlaceholderWithColorLogicProps {
  position: THREE.Vector3;
  type: BuildingType;
  hoveredGridPos: GridPosition;
  existingBuildings: Building[];
  canAfford: boolean;
  isDemolishPreview: boolean;
  riverTiles: GridPosition[];
  mountainTiles: GridPosition[];
}

function isTileInList(position: GridPosition, tileList: GridPosition[]): boolean {
  return tileList.some(
    (tile) => tile.x === position.x && tile.z === position.z
  );
}

const BuildingPlaceholderWithColorLogic: React.FC<BuildingPlaceholderWithColorLogicProps> = ({ 
    position, type, hoveredGridPos, existingBuildings, canAfford, isDemolishPreview, riverTiles, mountainTiles 
}) => {
    
    let isValidPlacement = canAfford;
    let color = isDemolishPreview ? "rgb(255, 100, 100)" : "rgb(220, 100, 100)"; 

    if (isDemolishPreview) {
        if (!canAfford) { 
             color = "rgb(255, 180, 180)"; 
        }
    } else { 
        const config = BUILDING_DATA[type];
        if (isValidPlacement) { 
            const isOccupiedByBuilding = existingBuildings.some(
                (b) => b.position.x === hoveredGridPos.x && b.position.z === hoveredGridPos.z
            );
            const onMountain = isTileInList(hoveredGridPos, mountainTiles);
            const onRiver = isTileInList(hoveredGridPos, riverTiles);

            if (isOccupiedByBuilding) {
                isValidPlacement = false;
            } else if (onMountain) {
                isValidPlacement = false;
            } else if (config.requiresRiver) {
                isValidPlacement = onRiver; 
            } else if (onRiver) { 
                isValidPlacement = (type === BuildingType.ROAD); 
            } else {
                isValidPlacement = true; 
            }
        }
        if (isValidPlacement) {
            color = "rgb(100, 220, 100)"; 
        }
    }


    let geometry;
    let yOffset = TILE_SIZE * 0.02; 
    let heightForCentering = 0;
    let width = TILE_SIZE * 0.8; 
    let depth = TILE_SIZE * 0.8; 

    switch (type) {
        case BuildingType.HOUSE: // Should not be manually placed, but define for consistency if needed
            heightForCentering = TILE_SIZE * 0.6; 
            width = TILE_SIZE * 0.7; depth = TILE_SIZE * 0.7;
            break;
        case BuildingType.ROAD: 
            width = TILE_SIZE * 0.95; depth = TILE_SIZE * 0.95;
            heightForCentering = TILE_SIZE * 0.1;
            break;
        case BuildingType.MARKET:
            width = TILE_SIZE * 0.9; depth = TILE_SIZE * 0.9;
            heightForCentering = TILE_SIZE * 0.5; 
            break;
        case BuildingType.PARK:
            width = TILE_SIZE * 0.95; depth = TILE_SIZE * 0.95;
            heightForCentering = TILE_SIZE * 0.05; 
            break;
        case BuildingType.POWER_PLANT:
            heightForCentering = TILE_SIZE * 0.9; 
            break;
        case BuildingType.SOLAR_POWER_PLANT:
            width = TILE_SIZE * 0.9; depth = TILE_SIZE * 0.9; 
            heightForCentering = TILE_SIZE * 0.3; 
            break;
        case BuildingType.HYDRO_POWER_PLANT:
            width = TILE_SIZE * 0.95; 
            depth = TILE_SIZE * 0.4;  
            heightForCentering = TILE_SIZE * 0.7;
            break;
        case BuildingType.APARTMENT: // Auto-spawn, but placeholder can be useful
            depth = TILE_SIZE * 0.7; width = TILE_SIZE * 0.8;
            heightForCentering = TILE_SIZE * 0.5 * 3; 
            break;
        case BuildingType.SCHOOL:
            width = TILE_SIZE * 0.9; depth = TILE_SIZE * 0.6;
            heightForCentering = TILE_SIZE * 0.7; 
            break;
        case BuildingType.HEALTH_POST:
            width = TILE_SIZE * 0.7; depth = TILE_SIZE * 0.6;
            heightForCentering = TILE_SIZE * 0.4;
            break;
        case BuildingType.POLICE_STATION:
            width = TILE_SIZE * 0.8; depth = TILE_SIZE * 0.5;
            heightForCentering = TILE_SIZE * 0.5;
            break;
        case BuildingType.WATER_TREATMENT_PLANT: // New
            width = TILE_SIZE * 0.9; depth = TILE_SIZE * 0.9; // Approximate overall footprint
            heightForCentering = TILE_SIZE * 0.5; // Average height of components
            break;
        default: 
            heightForCentering = TILE_SIZE * 0.5;
            break;
    }
    
    geometry = <boxGeometry args={[width, heightForCentering, depth]} />;
    yOffset += heightForCentering / 2;

    return (
        <mesh position={new THREE.Vector3(position.x, yOffset, position.z)}>
            {geometry}
            <meshStandardMaterial 
                color={color}
                transparent 
                opacity={isDemolishPreview ? 0.4 : 0.6} 
                depthWrite={false} 
            />
        </mesh>
    );
};

export default Terrain;