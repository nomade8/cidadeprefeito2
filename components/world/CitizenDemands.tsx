
import React from 'react';
import { Html } from '@react-three/drei';
import { motion, AnimatePresence } from 'motion/react';
import { useGameLogic } from '../../hooks/useGameLogic';
import { gridToWorldCoords } from '../../utils/gridUtils';

const CitizenDemands: React.FC = () => {
  const { demands, dismissDemand, translate: t } = useGameLogic();

  if (!demands || demands.length === 0) return null;

  return (
    <group>
      <AnimatePresence>
        {demands.map((demand) => {
          const worldPos = gridToWorldCoords(demand.position.x, demand.position.z, 0);
          
          return (
            <group key={demand.id} position={[worldPos.x, 2, worldPos.z]}>
              <Html center distanceFactor={15}>
                <motion.div 
                   initial={{ scale: 0, opacity: 0, y: 20 }}
                   animate={{ scale: 1, opacity: 1, y: 0 }}
                   exit={{ scale: 0, opacity: 0, y: -20 }}
                   whileHover={{ scale: 1.05 }}
                   className="bg-white/95 backdrop-blur-sm p-3 rounded-2xl shadow-xl border-2 border-sky-400 min-w-[140px] max-w-[200px] text-slate-900 pointer-events-auto"
                >
                  <div className="flex flex-col gap-1 items-center">
                    <span className="text-2xl mb-1">
                      {demand.type === 'HEALTH' && '🏥'}
                      {demand.type === 'EDUCATION' && '🏫'}
                      {demand.type === 'SECURITY' && '🚓'}
                      {demand.type === 'PARK' && '🌳'}
                      {demand.type === 'MARKET' && '🏪'}
                      {demand.type === 'ELECTRICITY' && '⚡'}
                    </span>
                    <p className="text-[11px] font-bold text-center leading-tight">
                      {/* Removed coordinates from the message display for a cleaner UI */}
                      {t(demand.message as any).split('(')[0].trim()}
                    </p>
                  </div>
                  {/* Pointy tip of the bubble */}
                  <div className="absolute bottom-0 left-1/2 -translate-x-1/2 translate-y-full w-0 h-0 border-l-[8px] border-l-transparent border-r-[8px] border-r-transparent border-t-[8px] border-t-sky-400"></div>
                </motion.div>
              </Html>
            </group>
          );
        })}
      </AnimatePresence>
    </group>
  );
};

export default CitizenDemands;
