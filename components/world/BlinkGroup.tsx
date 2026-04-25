
import React, { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

interface BlinkGroupProps {
  builtAt?: number;
  children: React.ReactNode;
  position: [number, number, number];
}

const BLINK_DURATION_MS = 1500;
const BLINK_INTERVAL_MS = 250;

const BlinkGroup: React.FC<BlinkGroupProps> = ({ builtAt, children, position }) => {
  const groupRef = useRef<THREE.Group>(null);

  useFrame(() => {
    if (!groupRef.current || !builtAt) return;

    const now = Date.now();
    const elapsed = now - builtAt;

    if (elapsed < BLINK_DURATION_MS) {
      const isBlinkOn = Math.floor(elapsed / BLINK_INTERVAL_MS) % 2 === 0;
      const s = isBlinkOn ? 0.001 : 1;
      groupRef.current.scale.set(s, s, s);
    } else if (groupRef.current.scale.x !== 1) {
      groupRef.current.scale.set(1, 1, 1);
    }
  });

  return (
    <group ref={groupRef} position={position}>
      {children}
    </group>
  );
};

export default BlinkGroup;
