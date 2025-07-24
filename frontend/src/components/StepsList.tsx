import React from 'react';
import { CheckCircle, Circle, Clock } from 'lucide-react';
import { Step } from '../types';

interface StepsListProps {
  steps: Step[];
  currentStep: number;
  onStepClick: (stepId: number) => void;
}

export function StepsList({ steps, currentStep, onStepClick }: StepsListProps) {
  return (
    <div className="bg-[#0d1b2a] rounded-2xl shadow-xl p-5 h-full overflow-auto border border-[#25354a] backdrop-blur-xl">
      <h2 className="text-xl font-semibold mb-5 text-slate-100">🚀 Build Steps</h2>
      <div className="space-y-4">
        {steps.map((step, index) => {
          const isActive = currentStep === step.id;

          return (
            <div
              key={`${step.id}-${index}`}
              className={`
                relative group cursor-pointer p-3 rounded-2xl transition-all duration-300 border
                ${isActive
                  ? 'border-cyan-400 bg-[#1e293b]/60 shadow-cyan-500/20 scale-[1.01]'
                  : 'border-transparent hover:border-[#334155] hover:bg-[#1e293b]/40'}
              `}
              onClick={() => onStepClick(step.id)}
            >
              {/* Left gradient bar when active */}
              {isActive && (
                <div className="absolute left-0 top-0 h-full w-1 rounded-l-2xl bg-gradient-to-b from-[#8f75ff] to-[#7fdbff]" />
              )}

              <div className="flex items-center gap-3">
                {step.status === 'completed' ? (
                  <CheckCircle className="w-5 h-5 text-green-400" />
                ) : step.status === 'in-progress' ? (
                  <Clock className="w-5 h-5 text-cyan-400 animate-pulse drop-shadow-[0_0_4px_#7fdbff]" />
                ) : (
                  <Circle className="w-5 h-5 text-slate-600" />
                )}
                <h3 className="text-slate-100 font-medium">{step.title}</h3>
              </div>
              <p className="text-sm text-slate-400 mt-2">{step.description}</p>
            </div>
          );
        })}
      </div>
    </div>
  );
}
