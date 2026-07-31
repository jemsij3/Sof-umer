import React from 'react';
import { useApp } from '../lib/AppContext';
import { Check } from 'lucide-react';

interface ListingWizardProps {
  currentStep: number;
  onStepClick?: (step: number) => void;
}

export const ListingWizard: React.FC<ListingWizardProps> = ({ currentStep, onStepClick }) => {
  const { t } = useApp();

  const steps = [
    { step: 1, key: 'wizard.step_category', fallback: 'Category' },
    { step: 2, key: 'wizard.step_subcategory', fallback: 'Subcategory' },
    { step: 3, key: 'wizard.step_details_photos', fallback: 'Details & Photos' },
    { step: 4, key: 'wizard.step_preview_ad', fallback: 'Preview Ad' },
    { step: 5, key: 'wizard.step_boost_pay', fallback: 'Boost & Pay' }
  ];

  return (
    <div className="bg-zinc-900/80 border-b border-white/5 px-6 py-3 flex items-center justify-between overflow-x-auto text-[11px] shrink-0 scrollbar-none">
      {steps.map((s) => {
        const isActive = currentStep === s.step;
        const isCompleted = currentStep > s.step;
        const title = t(s.key) || s.fallback;

        return (
          <button
            key={s.step}
            type="button"
            onClick={() => {
              if (s.step < currentStep && onStepClick) {
                onStepClick(s.step);
              }
            }}
            disabled={s.step > currentStep}
            className={`flex items-center gap-1.5 font-bold uppercase tracking-wider px-2 py-1 rounded-lg transition whitespace-nowrap cursor-pointer ${
              isActive
                ? 'text-amber-400 bg-amber-500/10 border border-amber-500/30'
                : isCompleted
                ? 'text-emerald-400 hover:text-white'
                : 'text-white/30 cursor-not-allowed'
            }`}
          >
            {isCompleted ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : null}
            <span>{s.step}. {title}</span>
          </button>
        );
      })}
    </div>
  );
};

export default ListingWizard;
