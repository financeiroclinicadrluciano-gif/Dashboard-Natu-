import React from 'react';
import { DollarSign } from 'lucide-react';

interface FinancialSummaryCardProps {
  receitaFechada: number;
  receitaAberta: number;
  ticketMedio: number;
}

export const FinancialSummaryCard: React.FC<FinancialSummaryCardProps> = ({
  receitaFechada,
  receitaAberta,
  ticketMedio
}) => {
  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
      minimumFractionDigits: 2,
    }).format(val);
  };

  return (
    <div className="flex flex-col gap-4 h-full">
      {/* Main Green Card - RECEITA FECHADA */}
      <div className="bg-[#00b069] rounded-2xl p-6 text-white shadow-md flex flex-col justify-between relative overflow-hidden flex-1 min-h-[160px]">
        {/* Top Header */}
        <div className="flex items-start justify-between">
          <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-100">
            RECEITA FECHADA (VENDAS)
          </span>
          <div className="bg-white/20 p-2 rounded-xl backdrop-blur-xs shrink-0">
            <DollarSign className="h-5 w-5 text-white" />
          </div>
        </div>

        {/* Amount */}
        <div className="my-3">
          <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight">
            {formatCurrency(receitaFechada)}
          </h2>
        </div>

        {/* Subtitle */}
        <p className="text-xs font-medium text-emerald-100/90">
          Total bruto consolidado de tratamentos assinados e formalizados.
        </p>
      </div>

      {/* Bottom Sub-cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* Receita Aberta */}
        <div className="bg-white border border-slate-200/90 rounded-2xl p-4 shadow-xs">
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
            RECEITA ABERTA (NEGOCIAÇÃO)
          </span>
          <h4 className="text-xl font-extrabold text-indigo-600">
            {formatCurrency(receitaAberta)}
          </h4>
        </div>

        {/* Ticket Médio */}
        <div className="bg-white border border-slate-200/90 rounded-2xl p-4 shadow-xs">
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
            TICKET MÉDIO GERAL
          </span>
          <h4 className="text-xl font-extrabold text-slate-900">
            {formatCurrency(ticketMedio)}
          </h4>
        </div>
      </div>
    </div>
  );
};
