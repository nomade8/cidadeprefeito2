
import React, { useRef } from 'react';
import { Canvas } from '@react-three/fiber';
import { GameProvider } from './context/GameContext';
import { LanguageProvider } from './context/LanguageContext';
import GameUI from './components/ui/GameUI';
import Scene from './components/world/Scene';
import EnvironmentalDashboard from './components/ui/EnvironmentalDashboard'; // Import here
import { CAMERA_POSITION, CAMERA_FOV, PLANE_SIZE } from './game/settings';

const App: React.FC = () => {
  const gameAreaRef = useRef<HTMLDivElement>(null);

  return (
    <LanguageProvider>
      <GameProvider>
        <div className="w-screen h-screen flex relative overflow-hidden bg-slate-900">
          <EnvironmentalDashboard /> {/* EnvironmentalDashboard as a flex item */}
          
          {/* Main Game Area: Canvas and GameUI overlays */}
          <div ref={gameAreaRef} className="flex-grow min-w-0 h-full relative overflow-hidden"> {/* Added overflow-hidden to help with layout transitions */}
            <GameUI containerRef={gameAreaRef} /> {/* GameUI will overlay the Canvas */}
            <div className="absolute inset-0"> {/* Absolute wrapper for the Canvas to isolate it from flex jitters */}
              <Canvas
                shadows
                camera={{ position: CAMERA_POSITION, fov: CAMERA_FOV, far: PLANE_SIZE * 3.5 }}
                gl={{ antialias: true }}
              >
                <Scene />
              </Canvas>
            </div>
          </div>
        </div>
      </GameProvider>
    </LanguageProvider>
  );
};

export default App;
