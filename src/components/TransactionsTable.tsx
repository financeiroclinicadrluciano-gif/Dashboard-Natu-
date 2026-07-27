import React, { useState } from 'react';
import { Transaction, TransactionStatus, Category } from '../types';
import {
  Search,
  Filter,
  ArrowUpDown,
  Eye,
  CheckCircle,
  Clock,
  XCircle,
  ChevronLeft,
  ChevronRight,
  Receipt,
  Trash2
} from 'lucide-react';

interface TransactionsTableProps {
  transactions: Transaction[];
  onDeleteTransaction: (id: string) => void;
  onUpdateStatus: (id: string, newStatus: TransactionStatus) => void;
}

export const TransactionsTable: React.FC<TransactionsTableProps> = ({
  transactions,
  onDeleteTransaction,
  onUpdateStatus
}) => {
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('Todas');
  const [selectedStatus, setSelectedStatus] = useState<string>('Todos');
  const [sortField, setSortField] = useState<'data' | 'valor' | 'cliente'>('data');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedTransaction, setSelectedTransaction] = useState<Transaction | null>(null);

  const itemsPerPage = 5;

  // Filtering
  const filtered = transactions.filter((tx) => {
    const matchesSearch =
      tx.cliente.toLowerCase().includes(search.toLowerCase()) ||
      tx.codigo.toLowerCase().includes(search.toLowerCase()) ||
      tx.email.toLowerCase().includes(search.toLowerCase());

    const matchesCategory =
      selectedCategory === 'Todas' || tx.categoria === selectedCategory;

    const matchesStatus =
      selectedStatus === 'Todos' || tx.status === selectedStatus;

    return matchesSearch && matchesCategory && matchesStatus;
  });

  // Sorting
  const sorted = [...filtered].sort((a, b) => {
    if (sortField === 'valor') {
      return sortOrder === 'asc' ? a.valor - b.valor : b.valor - a.valor;
    } else if (sortField === 'cliente') {
      return sortOrder === 'asc'
        ? a.cliente.localeCompare(b.cliente)
        : b.cliente.localeCompare(a.cliente);
    } else {
      // data
      return sortOrder === 'asc'
        ? new Date(a.data).getTime() - new Date(b.data).getTime()
        : new Date(b.data).getTime() - new Date(a.data).getTime();
    }
  });

  // Pagination
  const totalPages = Math.ceil(sorted.length / itemsPerPage) || 1;
  const paginated = sorted.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const toggleSort = (field: 'data' | 'valor' | 'cliente') => {
    if (sortField === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortOrder('desc');
    }
  };

  const getStatusBadge = (status: TransactionStatus) => {
    switch (status) {
      case 'Concluído':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
            <CheckCircle className="h-3 w-3" /> Concluído
          </span>
        );
      case 'Pendente':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-500/10 text-amber-400 border border-amber-500/20">
            <Clock className="h-3 w-3" /> Pendente
          </span>
        );
      case 'Cancelado':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-rose-500/10 text-rose-400 border border-rose-500/20">
            <XCircle className="h-3 w-3" /> Cancelado
          </span>
        );
    }
  };

  return (
    <div className="bg-slate-800/80 border border-slate-700/70 rounded-2xl p-5 shadow-sm space-y-4">
      {/* Header & Controls */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h3 className="text-base font-bold text-white flex items-center gap-2">
            <Receipt className="h-4 w-4 text-blue-400" />
            Transações Recentes
          </h3>
          <p className="text-xs text-slate-400">Histórico detalhado de vendas e pagamentos</p>
        </div>

        {/* Filters */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Search */}
          <div className="relative text-xs">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400" />
            <input
              type="text"
              placeholder="Filtrar tabela..."
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setCurrentPage(1);
              }}
              className="pl-8 pr-3 py-1.5 bg-slate-900 border border-slate-700/80 rounded-xl text-slate-200 placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-indigo-500"
            />
          </div>

          {/* Status Select */}
          <select
            value={selectedStatus}
            onChange={(e) => {
              setSelectedStatus(e.target.value);
              setCurrentPage(1);
            }}
            className="bg-slate-900 border border-slate-700/80 text-slate-200 text-xs rounded-xl px-2.5 py-1.5 focus:outline-none focus:ring-1 focus:ring-indigo-500 cursor-pointer"
          >
            <option value="Todos">Todos os Status</option>
            <option value="Concluído">Concluído</option>
            <option value="Pendente">Pendente</option>
            <option value="Cancelado">Cancelado</option>
          </select>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto rounded-xl border border-slate-700/60">
        <table className="w-full text-left text-xs text-slate-300">
          <thead className="bg-slate-900/90 text-slate-400 font-semibold uppercase tracking-wider border-b border-slate-700/60">
            <tr>
              <th className="py-3 px-4">Código</th>
              <th
                onClick={() => toggleSort('cliente')}
                className="py-3 px-4 cursor-pointer hover:text-slate-200"
              >
                <div className="flex items-center gap-1">
                  Cliente <ArrowUpDown className="h-3 w-3" />
                </div>
              </th>
              <th className="py-3 px-4">Categoria</th>
              <th
                onClick={() => toggleSort('valor')}
                className="py-3 px-4 cursor-pointer hover:text-slate-200"
              >
                <div className="flex items-center gap-1">
                  Valor <ArrowUpDown className="h-3 w-3" />
                </div>
              </th>
              <th
                onClick={() => toggleSort('data')}
                className="py-3 px-4 cursor-pointer hover:text-slate-200"
              >
                <div className="flex items-center gap-1">
                  Data <ArrowUpDown className="h-3 w-3" />
                </div>
              </th>
              <th className="py-3 px-4">Status</th>
              <th className="py-3 px-4 text-right">Ações</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-700/50">
            {paginated.length > 0 ? (
              paginated.map((tx) => (
                <tr key={tx.id} className="hover:bg-slate-700/30 transition-colors">
                  <td className="py-3 px-4 font-mono font-medium text-slate-300">
                    {tx.codigo}
                  </td>
                  <td className="py-3 px-4">
                    <div className="font-semibold text-slate-100">{tx.cliente}</div>
                    <div className="text-[11px] text-slate-400">{tx.email}</div>
                  </td>
                  <td className="py-3 px-4">
                    <span className="px-2 py-0.5 rounded bg-slate-900 text-slate-300 border border-slate-700/80">
                      {tx.categoria}
                    </span>
                  </td>
                  <td className="py-3 px-4 font-bold text-slate-100">
                    R$ {tx.valor.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                  </td>
                  <td className="py-3 px-4 text-slate-400">{tx.data}</td>
                  <td className="py-3 px-4">{getStatusBadge(tx.status)}</td>
                  <td className="py-3 px-4 text-right">
                    <div className="flex items-center justify-end gap-1.5">
                      <button
                        onClick={() => setSelectedTransaction(tx)}
                        className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-700 rounded-lg transition-colors cursor-pointer"
                        title="Ver detalhes"
                      >
                        <Eye className="h-3.5 w-3.5" />
                      </button>
                      <button
                        onClick={() => onDeleteTransaction(tx.id)}
                        className="p-1.5 text-rose-400 hover:text-rose-300 hover:bg-rose-500/10 rounded-lg transition-colors cursor-pointer"
                        title="Excluir registro"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={7} className="text-center py-8 text-slate-400">
                  Nenhuma transação encontrada com os filtros aplicados.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination Footer */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-400 pt-2">
        <span>
          Mostrando {paginated.length} de {filtered.length} registros
        </span>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
            disabled={currentPage === 1}
            className="p-1.5 rounded-lg bg-slate-900 border border-slate-700 text-slate-300 hover:bg-slate-800 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
          >
            <ChevronLeft className="h-4 w-4" />
          </button>
          <span className="font-semibold text-slate-200">
            Página {currentPage} de {totalPages}
          </span>
          <button
            onClick={() => setCurrentPage((p) => Math.min(p + 1, totalPages))}
            disabled={currentPage === totalPages}
            className="p-1.5 rounded-lg bg-slate-900 border border-slate-700 text-slate-300 hover:bg-slate-800 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
          >
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* Transaction Detail Modal */}
      {selectedTransaction && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-start justify-between border-b border-slate-800 pb-3">
              <div>
                <span className="text-xs font-mono text-indigo-400 font-semibold">
                  {selectedTransaction.codigo}
                </span>
                <h4 className="text-lg font-bold text-white">Detalhes do Pedido</h4>
              </div>
              <button
                onClick={() => setSelectedTransaction(null)}
                className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 cursor-pointer"
              >
                ✕
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div className="flex justify-between py-1 border-b border-slate-800/60">
                <span className="text-slate-400">Cliente:</span>
                <span className="font-semibold text-white">{selectedTransaction.cliente}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-800/60">
                <span className="text-slate-400">E-mail:</span>
                <span className="text-slate-300">{selectedTransaction.email}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-800/60">
                <span className="text-slate-400">Categoria:</span>
                <span className="text-slate-300">{selectedTransaction.categoria}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-800/60">
                <span className="text-slate-400">Valor Total:</span>
                <span className="font-bold text-emerald-400 text-sm">
                  R$ {selectedTransaction.valor.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                </span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-800/60">
                <span className="text-slate-400">Método de Pagamento:</span>
                <span className="text-slate-200">{selectedTransaction.metodoPagamento}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-800/60">
                <span className="text-slate-400">Data e Hora:</span>
                <span className="text-slate-300">{selectedTransaction.data}</span>
              </div>

              {/* Status Update Controls */}
              <div className="pt-2">
                <label className="block text-slate-400 mb-1.5 font-medium">Alterar Status:</label>
                <div className="flex gap-2">
                  {(['Concluído', 'Pendente', 'Cancelado'] as TransactionStatus[]).map((st) => (
                    <button
                      key={st}
                      onClick={() => {
                        onUpdateStatus(selectedTransaction.id, st);
                        setSelectedTransaction({ ...selectedTransaction, status: st });
                      }}
                      className={`flex-1 py-1.5 rounded-lg font-semibold text-[11px] transition-all cursor-pointer ${
                        selectedTransaction.status === st
                          ? 'bg-indigo-600 text-white shadow'
                          : 'bg-slate-800 text-slate-400 hover:bg-slate-700 hover:text-slate-200'
                      }`}
                    >
                      {st}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="pt-2 flex justify-end">
              <button
                onClick={() => setSelectedTransaction(null)}
                className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold rounded-xl cursor-pointer"
              >
                Fechar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
