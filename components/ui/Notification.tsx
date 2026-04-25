

import React, { useEffect } from 'react';
import { useGameLogic } from '../../hooks/useGameLogic';
import { useLanguage } from '../../context/LanguageContext'; // To access t for close button if needed

const Notification: React.FC = () => {
  const { uiMessage, clearMessage, gameOver, messageKey } = useGameLogic(); // Use uiMessage
  const { t } = useLanguage();

  useEffect(() => {
    let timer: number | undefined; 
    // Don't auto-clear game over messages or mandate completion messages
    const isCriticalMessage = messageKey?.startsWith('GAME_OVER') || messageKey?.startsWith('MANDATE_');
    const isHappinessDropMessage = messageKey?.startsWith('HAPPINESS_DROP_');
    
    if (uiMessage && !isCriticalMessage) { 
      timer = window.setTimeout(() => {
        clearMessage();
      }, isHappinessDropMessage ? 5000 : 4000); // Happiness tips stay a bit longer
    }
    return () => {
      if (timer) window.clearTimeout(timer); 
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [uiMessage, gameOver, messageKey]); 

  if (!uiMessage) return null;

  let bgColor = 'bg-slate-700 text-white'; // Default color with white text
  // Use messageKey for styling if available, otherwise parse uiMessage (less reliable)
  const keyForStyling = messageKey || '';

  if (keyForStyling.startsWith('GAME_OVER') || keyForStyling.startsWith('MANDATE_')) {
    bgColor = 'bg-red-600 text-white'; // Critical game state messages
     if (keyForStyling.startsWith('MANDATE_')) bgColor = 'bg-sky-600 text-white'; // Mandate completion
  } else if (keyForStyling.startsWith('HAPPINESS_DROP_')) {
    // Other happiness drop warnings get orange
    bgColor = 'bg-orange-500 text-white'; 
  } else if (keyForStyling.includes('BUILT')) {
    bgColor = 'bg-green-600 text-white';
  } else if (keyForStyling.includes('NOT_ENOUGH_MONEY') || keyForStyling.includes('OCCUPIED') || keyForStyling.includes('CANNOT_BUILD') || keyForStyling.includes('ONLY_ROADS')) {
    // These are warnings/errors that are not happiness related directly but indicate issues
    bgColor = 'bg-yellow-600 text-slate-900';
  }
  // If a happiness drop key was specifically excluded (like a removed 'HAPPINESS_DROP_UNMET_HOUSING'), it would use the default bgColor.

  return (
    <div 
      className={`fixed bottom-4 right-4 ${bgColor} p-4 rounded-lg shadow-xl z-50 animate-fadeInUp max-w-sm`}
      role="alert"
      aria-live="assertive"
    >
      <p>{uiMessage}</p>
      {/* Show close button for non-critical messages or if messageKey indicates it's closable */}
      { (uiMessage && !keyForStyling.startsWith("GAME_OVER") && !keyForStyling.startsWith("MANDATE_")) && (
         <button 
            onClick={clearMessage} 
            className="absolute top-1 right-2 text-slate-200 hover:text-white text-lg font-mono"
            aria-label={t('CLOSE')}
          >
            &times;
          </button>
        )
      }
      <style>{`
        @keyframes fadeInUp {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fadeInUp { animation: fadeInUp 0.3s ease-out forwards; }
      `}</style>
    </div>
  );
};

export default Notification;