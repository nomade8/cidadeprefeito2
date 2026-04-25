
import React from 'react';
import { useGameLogic } from '../../hooks/useGameLogic';
import { PolicyLevel, PoliciesState, TranslationKeys } from '../../types';
import Button from './Button';
import { 
    COMMERCE_TAX_CONFIG, 
    PROPERTY_TAX_CONFIG, 
    GREEN_INITIATIVES_MONTHLY_COST,
    GREEN_INITIATIVES_PARK_MAINTENANCE_MODIFIER,
    GREEN_INITIATIVES_GREEN_ENERGY_PRODUCTION_MODIFIER,
    GREEN_INITIATIVES_HAPPINESS_BONUS
} from '../../game/settings';
import { useLanguage, Language } from '../../context/LanguageContext';

interface PoliciesPanelProps {
  isOpen: boolean;
  onClose: () => void;
}

const PolicySection: React.FC<{ titleKey: TranslationKeys; descriptionKey: TranslationKeys; children: React.ReactNode }> = ({ titleKey, descriptionKey, children }) => {
  const { t } = useLanguage();
  return (
    <div className="mb-5 p-3.5 bg-slate-700/60 rounded-lg shadow">
      <h3 className="text-lg font-semibold text-sky-300 mb-1.5">{t(titleKey)}</h3>
      <p className="text-xs text-slate-300 mb-3 leading-relaxed">{t(descriptionKey)}</p>
      {children}
    </div>
  );
};

interface PolicyControlProps<T extends PolicyLevel | boolean> {
  labelKey: TranslationKeys;
  currentValue: T;
  options: { value: T; labelKey: TranslationKeys }[];
  onChange: (value: T) => void;
  effects: string[];
}

const PolicyControl: React.FC<PolicyControlProps<PolicyLevel | boolean>> = ({ labelKey, currentValue, options, onChange, effects }) => {
  const { t } = useLanguage();
  return (
    <div className="mb-2">
      <label className="block text-sm font-medium text-slate-200 mb-1">{t(labelKey)}</label>
      <div className="flex space-x-2 mb-1.5">
        {options.map(option => (
          <Button
            key={String(option.value)}
            onClick={() => onChange(option.value)}
            active={currentValue === option.value}
            variant={currentValue === option.value ? 'primary' : 'secondary'}
            size="sm"
            className="flex-grow justify-center"
          >
            {t(option.labelKey)}
          </Button>
        ))}
      </div>
      <div className="text-xs text-slate-400 space-y-0.5">
        {effects.map((effect, idx) => <p key={idx} dangerouslySetInnerHTML={{ __html: effect }}></p>)}
      </div>
    </div>
  );
};


