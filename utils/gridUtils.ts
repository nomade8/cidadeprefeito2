import * as THREE from 'three'; // Import THREE for Vector3
import { GRID_SIZE, TILE_SIZE, PLANE_SIZE } from '../game/settings';
import { GridPosition } from '../types';

/**
 * Converts 3D world coordinates (from raycaster intersection point on the plane)
 * to 2D grid coordinates (e.g., {x: 0, z: 0} to {x: GRID_SIZE-1, z: GRID_SIZE-1}).
 * The terrain plane is centered at (0,0,0) in world space.
 * Grid (0,0) corresponds to the corner of the plane at (-PLANE_SIZE/2, -PLANE_SIZE/2) in world XZ.
 */
export const worldToGridCoords = (worldX: number, worldZ: number): GridPosition | null => {
  // Offset to bring world coordinates relative to the plane's corner (minX, minZ)
  const planeMinX = -PLANE_SIZE / 2;
  const planeMinZ = -PLANE_SIZE / 2;

  const relativeX = worldX - planeMinX;
  const relativeZ = worldZ - planeMinZ;

  const gridX = Math.floor(relativeX / TILE_SIZE);
  const gridZ = Math.floor(relativeZ / TILE_SIZE);

  // Check if the calculated grid coordinates are within the valid grid boundaries
  if (gridX >= 0 && gridX < GRID_SIZE && gridZ >= 0 && gridZ < GRID_SIZE) {
    return { x: gridX, z: gridZ };
  }
  return null; // Click or position was outside the defined grid
};

/**
 * Converts 2D grid coordinates to 3D world coordinates, specifically the center of the tile.
 * The Y coordinate (height) can be specified by yOffset.
 * Grid (0,0) corresponds to the corner of the plane at (-PLANE_SIZE/2, -PLANE_SIZE/2) in world XZ.
 */
export const gridToWorldCoords = (gridX: number, gridZ: number, yOffset: number = 0): THREE.Vector3 => {
  const planeMinX = -PLANE_SIZE / 2;
  const planeMinZ = -PLANE_SIZE / 2;

  // Calculate the world X and Z for the center of the grid cell
  const worldX = planeMinX + gridX * TILE_SIZE + TILE_SIZE / 2;
  const worldZ = planeMinZ + gridZ * TILE_SIZE + TILE_SIZE / 2;
  
  return new THREE.Vector3(worldX, yOffset, worldZ);
};
