import React from 'react';
import { FunnelStage } from '../types';

interface FunnelWidgetProps {
  stages: FunnelStage[];
}

export const FunnelWidget: React.FC<FunnelWidgetProps> = ({ stages }) => {
  return (
    <div className="bg-white border border-slate-200/90 rounded-2xl p-5 shadow-xs flex flex-col justify-between h-full">
      <div>
        <h3 className="text-sm font-extrabold text-slate-900 uppercase tracking-wider">
          FUNIL COMERCIAL DE CONSULTAS
        </h3>
        <p className="text-xs text-slate-500 font-medium mt-0.5 mb-5">
          Detalhamento das etapas de fechamento da jornada do paciente.
        </p>

        <div className="space-y-3">
          {stages.map((stage) => (
            <div
              key={stage.id}
              className="bg-slate-50/80 border border-slate-200/80 rounded-2xl p-3.5 flex items-center justify-between gap-3 hover:bg-slate-100/80 transition-colors"
            >
              <div className="flex items-center gap-3">
                {/* Thick color accent indicator bar */}
                <div
                  className="w-1.5 h-10 rounded-full shrink-0"
                  style={{ backgroundColor: stage.accentColor }}
                />
                <div>
                  <h4 className="text-sm font-bold text-slate-900">
                    {stage.title}
                  </h4>
                  <p className="text-xs font-medium text-slate-400 mt-0.5">
                    {stage.consultasCount} Consultas • {stage.fechamentosCount} Fechamentos
                  </p>
                </div>
              </div>

              {/* Conversion pill */}
              <div className="bg-white border border-slate-200 px-3 py-1.5 rounded-xl shadow-2xs">
                <span
                  className="text-xs font-extrabold"
                  style={{ color: stage.accentColor }}
                >
                  {stage.conversionPercent}% Conversão
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
