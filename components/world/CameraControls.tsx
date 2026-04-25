
import React from 'react';
import { OrbitControls } from '@react-three/drei';
import { PLANE_SIZE, TILE_SIZE } from '../../game/settings'; 

const CameraControlsComponent: React.FC = () => {
  return (
    <OrbitControls
      enablePan={true}
      enableZoom={true}
      enableRotate={true}
      minDistance={TILE_SIZE * 6} // Zoom in limit adjusted slightly
      maxDistance={PLANE_SIZE * 1.5} // Zoom out limit increased
      maxPolarAngle={Math.PI / 2.2} // Prevent looking from too low, adjusted slightly
      minPolarAngle={Math.PI / 8} // Prevent looking from too high (top-down), adjusted slightly
      target={[0, 0, 0]} // Controls should orbit around the center of the plane
      panSpeed={0.8}
      rotateSpeed={0.7}
      zoomSpeed={0.5}
    />
  );
};

export { CameraControlsComponent as CameraControls }; 
export default CameraControlsComponent;
