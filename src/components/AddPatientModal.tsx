import React, { useState } from 'react';
import { PatientRecord, ProcedureCategory, LeadStatus } from '../types';
import { PlusCircle, X, User, Phone, DollarSign, MapPin, Sparkles } from 'lucide-react';

interface AddPatientModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddRecord: (newRec: Omit<PatientRecord, 'id' | 'codigo'>) => void;
}

const procedures: ProcedureCategory[] = [
  'Harmonização Facial',
  'Bioestimulador de Colágeno',
  'Protocolo Spa & Emagrecimento',
  'Toxina Botulínica (Botox)',
  'Tecnologias & Lasers',
  'Corporal & Criolipólise'
];

export const AddPatientModal: React.FC<AddPatientModalProps> = ({
  isOpen,
  onClose,
  onAddRecord
}) => {
  const [paciente, setPaciente] = useState('');
  const [telefone, setTelefone] = useState('');
  const [procedimento, setProcedimento] = useState<ProcedureCategory>('Bioestimulador de Colágeno');
  const [etapaFunil, setEtapaFunil] = useState('1ª Consulta');
  const [valorFechado, setValorFechado] = useState('');
  const [unidade, setUnidade] = useState('Natuamed Jardins');
  const [status, setStatus] = useState<LeadStatus>('Agendado');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!paciente) return;

    const parsedVal = parseFloat(valorFechado.replace(/\./g, '').replace(',', '.')) || 0;

    const now = new Date();
    const formattedDate = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')} ${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;

    onAddRecord({
      paciente,
      telefone: telefone || '(11) 90000-0000',
      procedimento,
      etapaFunil,
      valorFechado: parsedVal,
      status,
      dataAgendamento: formattedDate,
      unidade
    });

    setPaciente('');
    setTelefone('');
    setValorFechado('');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="bg-white border border-slate-200 rounded-2xl max-w-lg w-full p-6 shadow-2xl relative">
        <button
          onClick={onClose}
          className="absolute right-4 top-4 text-slate-400 hover:text-slate-700 p-1 rounded-lg hover:bg-slate-100 cursor-pointer"
        >
          <X className="h-5 w-5" />
        </button>

        <div className="flex items-center gap-3 mb-4 pb-3 border-b border-slate-100">
          <div className="h-10 w-10 rounded-xl bg-indigo-50 border border-indigo-100 text-indigo-600 flex items-center justify-center shrink-0">
            <PlusCircle className="h-5 w-5" />
          </div>
          <div>
            <h3 className="text-lg font-extrabold text-slate-900">Novo Agendamento / Paciente</h3>
            <p className="text-xs text-slate-500 font-medium">
              Registre a consulta ou fechamento para o Natuamed Spa
            </p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 text-xs font-medium">
          <div>
            <label className="block text-slate-700 font-bold mb-1">Nome Completo do Paciente *</label>
            <div className="relative">
              <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
              <input
                type="text"
                required
                value={paciente}
                onChange={(e) => setPaciente(e.target.value)}
                placeholder="Ex: Dra. Mariana Vasconcelos"
                className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500/30"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-slate-700 font-bold mb-1">Telefone / WhatsApp</label>
              <div className="relative">
                <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                <input
                  type="text"
                  value={telefone}
                  onChange={(e) => setTelefone(e.target.value)}
                  placeholder="(11) 98888-7777"
                  className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500/30"
                />
              </div>
            </div>

            <div>
              <label className="block text-slate-700 font-bold mb-1">Unidade Spa</label>
              <select
                value={unidade}
                onChange={(e) => setUnidade(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 font-semibold focus:outline-none focus:ring-2 focus:ring-indigo-500/30 cursor-pointer"
              >
                <option value="Natuamed Jardins">Natuamed Jardins</option>
                <option value="Natuamed Moema">Natuamed Moema</option>
                <option value="Natuamed Vila Nova">Natuamed Vila Nova</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-slate-700 font-bold mb-1">Procedimento Solicitado</label>
              <select
                value={procedimento}
                onChange={(e) => setProcedimento(e.target.value as ProcedureCategory)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 font-semibold focus:outline-none focus:ring-2 focus:ring-indigo-500/30 cursor-pointer"
              >
                {procedures.map((p) => (
                  <option key={p} value={p}>
                    {p}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-slate-700 font-bold mb-1">Etapa no Funil</label>
              <select
                value={etapaFunil}
                onChange={(e) => setEtapaFunil(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 font-semibold focus:outline-none focus:ring-2 focus:ring-indigo-500/30 cursor-pointer"
              >
                <option value="1ª Consulta">1ª Consulta</option>
                <option value="2ª Consulta">2ª Consulta</option>
                <option value="Avaliação Estética Avançada">Avaliação Estética Avançada</option>
                <option value="Plano de Tratamento Continuado">Plano de Tratamento Continuado</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-slate-700 font-bold mb-1">Valor Acertado (R$)</label>
              <div className="relative">
                <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-emerald-600" />
                <input
                  type="text"
                  value={valorFechado}
                  onChange={(e) => setValorFechado(e.target.value)}
                  placeholder="Ex: 8500,00"
                  className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500/30 font-bold"
                />
              </div>
            </div>

            <div>
              <label className="block text-slate-700 font-bold mb-1">Status Comercial</label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as LeadStatus)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 font-semibold focus:outline-none focus:ring-2 focus:ring-indigo-500/30 cursor-pointer"
              >
                <option value="Agendado">Agendado</option>
                <option value="Atendido">Atendido</option>
                <option value="Em Negociação">Em Negociação</option>
                <option value="Cancelado">Cancelado</option>
              </select>
            </div>
          </div>

          <div className="pt-4 flex items-center justify-end gap-3 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl transition-colors cursor-pointer"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-extrabold rounded-xl shadow-md shadow-indigo-600/30 transition-all cursor-pointer"
            >
              Salvar Agendamento
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
