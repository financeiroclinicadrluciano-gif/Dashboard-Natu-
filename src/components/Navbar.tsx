import React from 'react';
import { LayoutDashboard, PlusCircle, Download, RefreshCw, Calendar, Search, Bell, Sparkles } from 'lucide-react';

interface NavbarProps {
  onOpenAddModal: () => void;
  onExportData: () => void;
  onRefreshData: () => void;
  searchTerm: string;
  onSearchChange: (value: string) => void;
  isAiAnalyzing?: boolean;
  onTriggerAiAnalysis?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  onOpenAddModal,
  onExportData,
  onRefreshData,
  searchTerm,
  onSearchChange,
  isAiAnalyzing,
  onTriggerAiAnalysis
}) => {
  const currentDateFormatted = new Intl.DateTimeFormat('pt-BR', {
    dateStyle: 'full'
  }).format(new Date());

  return (
    <header className="sticky top-0 z-30 bg-slate-900/95 backdrop-blur border-b border-slate-800 text-slate-100 px-4 lg:px-8 py-3.5 transition-all">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-center md:justify-between gap-3">
        
        {/* Brand & Date */}
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-xl bg-gradient-to-tr from-indigo-600 to-blue-500 flex items-center justify-center text-white shadow-lg shadow-indigo-500/20 shrink-0">
            <LayoutDashboard className="h-5 w-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-bold tracking-tight text-white">Visual Dashboard</h1>
              <span className="text-xs px-2 py-0.5 rounded-full bg-indigo-500/10 text-indigo-400 font-medium border border-indigo-500/20">
                PRO
              </span>
            </div>
            <p className="text-xs text-slate-400 flex items-center gap-1.5 capitalize">
              <Calendar className="h-3.5 w-3.5 text-slate-500" />
              {currentDateFormatted}
            </p>
          </div>
        </div>

        {/* Global Search Bar */}
        <div className="flex-1 max-w-md mx-0 md:mx-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => onSearchChange(e.target.value)}
              placeholder="Buscar por cliente, pedido, categoria..."
              className="w-full pl-9 pr-4 py-2 bg-slate-800/80 border border-slate-700/80 rounded-xl text-sm text-slate-200 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 transition-all"
            />
            {searchTerm && (
              <button
                onClick={() => onSearchChange('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-slate-400 hover:text-slate-200"
              >
                Limpar
              </button>
            )}
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-2 flex-wrap">
          {onTriggerAiAnalysis && (
            <button
              onClick={onTriggerAiAnalysis}
              disabled={isAiAnalyzing}
              className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold bg-gradient-to-r from-amber-500/20 to-orange-500/20 hover:from-amber-500/30 hover:to-orange-500/30 text-amber-300 border border-amber-500/30 transition-all cursor-pointer disabled:opacity-50"
              title="Gerar Análise IA com insights de mercado"
            >
              <Sparkles className={`h-3.5 w-3.5 text-amber-400 ${isAiAnalyzing ? 'animate-spin' : ''}`} />
              <span>{isAiAnalyzing ? 'Analisando...' : 'IA Insights'}</span>
            </button>
          )}

          <button
            onClick={onRefreshData}
            className="p-2 text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-xl transition-colors cursor-pointer"
            title="Atualizar Dados"
          >
            <RefreshCw className="h-4 w-4" />
          </button>

          <button
            onClick={onExportData}
            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-medium bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition-colors cursor-pointer"
            title="Exportar Relatório em CSV"
          >
            <Download className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">Exportar CSV</span>
          </button>

          <button
            onClick={onOpenAddModal}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold bg-indigo-600 hover:bg-indigo-500 text-white shadow-md shadow-indigo-600/30 transition-all cursor-pointer active:scale-95"
          >
            <PlusCircle className="h-4 w-4" />
            <span>Nova Venda</span>
          </button>
        </div>

      </div>
    </header>
  );
};
