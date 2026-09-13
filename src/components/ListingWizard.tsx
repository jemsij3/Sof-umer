import React from 'react';
import { useApp } from '../lib/AppContext';
import { Check } from 'lucide-react';

export interface ListingWizardProps {
  currentStep: 1 | 2 | 3 | 4;
  onStepClick?: (step: 1 | 2 | 3 | 4) => void;
}

export const ListingWizard: React.FC<ListingWizardProps> = ({ currentStep, onStepClick }) => {
  const { t } = useApp();

  const steps: { step: 1 | 2 | 3 | 4; label: string; pct: number }[] = [
    { step: 1, label: t('wizard.step_type') || 'Type', pct: 25 },
    { step: 2, label: t('wizard.step_details_media') || 'Details & Media', pct: 50 },
    { step: 3, label: t('wizard.step_pricing_logistics') || 'Pricing & Logistics', pct: 75 },
    { step: 4, label: t('wizard.step_preview_review') || 'Preview & Review', pct: 100 }
  ];

  const currentPercent = currentStep * 25;

  return (
    <div className="bg-[#101018] border-b border-white/10 px-4 sm:px-6 py-3.5 shrink-0 select-none">
      {/* Visual Progress Bar */}
      <div className="w-full bg-white/5 h-1.5 rounded-full overflow-hidden mb-3 relative">
        <div 
          className="h-full bg-gradient-to-r from-amber-500 to-amber-400 rounded-full transition-all duration-300 ease-out"
          style={{ width: `${currentPercent}%` }}
        />
      </div>

      {/* Steps List */}
      <div className="grid grid-cols-4 gap-1.5 sm:gap-3 text-center">
        {steps.map((s) => {
          const isActive = currentStep === s.step;
          const isCompleted = currentStep > s.step;
          const canClick = isCompleted && onStepClick;

          return (
            <button
              key={s.step}
              type="button"
              disabled={!canClick && !isActive}
              onClick={() => {
                if (canClick && onStepClick) {
                  onStepClick(s.step);
                }
              }}
              className={`flex flex-col items-center justify-center p-1.5 sm:p-2 rounded-xl transition-all ${
                canClick ? 'cursor-pointer hover:bg-white/5' : 'cursor-default'
              } ${isActive ? 'bg-amber-500/10 border border-amber-500/30 text-amber-400' : ''}`}
            >
              {/* Step indicator badge */}
              <div className="flex items-center gap-1.5">
                <span
                  className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-mono font-bold transition-all ${
                    isCompleted
                      ? 'bg-emerald-500 text-black'
                      : isActive
                      ? 'bg-amber-500 text-black ring-2 ring-amber-500/30'
                      : 'bg-white/10 text-white/40'
                  }`}
                >
                  {isCompleted ? <Check className="w-3 h-3 stroke-[3]" /> : s.step}
                </span>

                <span className={`text-[10px] sm:text-xs font-bold truncate ${
                  isActive ? 'text-amber-400' : isCompleted ? 'text-white/80' : 'text-white/40'
                }`}>
                  <span className="hidden sm:inline">Step {s.step}: </span>
                  {s.label}
                </span>
              </div>

              {/* Percentage */}
              <span className={`text-[9px] sm:text-[10px] font-mono mt-0.5 ${
                isActive ? 'text-amber-300/80 font-bold' : isCompleted ? 'text-emerald-400/80' : 'text-white/30'
              }`}>
                {s.pct}%
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default ListingWizard;

