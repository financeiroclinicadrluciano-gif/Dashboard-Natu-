import React from 'react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer
} from 'recharts';
import { DailyLeadPoint } from '../types';

interface LeadsChartProps {
  data: DailyLeadPoint[];
}

export const LeadsChart: React.FC<LeadsChartProps> = ({ data }) => {
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-slate-900 text-white border border-slate-700 p-2.5 rounded-xl shadow-lg text-xs space-y-1">
          <p className="font-bold border-b border-slate-700 pb-1 mb-1">{label}</p>
          <p className="flex items-center gap-1.5 text-indigo-300 font-medium">
            <span className="w-2 h-2 rounded-full bg-indigo-400" />
            Leads Captados: <strong className="text-white">{payload[0].value}</strong>
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="bg-white border border-slate-200/90 rounded-2xl p-5 shadow-xs flex flex-col justify-between h-full">
      <div className="mb-4">
        <h3 className="text-sm font-extrabold text-slate-900 uppercase tracking-wider">
          LEADS RECEBIDOS POR DIA
        </h3>
        <p className="text-xs text-slate-500 font-medium mt-0.5">
          Distribuição diária de novos leads captados na semana corrente.
        </p>
      </div>

      <div className="h-[220px] w-full pt-2">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
            <defs>
              <linearGradient id="purpleLeadGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#6366f1" stopOpacity={0.25} />
                <stop offset="95%" stopColor="#6366f1" stopOpacity={0.0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
            <XAxis
              dataKey="day"
              stroke="#94a3b8"
              fontSize={11}
              tickLine={false}
              axisLine={false}
            />
            <YAxis
              stroke="#94a3b8"
              fontSize={11}
              tickLine={false}
              axisLine={false}
              ticks={[0, 30, 60, 90, 120]}
              domain={[0, 120]}
            />
            <Tooltip content={<CustomTooltip />} />
            <Area
              type="monotone"
              dataKey="leads"
              name="Leads"
              stroke="#6366f1"
              strokeWidth={3}
              fillOpacity={1}
              fill="url(#purpleLeadGradient)"
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};
