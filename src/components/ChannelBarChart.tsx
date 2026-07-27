import React from 'react';
import { ChannelData } from '../types';
import { BarChart2, ExternalLink } from 'lucide-react';

interface ChannelBarChartProps {
  channels: ChannelData[];
}

export const ChannelBarChart: React.FC<ChannelBarChartProps> = ({ channels }) => {
  const maxVisits = Math.max(...channels.map((c) => c.visitas));

  return (
    <div className="bg-slate-800/80 border border-slate-700/70 rounded-2xl p-5 shadow-sm">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-base font-bold text-white flex items-center gap-2">
            <BarChart2 className="h-4 w-4 text-emerald-400" />
            Canais de Aquisição & Conversão
          </h3>
          <p className="text-xs text-slate-400">Origem de tráfego e taxa de conversão</p>
        </div>
        <span className="text-xs text-emerald-400 font-semibold bg-emerald-500/10 px-2.5 py-1 rounded-full border border-emerald-500/20">
          Alta Conversão: E-mail
        </span>
      </div>

      <div className="space-y-3.5">
        {channels.map((ch) => {
          const fillWidth = (ch.visitas / maxVisits) * 100;
          return (
            <div key={ch.channel} className="space-y-1.5">
              <div className="flex items-center justify-between text-xs">
                <span className="font-medium text-slate-200 truncate">{ch.channel}</span>
                <div className="flex items-center gap-3 shrink-0">
                  <span className="text-slate-400">{ch.visitas.toLocaleString('pt-BR')} visitas</span>
                  <span className="font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded text-[11px]">
                    {ch.taxa}% conv.
                  </span>
                </div>
              </div>

              {/* Progress bar */}
              <div className="w-full bg-slate-900/60 rounded-full h-2 overflow-hidden flex items-center p-0.5">
                <div
                  className="h-1.5 rounded-full bg-gradient-to-r from-blue-500 to-emerald-400 transition-all duration-500"
                  style={{ width: `${fillWidth}%` }}
                />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