const PoliciesPanel: React.FC<PoliciesPanelProps> = ({ isOpen, onClose }) => {
  const { policies, setPolicy, translate: t, currentLanguage } = useGameLogic();

  if (!isOpen) return null;

  const formatCurrency = (value: number) => {
    return currentLanguage === Language.PT_BR 
        ? `R$${value.toLocaleString('pt-BR')}` 
        : `$${value.toLocaleString('en-US')}`;
  };

  const getPolicyEffectsDisplay = (policy: keyof PoliciesState, level?: PolicyLevel): string[] => {
    const effects: string[] = [];
    if (policy === 'commerceTaxLevel' && level) {
        const config = COMMERCE_TAX_CONFIG[level];
        effects.push(t('POLICY_EFFECT_INCOME_MOD', { value: ((config.incomeModifier -1) * 100).toFixed(0)  }));
        effects.push(t('POLICY_EFFECT_HAPPINESS', { value: config.happinessEffect }));
    } else if (policy === 'propertyTaxLevel' && level) {
        const config = PROPERTY_TAX_CONFIG[level];
        effects.push(t('POLICY_EFFECT_TAX_RATE', {value: config.ratePercent.toFixed(1)}));
        effects.push(t('POLICY_EFFECT_HAPPINESS', { value: config.happinessEffect }));
    } else if (policy === 'greenInitiativesActive') {
        if (policies.greenInitiativesActive) {
            effects.push(t('POLICY_EFFECT_COST', { value: formatCurrency(GREEN_INITIATIVES_MONTHLY_COST) }));
            effects.push(t('POLICY_EFFECT_PARK_MAINT', { value: ((1 - GREEN_INITIATIVES_PARK_MAINTENANCE_MODIFIER) * 100).toFixed(0) }));
            effects.push(t('POLICY_EFFECT_GREEN_ENERGY', { value: ((GREEN_INITIATIVES_GREEN_ENERGY_PRODUCTION_MODIFIER - 1) * 100).toFixed(0) }));
            effects.push(t('POLICY_EFFECT_HAPPINESS', { value: GREEN_INITIATIVES_HAPPINESS_BONUS }));
        } else {
            effects.push(t('POLICY_EFFECT_COST', { value: formatCurrency(0) }));
        }
    }
    return effects;
  };


  return (
    <div
      className="fixed inset-0 bg-slate-900/80 backdrop-blur-md z-30 flex justify-center items-center p-2 sm:p-4 transition-opacity duration-300 ease-in-out"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-labelledby="policies-panel-title"
    >
      <div
        className="bg-slate-800 p-4 sm:p-5 md:p-6 rounded-xl shadow-2xl w-full max-w-lg md:max-w-xl max-h-[90vh] overflow-y-auto text-white ring-1 ring-slate-700/80"
        onClick={(e) => e.stopPropagation()}
        style={{ scrollbarWidth: 'thin', scrollbarColor: '#4A5568 #2D3748' }}
      >
        <div className="flex justify-between items-center mb-4 pb-3 border-b border-slate-700">
          <h2 id="policies-panel-title" className="text-xl md:text-2xl font-bold text-sky-400">
            {t('POLICIES_PANEL_TITLE')}
          </h2>
          <Button
            onClick={onClose}
            variant="secondary"
            size="sm"
            className="!p-2 leading-none bg-slate-700 hover:bg-slate-600"
            aria-label={t('CLOSE')}
          >
            &times;
          </Button>
        </div>

        <PolicySection titleKey="POLICY_NAME_COMMERCETAXLEVEL" descriptionKey="POLICY_COMMERCE_TAX_DESC">
          <PolicyControl
            labelKey={"POLICY_NAME_COMMERCETAXLEVEL"} // Not displayed, but good for consistency
            currentValue={policies.commerceTaxLevel}
            options={[
              { value: PolicyLevel.LOW, labelKey: 'POLICY_LEVEL_LOW' },
              { value: PolicyLevel.NORMAL, labelKey: 'POLICY_LEVEL_NORMAL' },
              { value: PolicyLevel.HIGH, labelKey: 'POLICY_LEVEL_HIGH' },
            ]}
            onChange={(value) => setPolicy('commerceTaxLevel', value as PolicyLevel)}
            effects={getPolicyEffectsDisplay('commerceTaxLevel', policies.commerceTaxLevel)}
          />
        </PolicySection>

        <PolicySection titleKey="POLICY_NAME_PROPERTYTAXLEVEL" descriptionKey="POLICY_PROPERTY_TAX_DESC">
           <PolicyControl
            labelKey={"POLICY_NAME_PROPERTYTAXLEVEL"}
            currentValue={policies.propertyTaxLevel}
            options={[
              { value: PolicyLevel.LOW, labelKey: 'POLICY_LEVEL_LOW' },
              { value: PolicyLevel.NORMAL, labelKey: 'POLICY_LEVEL_NORMAL' },
              { value: PolicyLevel.HIGH, labelKey: 'POLICY_LEVEL_HIGH' },
            ]}
            onChange={(value) => setPolicy('propertyTaxLevel', value as PolicyLevel)}
            effects={getPolicyEffectsDisplay('propertyTaxLevel', policies.propertyTaxLevel)}
          />
        </PolicySection>

        <PolicySection titleKey="POLICY_NAME_GREENINITIATIVESACTIVE" descriptionKey="POLICY_GREEN_INITIATIVES_DESC">
          <PolicyControl
            labelKey={"POLICY_NAME_GREENINITIATIVESACTIVE"}
            currentValue={policies.greenInitiativesActive}
            options={[
              { value: true, labelKey: 'POLICY_STATUS_ACTIVE' },
              { value: false, labelKey: 'POLICY_STATUS_INACTIVE' },
            ]}
            onChange={(value) => setPolicy('greenInitiativesActive', value as boolean)}
            effects={getPolicyEffectsDisplay('greenInitiativesActive')}
          />
        </PolicySection>
        
        <p className="text-xs text-slate-400 mt-4 italic text-center">
            {t('POLICY_EFFECTS_APPLY_NEXT_MONTH')} 
        </p>

      </div>
    </div>
  );
};

export default PoliciesPanel;

// Add this new key to your locale files (en.ts and ptBR.ts)
// 'POLICY_EFFECTS_APPLY_NEXT_MONTH': "Policy changes will take full effect starting next month."
// 'POLICY_EFFECTS_APPLY_NEXT_MONTH': "Alterações nas políticas terão efeito total a partir do próximo mês."
