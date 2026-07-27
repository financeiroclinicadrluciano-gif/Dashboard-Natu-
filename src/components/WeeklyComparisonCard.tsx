import React from 'react';
import { WeeklyComparisonItem } from '../types';

interface WeeklyComparisonCardProps {
  items: WeeklyComparisonItem[];
}

export const WeeklyComparisonCard: React.FC<WeeklyComparisonCardProps> = ({ items }) => {
  return (
    <div className="bg-white border border-slate-200/90 rounded-2xl p-5 shadow-xs flex flex-col justify-between h-full">
      <div>
        <h3 className="text-sm font-extrabold text-slate-900 uppercase tracking-wider">
          COMPARATIVO SEMANAL
        </h3>
        <p className="text-xs text-slate-500 font-medium mt-0.5 mb-6">
          Indicadores de desempenho frente à semana anterior.
        </p>

        <div className="space-y-5">
          {items.map((item) => (
            <div key={item.id} className="space-y-1.5">
              <div className="flex items-center justify-between text-xs font-semibold text-slate-700">
                <span>{item.label}</span>
                <div className="flex items-center gap-1.5 font-bold">
                  <span className="text-slate-400 font-normal">{item.previousValue}</span>
                  <span className="text-slate-400 font-normal">→</span>
                  <span className="text-slate-900">{item.currentValue}</span>
                </div>
              </div>

              {/* Progress bar matching the screenshot style */}
              <div className="w-full bg-slate-100 rounded-full h-2.5 overflow-hidden p-0.5 border border-slate-200/60">
                <div
                  className="h-1.5 rounded-full transition-all duration-500"
                  style={{
                    width: `${item.percentFill}%`,
                    backgroundColor: item.color
                  }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
