import React from 'react';
import { DateRange, Category } from '../types';
import { Filter, SlidersHorizontal, Layers } from 'lucide-react';

interface FilterBarProps {
  selectedRange: DateRange;
  onRangeChange: (range: DateRange) => void;
  selectedCategory: Category | 'Todas';
  onCategoryChange: (category: Category | 'Todas') => void;
  totalRecordsCount: number;
}

const categories: (Category | 'Todas')[] = [
  'Todas',
  'Eletrônicos',
  'Vestuário',
  'Alimentos & Bebidas',
  'Casa & Decoração',
  'Serviços'
];

export const FilterBar: React.FC<FilterBarProps> = ({
  selectedRange,
  onRangeChange,
  selectedCategory,
  onCategoryChange,
  totalRecordsCount
}) => {
  return (
    <div className="bg-slate-800/60 border border-slate-700/60 rounded-2xl p-4 flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
      
      {/* Date Range Selector Pills */}
      <div className="flex items-center gap-1.5 bg-slate-900/80 p-1.5 rounded-xl border border-slate-800 overflow-x-auto">
        <span className="text-xs text-slate-400 font-medium px-2 flex items-center gap-1 shrink-0">
          <Filter className="h-3.5 w-3.5 text-indigo-400" /> Período:
        </span>
        <button
          onClick={() => onRangeChange('7d')}
          className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all whitespace-nowrap cursor-pointer ${
            selectedRange === '7d'
              ? 'bg-indigo-600 text-white shadow-sm'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
          }`}
        >
          Últimos 7 dias
        </button>
        <button
          onClick={() => onRangeChange('30d')}
          className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all whitespace-nowrap cursor-pointer ${
            selectedRange === '30d'
              ? 'bg-indigo-600 text-white shadow-sm'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
          }`}
        >
          Últimos 30 dias
        </button>
        <button
          onClick={() => onRangeChange('90d')}
          className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all whitespace-nowrap cursor-pointer ${
            selectedRange === '90d'
              ? 'bg-indigo-600 text-white shadow-sm'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
          }`}
        >
          Últimos 90 dias
        </button>
        <button
          onClick={() => onRangeChange('1y')}
          className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all whitespace-nowrap cursor-pointer ${
            selectedRange === '1y'
              ? 'bg-indigo-600 text-white shadow-sm'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
          }`}
        >
          Este Ano
        </button>
      </div>

      {/* Category Dropdown and Status badge */}
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-2">
          <Layers className="h-4 w-4 text-slate-400" />
          <span className="text-xs text-slate-400 hidden sm:inline">Categoria:</span>
          <select
            value={selectedCategory}
            onChange={(e) => onCategoryChange(e.target.value as Category | 'Todas')}
            className="bg-slate-900 border border-slate-700/80 text-slate-200 text-xs font-medium rounded-xl px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 cursor-pointer"
          >
            {categories.map((cat) => (
              <option key={cat} value={cat}>
                {cat === 'Todas' ? 'Todas as Categorias' : cat}
              </option>
            ))}
          </select>
        </div>

        <div className="text-xs text-slate-400 bg-slate-900/50 px-3 py-2 rounded-xl border border-slate-800 flex items-center gap-1.5">
          <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
          <span>{totalRecordsCount} registros exibidos</span>
        </div>
      </div>

    </div>
  );
};
