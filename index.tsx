import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './index.css';
import type { ThreeElements } from '@react-three/fiber';

// Workaround for TypeScript not recognizing @react-three/fiber JSX elements.
// This manually augments the global JSX namespace.
// Ideally, this is handled by @react-three/fiber's d.ts files and a correct tsconfig.json.
declare global {
  namespace JSX {
    interface IntrinsicElements {
      mesh: ThreeElements['mesh'];
      boxGeometry: ThreeElements['boxGeometry'];
      group: ThreeElements['group'];
      planeGeometry: ThreeElements['planeGeometry'];
      meshStandardMaterial: ThreeElements['meshStandardMaterial'];
      primitive: ThreeElements['primitive'];
      ambientLight: ThreeElements['ambientLight'];
      directionalLight: ThreeElements['directionalLight'];
      hemisphereLight: ThreeElements['hemisphereLight'];
      fog: ThreeElements['fog'];
      coneGeometry: ThreeElements['coneGeometry'];
      cylinderGeometry: ThreeElements['cylinderGeometry'];
      dodecahedronGeometry: ThreeElements['dodecahedronGeometry'];
      extrudeGeometry: ThreeElements['extrudeGeometry'];
    }
  }
}

const rootElement = document.getElementById('root');
if (!rootElement) {
  throw new Error("Could not find root element to mount to");
}

const root = ReactDOM.createRoot(rootElement);
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);