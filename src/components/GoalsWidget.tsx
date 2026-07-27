import React from 'react';
import { Goal } from '../types';
import { Target, CheckCircle2, AlertCircle } from 'lucide-react';

interface GoalsWidgetProps {
  goals: Goal[];
}

export const GoalsWidget: React.FC<GoalsWidgetProps> = ({ goals }) => {
  return (
    <div className="bg-slate-800/80 border border-slate-700/70 rounded-2xl p-5 shadow-sm">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-base font-bold text-white flex items-center gap-2">
            <Target className="h-4 w-4 text-amber-400" />
            Metas do Mês
          </h3>
          <p className="text-xs text-slate-400">Progresso de metas estratégicas</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {goals.map((goal) => {
          const isNearTarget = goal.progresso >= 90;

          return (
            <div
              key={goal.id}
              className="bg-slate-900/60 border border-slate-700/60 rounded-xl p-3.5 space-y-2.5"
            >
              <div className="flex items-start justify-between">
                <span className="text-xs font-semibold text-slate-200 line-clamp-1">
                  {goal.title}
                </span>
                {isNearTarget ? (
                  <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0" />
                ) : (
                  <AlertCircle className="h-4 w-4 text-amber-400 shrink-0" />
                )}
              </div>

              <div className="flex items-baseline justify-between text-xs">
                <span className="text-lg font-bold text-white">
                  {goal.unidade === 'R$'
                    ? `R$ ${goal.atual.toLocaleString('pt-BR')}`
                    : `${goal.atual} ${goal.unidade}`}
                </span>
                <span className="text-slate-400 font-medium">
                  meta: {goal.unidade === 'R$'
                    ? `R$ ${goal.meta.toLocaleString('pt-BR')}`
                    : `${goal.meta} ${goal.unidade}`}
                </span>
              </div>

              <div className="space-y-1">
                <div className="flex justify-between text-[11px] font-medium text-slate-400">
                  <span>Progresso</span>
                  <span className={isNearTarget ? 'text-emerald-400 font-bold' : 'text-amber-400 font-bold'}>
                    {goal.progresso}%
                  </span>
                </div>
                <div className="w-full bg-slate-800 rounded-full h-2 overflow-hidden">
                  <div
                    className={`h-2 rounded-full transition-all duration-500 ${
                      isNearTarget
                        ? 'bg-gradient-to-r from-emerald-500 to-teal-400'
                        : 'bg-gradient-to-r from-amber-500 to-orange-400'
                    }`}
                    style={{ width: `${Math.min(goal.progresso, 100)}%` }}
                  />
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
