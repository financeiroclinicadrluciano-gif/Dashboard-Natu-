import React, { useState } from 'react';
import { Transaction, Category, TransactionStatus } from '../types';
import { PlusCircle, X, DollarSign, User, Mail, Tag, CreditCard } from 'lucide-react';

interface AddTransactionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddTransaction: (newTx: Omit<Transaction, 'id' | 'codigo'>) => void;
}

const categories: Category[] = [
  'Eletrônicos',
  'Vestuário',
  'Alimentos & Bebidas',
  'Casa & Decoração',
  'Serviços'
];

export const AddTransactionModal: React.FC<AddTransactionModalProps> = ({
  isOpen,
  onClose,
  onAddTransaction
}) => {
  const [cliente, setCliente] = useState('');
  const [email, setEmail] = useState('');
  const [categoria, setCategoria] = useState<Category>('Eletrônicos');
  const [valor, setValor] = useState('');
  const [metodoPagamento, setMetodoPagamento] = useState('PIX');
  const [status, setStatus] = useState<TransactionStatus>('Concluído');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!cliente || !valor) return;

    const parsedValue = parseFloat(valor.replace(',', '.'));
    if (isNaN(parsedValue) || parsedValue <= 0) return;

    const now = new Date();
    const formattedDate = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')} ${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;

    onAddTransaction({
      cliente,
      email: email || `${cliente.toLowerCase().replace(/\s+/g, '.')}@email.com`,
      categoria,
      valor: parsedValue,
      data: formattedDate,
      status,
      metodoPagamento
    });

    // Reset and close
    setCliente('');
    setEmail('');
    setValor('');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-slate-900 border border-slate-700/80 rounded-2xl max-w-lg w-full p-6 shadow-2xl relative">
        <button
          onClick={onClose}
          className="absolute right-4 top-4 text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition-colors cursor-pointer"
        >
          <X className="h-5 w-5" />
        </button>

        <div className="flex items-center gap-2 mb-4 pb-3 border-b border-slate-800">
          <div className="p-2 rounded-xl bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
            <PlusCircle className="h-5 w-5" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-white">Registrar Nova Venda</h3>
            <p className="text-xs text-slate-400">Adicione uma transação para atualizar o dashboard em tempo real</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          {/* Cliente Name */}
          <div>
            <label className="block text-slate-300 font-medium mb-1">Nome do Cliente *</label>
            <div className="relative">
              <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
              <input
                type="text"
                required
                value={cliente}
                onChange={(e) => setCliente(e.target.value)}
                placeholder="Ex: Gabriel Monteiro"
                className="w-full pl-9 pr-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
          </div>

          {/* Email */}
          <div>
            <label className="block text-slate-300 font-medium mb-1">E-mail de Contato</label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Ex: gabriel@email.com"
                className="w-full pl-9 pr-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Valor */}
            <div>
              <label className="block text-slate-300 font-medium mb-1">Valor (R$) *</label>
              <div className="relative">
                <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-emerald-400" />
                <input
                  type="text"
                  required
                  value={valor}
                  onChange={(e) => setValor(e.target.value)}
                  placeholder="0,00"
                  className="w-full pl-9 pr-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>
            </div>

            {/* Categoria */}
            <div>
              <label className="block text-slate-300 font-medium mb-1">Categoria</label>
              <div className="relative">
                <select
                  value={categoria}
                  onChange={(e) => setCategoria(e.target.value as Category)}
                  className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500 cursor-pointer"
                >
                  {categories.map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Método de Pagamento */}
            <div>
              <label className="block text-slate-300 font-medium mb-1">Forma de Pagamento</label>
              <select
                value={metodoPagamento}
                onChange={(e) => setMetodoPagamento(e.target.value)}
                className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500 cursor-pointer"
              >
                <option value="PIX">PIX</option>
                <option value="Cartão de Crédito">Cartão de Crédito</option>
                <option value="Boleto Bancário">Boleto Bancário</option>
                <option value="Transferência">Transferência</option>
              </select>
            </div>

            {/* Status */}
            <div>
              <label className="block text-slate-300 font-medium mb-1">Status da Venda</label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as TransactionStatus)}
                className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500 cursor-pointer"
              >
                <option value="Concluído">Concluído</option>
                <option value="Pendente">Pendente</option>
                <option value="Cancelado">Cancelado</option>
              </select>
            </div>
          </div>

          <div className="pt-4 flex items-center justify-end gap-3 border-t border-slate-800">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold rounded-xl transition-colors cursor-pointer"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="px-5 py-2 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold rounded-xl shadow-lg shadow-indigo-600/30 transition-all cursor-pointer"
            >
              Salvar Venda
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
