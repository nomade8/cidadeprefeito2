
import React, { createContext, useReducer, useContext, ReactNode, useEffect } from 'react';
import { GameState, GameAction, GameContextType, GridPosition, Building } from '../types';
import { gameReducer, initialState } from '../game/gameReducer';
import { MONTH_ADVANCE_INTERVAL } from '../game/settings';

const GameContext = createContext<GameContextType | undefined>(undefined);

export const GameProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [state, dispatch] = useReducer(gameReducer, initialState);

  // Automatic month advancement
  useEffect(() => {
    // Stop interval if game is over (bankrupt), mandate has ended (paused), or game is manually paused
    if (state.gameOver || state.mandateEnded || state.isPaused) {
      return; 
    }

    const timerId = setInterval(() => {
      dispatch({ type: 'ADVANCE_MONTH' });
    }, MONTH_ADVANCE_INTERVAL);

    return () => clearInterval(timerId);
  }, [state.gameOver, state.mandateEnded, state.isPaused, dispatch]); // Effect dependencies

  const canAfford = (cost: number): boolean => {
    return state.money >= cost;
  };

  const isOccupied = (position: GridPosition): boolean => {
    const buildingOccupies = state.buildings.some(
      (b) => b.position.x === position.x && b.position.z === position.z
    );
    return buildingOccupies;
  };

  const getBuildingAt = (position: GridPosition): Building | undefined => {
    return state.buildings.find(
      (b) => b.position.x === position.x && b.position.z === position.z
    );
  };

  return (
    <GameContext.Provider value={{ ...state, dispatch, canAfford, isOccupied, getBuildingAt }}>
      {children}
    </GameContext.Provider>
  );
};

export const useGame = (): GameContextType => {
  const context = useContext(GameContext);
  if (context === undefined) {
    throw new Error('useGame must be used within a GameProvider');
  }
  return context;
};