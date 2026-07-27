import React from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import { CategoryDistribution } from '../types';
import { PieChart as PieIcon, Layers } from 'lucide-react';

interface CategoryPieChartProps {
  data: CategoryDistribution[];
}

export const CategoryPieChart: React.FC<CategoryPieChartProps> = ({ data }) => {
  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
      maximumFractionDigits: 0
    }).format(val);
  };

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const item = payload[0].payload;
      return (
        <div className="bg-slate-900/95 border border-slate-700 p-3 rounded-xl shadow-xl text-xs space-y-1">
          <p className="font-bold text-white flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: item.color }} />
            {item.name}
          </p>
          <p className="text-slate-300">
            Faturamento: <span className="font-semibold text-white">{formatCurrency(item.value)}</span>
          </p>
          <p className="text-slate-400">
            Participação: <span className="font-semibold text-indigo-400">{item.percent}%</span>
          </p>
        </div>
      );
    }
    return null;
  };

  const totalValue = data.reduce((acc, curr) => acc + curr.value, 0);

  return (
    <div className="bg-slate-800/80 border border-slate-700/70 rounded-2xl p-5 shadow-sm flex flex-col justify-between">
      <div>
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <PieIcon className="h-4 w-4 text-violet-400" />
              Vendas por Categoria
            </h3>
            <p className="text-xs text-slate-400">Distribuição do faturamento total</p>
          </div>
          <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-violet-500/10 text-violet-300 border border-violet-500/20">
            {data.length} Categorias
          </span>
        </div>

        {/* Chart */}
        <div className="h-[200px] w-full relative">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={data}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={85}
                paddingAngle={4}
                dataKey="value"
              >
                {data.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} stroke="#1e293b" strokeWidth={2} />
                ))}
              </Pie>
              <Tooltip content={<CustomTooltip />} />
            </PieChart>
          </ResponsiveContainer>
          <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
            <span className="text-xs text-slate-400">Total</span>
            <span className="text-sm font-bold text-white">
              {formatCurrency(totalValue)}
            </span>
          </div>
        </div>
      </div>

      {/* Legend list */}
      <div className="mt-4 pt-3 border-t border-slate-700/50 space-y-2">
        {data.map((cat) => (
          <div key={cat.name} className="flex items-center justify-between text-xs">
            <div className="flex items-center gap-2 truncate">
              <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: cat.color }} />
              <span className="text-slate-300 truncate">{cat.name}</span>
            </div>
            <div className="flex items-center gap-3 shrink-0">
              <span className="font-medium text-slate-400">{formatCurrency(cat.value)}</span>
              <span className="font-semibold text-slate-200 w-10 text-right">{cat.percent}%</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
