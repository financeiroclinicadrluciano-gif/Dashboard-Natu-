import React, { useState } from 'react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend
} from 'recharts';
import { RevenueDataPoint } from '../types';
import { TrendingUp, DollarSign, Wallet, Percent } from 'lucide-react';

interface RevenueChartProps {
  data: RevenueDataPoint[];
  title?: string;
}

export const RevenueChart: React.FC<RevenueChartProps> = ({
  data,
  title = 'Evolução do Faturamento & Lucro'
}) => {
  const [activeMetric, setActiveMetric] = useState<'all' | 'receita' | 'lucro'>('all');

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
      maximumFractionDigits: 0
    }).format(value);
  };

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-slate-900/95 border border-slate-700/80 p-3.5 rounded-xl shadow-xl text-xs space-y-1.5 backdrop-blur">
          <p className="font-bold text-slate-200 border-b border-slate-800 pb-1 mb-1">{label}</p>
          {payload.map((entry: any, index: number) => (
            <div key={`item-${index}`} className="flex items-center justify-between gap-4">
              <span className="flex items-center gap-1.5 text-slate-400">
                <span
                  className="w-2.5 h-2.5 rounded-full"
                  style={{ backgroundColor: entry.color }}
                />
                {entry.name}:
              </span>
              <span className="font-semibold text-slate-100">
                {formatCurrency(entry.value)}
              </span>
            </div>
          ))}
        </div>
      );
    }
    return null;
  };

  return (
    <div className="bg-slate-800/80 border border-slate-700/70 rounded-2xl p-5 shadow-sm">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
        <div>
          <h3 className="text-base font-bold text-white flex items-center gap-2">
            <TrendingUp className="h-4 w-4 text-indigo-400" />
            {title}
          </h3>
          <p className="text-xs text-slate-400">
            Comparativo entre receita bruta, custos operacionais e lucro líquido
          </p>
        </div>

        {/* View Toggle */}
        <div className="flex items-center bg-slate-900/80 p-1 rounded-xl border border-slate-800 text-xs">
          <button
            onClick={() => setActiveMetric('all')}
            className={`px-2.5 py-1 rounded-lg font-medium transition-all cursor-pointer ${
              activeMetric === 'all'
                ? 'bg-indigo-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Todos
          </button>
          <button
            onClick={() => setActiveMetric('receita')}
            className={`px-2.5 py-1 rounded-lg font-medium transition-all cursor-pointer ${
              activeMetric === 'receita'
                ? 'bg-indigo-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Receita
          </button>
          <button
            onClick={() => setActiveMetric('lucro')}
            className={`px-2.5 py-1 rounded-lg font-medium transition-all cursor-pointer ${
              activeMetric === 'lucro'
                ? 'bg-indigo-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Lucro
          </button>
        </div>
      </div>

      <div className="h-[300px] w-full">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
            <defs>
              <linearGradient id="colorReceita" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#6366f1" stopOpacity={0.4} />
                <stop offset="95%" stopColor="#6366f1" stopOpacity={0.0} />
              </linearGradient>
              <linearGradient id="colorLucro" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#10b981" stopOpacity={0.4} />
                <stop offset="95%" stopColor="#10b981" stopOpacity={0.0} />
              </linearGradient>
              <linearGradient id="colorCustos" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#f43f5e" stopOpacity={0.2} />
                <stop offset="95%" stopColor="#f43f5e" stopOpacity={0.0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#334155" opacity={0.5} vertical={false} />
            <XAxis
              dataKey="date"
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
              tickFormatter={(value) => `R$ ${(value / 1000).toFixed(0)}k`}
            />
            <Tooltip content={<CustomTooltip />} />
            <Legend
              wrapperStyle={{ paddingTop: 15, fontSize: 12, color: '#94a3b8' }}
              iconType="circle"
            />
            
            {(activeMetric === 'all' || activeMetric === 'receita') && (
              <Area
                type="monotone"
                dataKey="receita"
                name="Receita Bruta"
                stroke="#6366f1"
                strokeWidth={2.5}
                fillOpacity={1}
                fill="url(#colorReceita)"
              />
            )}

            {(activeMetric === 'all' || activeMetric === 'lucro') && (
              <Area
                type="monotone"
                dataKey="lucro"
                name="Lucro Líquido"
                stroke="#10b981"
                strokeWidth={2.5}
                fillOpacity={1}
                fill="url(#colorLucro)"
              />
            )}

            {activeMetric === 'all' && (
              <Area
                type="monotone"
                dataKey="custos"
                name="Custos Operacionais"
                stroke="#f43f5e"
                strokeWidth={1.5}
                strokeDasharray="4 4"
                fillOpacity={1}
                fill="url(#colorCustos)"
              />
            )}
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};
