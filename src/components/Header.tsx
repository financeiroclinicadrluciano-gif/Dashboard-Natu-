import React from 'react';
import { PeriodOption } from '../types';
import { PlusCircle, Sparkles, Download, RefreshCw, Calendar, Search } from 'lucide-react';

interface HeaderProps {
  selectedPeriod: PeriodOption;
  onPeriodChange: (period: PeriodOption) => void;
  onOpenAddModal: () => void;
  onExportData: () => void;
  onRefreshData: () => void;
  onTriggerAiAnalysis: () => void;
  isAiAnalyzing: boolean;
  searchTerm: string;
  onSearchChange: (value: string) => void;
}

export const Header: React.FC<HeaderProps> = ({
  selectedPeriod,
  onPeriodChange,
  onOpenAddModal,
  onExportData,
  onRefreshData,
  onTriggerAiAnalysis,
  isAiAnalyzing,
  searchTerm,
  onSearchChange
}) => {
  return (
    <header className="bg-white border-b border-slate-200/80 px-4 lg:px-8 py-4 sticky top-0 z-30 shadow-xs">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-center justify-between gap-4">
        
        {/* Brand & Subtitle */}
        <div className="flex items-center gap-3.5">
          <div className="h-11 w-11 rounded-2xl bg-indigo-600 text-white font-extrabold text-xl flex items-center justify-center shadow-md shadow-indigo-600/20 shrink-0">
            N
          </div>
          <div>
            <div className="flex items-center gap-2.5 flex-wrap">
              <h1 className="text-xl font-extrabold text-slate-900 tracking-tight">
                Natuamed Spa
              </h1>
              <span className="px-2.5 py-0.5 rounded-full bg-indigo-100 text-indigo-700 font-bold text-[11px] tracking-wide uppercase border border-indigo-200/60">
                Performance {selectedPeriod.toLowerCase()}
              </span>
            </div>
            <p className="text-xs font-medium text-slate-500 mt-0.5">
              Análise executiva de captação, agendamentos e conversões comerciais
            </p>
          </div>
        </div>

        {/* Global Search Bar */}
        <div className="flex-1 max-w-sm mx-0 md:mx-2">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => onSearchChange(e.target.value)}
              placeholder="Buscar paciente, código ou procedimento..."
              className="w-full pl-9 pr-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-500 transition-all"
            />
          </div>
        </div>

        {/* Actions & Status */}
        <div className="flex items-center gap-2 flex-wrap justify-between md:justify-end">
          
          {/* Status Indicator */}
          <div className="flex items-center gap-1.5 text-[11px] font-bold text-slate-500 uppercase tracking-wider bg-slate-100 px-3 py-1.5 rounded-xl border border-slate-200">
            <span>PERÍODO ATUAL</span>
            <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
          </div>

          {/* Period Selector */}
          <div className="flex items-center bg-slate-100 p-1 rounded-xl border border-slate-200 text-xs font-semibold">
            {(['SEMANAL', 'MENSAL', 'ANUAL'] as PeriodOption[]).map((period) => (
              <button
                key={period}
                onClick={() => onPeriodChange(period)}
                className={`px-2.5 py-1 rounded-lg transition-all cursor-pointer ${
                  selectedPeriod === period
                    ? 'bg-white text-indigo-700 shadow-xs font-bold'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                {period}
              </button>
            ))}
          </div>

          {/* AI Insights Button */}
          <button
            onClick={onTriggerAiAnalysis}
            disabled={isAiAnalyzing}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold bg-amber-50 hover:bg-amber-100 text-amber-800 border border-amber-200 transition-all cursor-pointer disabled:opacity-50"
            title="Análise IA com diagnóstico executivo"
          >
            <Sparkles className={`h-3.5 w-3.5 text-amber-600 ${isAiAnalyzing ? 'animate-spin' : ''}`} />
            <span className="hidden sm:inline">IA Insights</span>
          </button>

          {/* Export Button */}
          <button
            onClick={onExportData}
            className="p-1.5 text-slate-600 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 border border-slate-200 rounded-xl transition-colors cursor-pointer"
            title="Exportar dados em CSV"
          >
            <Download className="h-4 w-4" />
          </button>

          {/* Refresh */}
          <button
            onClick={onRefreshData}
            className="p-1.5 text-slate-600 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 border border-slate-200 rounded-xl transition-colors cursor-pointer"
            title="Atualizar painel"
          >
            <RefreshCw className="h-4 w-4" />
          </button>

          {/* New Patient / Consultation Modal button */}
          <button
            onClick={onOpenAddModal}
            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-bold bg-indigo-600 hover:bg-indigo-700 text-white shadow-sm shadow-indigo-600/30 transition-all cursor-pointer active:scale-95"
          >
            <PlusCircle className="h-4 w-4" />
            <span>Novo Agendamento</span>
          </button>

        </div>

      </div>
    </header>
  );
};
