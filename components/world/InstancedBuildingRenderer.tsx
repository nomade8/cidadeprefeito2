
import React, { useMemo, useRef, useEffect } from 'react';
import * as THREE from 'three';
import { useGame } from '../../context/GameContext';
import { useGameLogic } from '../../hooks/useGameLogic';
import { Building, BuildingType } from '../../types';
import { buildingDefinitions, BuildingTypeDefinition } from './buildingDefinitions';
import { gridToWorldCoords } from '../../utils/gridUtils';
import { GRID_SIZE } from '../../game/settings';

import { useFrame, useThree } from '@react-three/fiber';

const MAX_INSTANCES_PER_TYPE = GRID_SIZE * GRID_SIZE; // Max possible buildings of one type

const BLINK_DURATION_MS = 1500;
const BLINK_INTERVAL_MS = 250;

interface InstancedPartMesh {
  type: BuildingType;
  partName: string;
  mesh: THREE.InstancedMesh;
}

const InstancedBuildingRenderer: React.FC = () => {
  const { buildings, timeOfDay } = useGame();
  const { scene } = useThree();
  const [instancedMeshes, setInstancedMeshes] = React.useState<InstancedPartMesh[]>([]);
  const internalMeshesRef = useRef<InstancedPartMesh[]>([]);
  const dummy = useMemo(() => new THREE.Object3D(), []);

  // Memoize grouped buildings
  const buildingsByType = useMemo(() => {
    const grouped: Record<string, Building[]> = {};
    if (!Array.isArray(buildings)) return grouped;
    
    for (const building of buildings) {
      if (!grouped[building.type]) {
        grouped[building.type] = [];
      }
      grouped[building.type].push(building);
    }
    return grouped;
  }, [buildings]);

  // Handle Initial Matrix setup and updates when buildings list changes
  useEffect(() => {
    const currentInstancedMeshes = internalMeshesRef.current;
    const newMeshes: InstancedPartMesh[] = [];
    const localDummy = new THREE.Object3D(); 

    Object.entries(buildingsByType).forEach(([type, currentTypeBuildings]) => {
      const definition = buildingDefinitions[type as BuildingType] as BuildingTypeDefinition | undefined;
      if (!definition || currentTypeBuildings.length === 0) {
        currentInstancedMeshes.forEach(instMesh => {
            if (instMesh.type === type as BuildingType) instMesh.mesh.count = 0;
        });
        return;
      }

      definition.parts.forEach(part => {
        let instancedMeshHolder = currentInstancedMeshes.find(
          m => m.type === type as BuildingType && m.partName === part.name
        );

        if (!instancedMeshHolder) {
          const mesh = new THREE.InstancedMesh(part.geometry, part.material, MAX_INSTANCES_PER_TYPE);
          mesh.castShadow = true;
          if (type === BuildingType.ROAD || type === BuildingType.PARK) {
            mesh.receiveShadow = true;
          }

          instancedMeshHolder = { type: type as BuildingType, partName: part.name, mesh };
        }
        newMeshes.push(instancedMeshHolder);

        const { mesh } = instancedMeshHolder;
        currentTypeBuildings.forEach((building, index) => {
          if (index < MAX_INSTANCES_PER_TYPE) {
            const worldPos = gridToWorldCoords(building.position.x, building.position.z, 0);
            localDummy.position.copy(worldPos);
            localDummy.scale.set(1, 1, 1);
            localDummy.updateMatrix(); 

            const finalMatrix = new THREE.Matrix4();
            finalMatrix.multiplyMatrices(localDummy.matrix, part.relativeTransform);
            mesh.setMatrixAt(index, finalMatrix);
          }
        });
        mesh.count = Math.min(currentTypeBuildings.length, MAX_INSTANCES_PER_TYPE);
        mesh.instanceMatrix.needsUpdate = true;
        
        if (mesh.count > 0) {
            mesh.computeBoundingSphere();
        }
      });
    });
    
    currentInstancedMeshes.forEach(existingMesh => {
        if (!newMeshes.find(nm => nm.mesh === existingMesh.mesh)) {
            existingMesh.mesh.count = 0;
        }
    });

    internalMeshesRef.current = newMeshes;
    setInstancedMeshes([...newMeshes]);

  }, [buildingsByType]);

  // Blinking logic in useFrame
  useFrame(() => {
    const now = Date.now();
    
    // Only check apartments for blinking
    const apartmentMeshes = internalMeshesRef.current.filter(m => m.type === BuildingType.APARTMENT);
    const apartmentBuildings = buildingsByType[BuildingType.APARTMENT];

    if (!apartmentBuildings || apartmentMeshes.length === 0) return;

    apartmentMeshes.forEach(holder => {
      let meshNeedsUpdate = false;
      const { mesh } = holder;

      apartmentBuildings.forEach((building, index) => {
        if (building.builtAt && now - building.builtAt < BLINK_DURATION_MS + 100) {
          const elapsed = now - building.builtAt;
          let scale = 1;

          if (elapsed < BLINK_DURATION_MS) {
            const isBlinkOn = Math.floor(elapsed / BLINK_INTERVAL_MS) % 2 === 0;
            scale = isBlinkOn ? 0.01 : 1;
          }

          // Apply matrix update for this instance
          const worldPos = gridToWorldCoords(building.position.x, building.position.z, 0);
          dummy.position.copy(worldPos);
          dummy.scale.set(scale, scale, scale);
          dummy.updateMatrix();

          // Get part definition to apply relative transform
          const definition = buildingDefinitions[BuildingType.APARTMENT];
          const part = definition?.parts.find(p => p.name === holder.partName);
          if (part) {
            const finalMatrix = new THREE.Matrix4();
            finalMatrix.multiplyMatrices(dummy.matrix, part.relativeTransform);
            mesh.setMatrixAt(index, finalMatrix);
            meshNeedsUpdate = true;
          }
        }
      });

      if (meshNeedsUpdate) {
        mesh.instanceMatrix.needsUpdate = true;
      }
    });
  });

  // Dispose of meshes on unmount
  useEffect(() => {
    return () => {
      internalMeshesRef.current.forEach(holder => {
        holder.mesh.dispose();
      });
      internalMeshesRef.current = [];
    };
  }, []);

  return (
    <>
      {instancedMeshes.map(holder => (
        <primitive key={`${holder.type}-${holder.partName}`} object={holder.mesh} />
      ))}
    </>
  );
};

export default InstancedBuildingRenderer;
