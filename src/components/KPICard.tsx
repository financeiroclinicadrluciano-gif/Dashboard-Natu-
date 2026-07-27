import React from 'react';
import { SpaKPICardData } from '../types';
import { Users, Calendar, CheckCircle2, Scale, TrendingUp, TrendingDown } from 'lucide-react';

interface KPICardProps {
  kpi: SpaKPICardData;
}

export const KPICard: React.FC<KPICardProps> = ({ kpi }) => {
  const getIcon = () => {
    switch (kpi.icon) {
      case 'users':
        return <Users className="h-4 w-4 text-indigo-600" />;
      case 'calendar':
        return <Calendar className="h-4 w-4 text-amber-600" />;
      case 'check':
        return <CheckCircle2 className="h-4 w-4 text-rose-600" />;
      case 'scale':
      default:
        return <Scale className="h-4 w-4 text-emerald-600" />;
    }
  };

  const getIconBg = () => {
    switch (kpi.colorTheme) {
      case 'violet':
        return 'bg-indigo-50 border-indigo-100';
      case 'orange':
        return 'bg-amber-50 border-amber-100';
      case 'rose':
        return 'bg-rose-50 border-rose-100';
      case 'emerald':
      default:
        return 'bg-emerald-50 border-emerald-100';
    }
  };

  const isConversionCard = kpi.title === 'CONVERSÃO GERAL';

  return (
    <div className="bg-white border border-slate-200/90 rounded-2xl p-5 shadow-xs hover:shadow-md transition-all duration-200">
      <div className="flex items-start justify-between">
        <div>
          <span className="text-[11px] font-bold text-slate-400 tracking-wider uppercase">
            {kpi.title}
          </span>
          <div className="mt-2">
            <h3
              className={`text-3xl font-extrabold tracking-tight ${
                isConversionCard ? 'text-emerald-600' : 'text-slate-900'
              }`}
            >
              {kpi.value}
            </h3>
          </div>
        </div>

        <div className={`p-2.5 rounded-xl border ${getIconBg()} shrink-0`}>
          {getIcon()}
        </div>
      </div>

      {/* Trend badge at bottom */}
      <div className="mt-4 flex items-center gap-1.5 text-xs font-semibold">
        {kpi.isPositive ? (
          <span className="inline-flex items-center gap-1 text-emerald-600 font-bold">
            <TrendingUp className="h-3.5 w-3.5" />
            +{kpi.changePercent}%
          </span>
        ) : (
          <span className="inline-flex items-center gap-1 text-rose-600 font-bold">
            <TrendingDown className="h-3.5 w-3.5" />
            {kpi.changePercent}%
          </span>
        )}
        <span className="text-slate-400 font-normal">{kpi.timeframe}</span>
      </div>
    </div>
  );
};
