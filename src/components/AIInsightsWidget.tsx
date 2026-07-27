import React from 'react';
import { Sparkles, Lightbulb } from 'lucide-react';

interface AIInsightsWidgetProps {
  insightsText: string | null;
  isLoading: boolean;
  onGenerate: () => void;
}

export const AIInsightsWidget: React.FC<AIInsightsWidgetProps> = ({
  insightsText,
  isLoading,
  onGenerate
}) => {
  return (
    <div className="bg-gradient-to-r from-indigo-900 via-indigo-950 to-slate-900 border border-indigo-700/50 rounded-2xl p-5 shadow-sm text-white relative overflow-hidden">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-3">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-xl bg-amber-500/20 text-amber-300 border border-amber-500/30">
            <Sparkles className="h-4 w-4 text-amber-400 animate-pulse" />
          </div>
          <div>
            <h3 className="text-sm font-extrabold text-white uppercase tracking-wider">
              Diagnóstico Estratégico IA - Natuamed Spa
            </h3>
            <p className="text-xs text-indigo-200/80 font-medium">
              Análise em tempo real de captação de leads, comparcimento e otimização do ticket médio
            </p>
          </div>
        </div>

        <button
          onClick={onGenerate}
          disabled={isLoading}
          className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-xs font-extrabold bg-amber-400 hover:bg-amber-300 text-slate-950 shadow-md shadow-amber-400/20 transition-all cursor-pointer disabled:opacity-50 shrink-0"
        >
          <Sparkles className={`h-3.5 w-3.5 ${isLoading ? 'animate-spin' : ''}`} />
          <span>{isLoading ? 'Analisando Clínica...' : 'Gerar Novo Diagnóstico'}</span>
        </button>
      </div>

      {insightsText ? (
        <div className="bg-slate-900/90 border border-indigo-800/60 rounded-xl p-4 text-xs text-slate-200 leading-relaxed whitespace-pre-line font-mono">
          {insightsText}
        </div>
      ) : (
        <div className="bg-slate-900/40 border border-indigo-500/20 rounded-xl p-3.5 text-xs text-slate-300 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <Lightbulb className="h-4 w-4 text-amber-400 shrink-0" />
            <span>
              Clique em <strong>Gerar Novo Diagnóstico</strong> para receber análises da equipe comercial do Natuamed Spa com recomendações de follow-up e aumento da taxa de comparecimento.
            </span>
          </div>
        </div>
      )}
    </div>
  );
};
