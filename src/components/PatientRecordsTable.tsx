import React, { useState } from 'react';
import { PatientRecord, LeadStatus, ProcedureCategory } from '../types';
import {
  Search,
  Users,
  Eye,
  Trash2,
  CheckCircle,
  Clock,
  AlertCircle,
  ChevronLeft,
  ChevronRight,
  Sparkles,
  Phone,
  MapPin
} from 'lucide-react';

interface PatientRecordsTableProps {
  records: PatientRecord[];
  onDeleteRecord: (id: string) => void;
  onUpdateStatus: (id: string, newStatus: LeadStatus) => void;
  searchTerm: string;
}

export const PatientRecordsTable: React.FC<PatientRecordsTableProps> = ({
  records,
  onDeleteRecord,
  onUpdateStatus,
  searchTerm
}) => {
  const [selectedStatus, setSelectedStatus] = useState<string>('Todos');
  const [selectedProcedure, setSelectedProcedure] = useState<string>('Todos');
  const [selectedRecord, setSelectedRecord] = useState<PatientRecord | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  const filtered = records.filter((rec) => {
    const matchesSearch =
      rec.paciente.toLowerCase().includes(searchTerm.toLowerCase()) ||
      rec.codigo.toLowerCase().includes(searchTerm.toLowerCase()) ||
      rec.procedimento.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus =
      selectedStatus === 'Todos' || rec.status === selectedStatus;

    const matchesProcedure =
      selectedProcedure === 'Todos' || rec.procedimento === selectedProcedure;

    return matchesSearch && matchesStatus && matchesProcedure;
  });

  const totalPages = Math.ceil(filtered.length / itemsPerPage) || 1;
  const paginated = filtered.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const getStatusBadge = (status: LeadStatus) => {
    switch (status) {
      case 'Atendido':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800 border border-emerald-200">
            <CheckCircle className="h-3 w-3 text-emerald-600" /> Atendido
          </span>
        );
      case 'Agendado':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-indigo-100 text-indigo-800 border border-indigo-200">
            <Clock className="h-3 w-3 text-indigo-600" /> Agendado
          </span>
        );
      case 'Em Negociação':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-amber-100 text-amber-800 border border-amber-200">
            <AlertCircle className="h-3 w-3 text-amber-600" /> Em Negociação
          </span>
        );
      case 'Cancelado':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-rose-100 text-rose-800 border border-rose-200">
            <AlertCircle className="h-3 w-3 text-rose-600" /> Cancelado
          </span>
        );
    }
  };

  return (
    <div className="bg-white border border-slate-200/90 rounded-2xl p-5 shadow-xs space-y-4">
      {/* Table Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h3 className="text-sm font-extrabold text-slate-900 uppercase tracking-wider flex items-center gap-2">
            <Users className="h-4 w-4 text-indigo-600" />
            REGISTRO DE PACIENTES & CONSULTAS
          </h3>
          <p className="text-xs text-slate-500 font-medium mt-0.5">
            Acompanhamento em tempo real da jornada comercial e fechamentos do Natuamed Spa
          </p>
        </div>

        {/* Filters */}
        <div className="flex flex-wrap items-center gap-2">
          <select
            value={selectedStatus}
            onChange={(e) => {
              setSelectedStatus(e.target.value);
              setCurrentPage(1);
            }}
            className="bg-slate-50 border border-slate-200 text-slate-800 text-xs font-semibold rounded-xl px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-indigo-500/30 cursor-pointer"
          >
            <option value="Todos">Todos os Status</option>
            <option value="Atendido">Atendido</option>
            <option value="Agendado">Agendado</option>
            <option value="Em Negociação">Em Negociação</option>
            <option value="Cancelado">Cancelado</option>
          </select>

          <select
            value={selectedProcedure}
            onChange={(e) => {
              setSelectedProcedure(e.target.value);
              setCurrentPage(1);
            }}
            className="bg-slate-50 border border-slate-200 text-slate-800 text-xs font-semibold rounded-xl px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-indigo-500/30 cursor-pointer max-w-[180px] truncate"
          >
            <option value="Todos">Todos os Procedimentos</option>
            <option value="Harmonização Facial">Harmonização Facial</option>
            <option value="Bioestimulador de Colágeno">Bioestimulador de Colágeno</option>
            <option value="Protocolo Spa & Emagrecimento">Protocolo Spa & Emagrecimento</option>
            <option value="Toxina Botulínica (Botox)">Toxina Botulínica (Botox)</option>
            <option value="Tecnologias & Lasers">Tecnologias & Lasers</option>
            <option value="Corporal & Criolipólise">Corporal & Criolipólise</option>
          </select>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto rounded-xl border border-slate-200">
        <table className="w-full text-left text-xs text-slate-700">
          <thead className="bg-slate-50 font-extrabold text-slate-500 uppercase tracking-wider border-b border-slate-200">
            <tr>
              <th className="py-3 px-4">Código</th>
              <th className="py-3 px-4">Paciente</th>
              <th className="py-3 px-4">Procedimento</th>
              <th className="py-3 px-4">Etapa Funil</th>
              <th className="py-3 px-4">Valor Fechado</th>
              <th className="py-3 px-4">Status</th>
              <th className="py-3 px-4 text-right">Ações</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200/80">
            {paginated.length > 0 ? (
              paginated.map((rec) => (
                <tr key={rec.id} className="hover:bg-slate-50/80 transition-colors">
                  <td className="py-3.5 px-4 font-mono font-bold text-indigo-700">
                    {rec.codigo}
                  </td>
                  <td className="py-3.5 px-4">
                    <div className="font-bold text-slate-900">{rec.paciente}</div>
                    <div className="text-[11px] text-slate-400 flex items-center gap-1 mt-0.5">
                      <Phone className="h-3 w-3" /> {rec.telefone}
                    </div>
                  </td>
                  <td className="py-3.5 px-4">
                    <span className="px-2.5 py-1 rounded-lg bg-indigo-50 text-indigo-800 font-semibold border border-indigo-100">
                      {rec.procedimento}
                    </span>
                  </td>
                  <td className="py-3.5 px-4 font-medium text-slate-600">
                    {rec.etapaFunil}
                  </td>
                  <td className="py-3.5 px-4 font-extrabold text-emerald-700">
                    R$ {rec.valorFechado.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                  </td>
                  <td className="py-3.5 px-4">{getStatusBadge(rec.status)}</td>
                  <td className="py-3.5 px-4 text-right">
                    <div className="flex items-center justify-end gap-1.5">
                      <button
                        onClick={() => setSelectedRecord(rec)}
                        className="p-1.5 text-slate-500 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
                        title="Ver Ficha Completa"
                      >
                        <Eye className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => onDeleteRecord(rec.id)}
                        className="p-1.5 text-rose-500 hover:text-rose-700 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                        title="Excluir paciente"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={7} className="text-center py-8 text-slate-400 font-medium">
                  Nenhum registro de paciente encontrado com os filtros selecionados.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination Footer */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-500 pt-1">
        <span>
          Exibindo <strong>{paginated.length}</strong> de <strong>{filtered.length}</strong> pacientes
        </span>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
            disabled={currentPage === 1}
            className="p-1.5 rounded-lg bg-slate-50 border border-slate-200 text-slate-600 hover:bg-slate-100 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
          >
            <ChevronLeft className="h-4 w-4" />
          </button>
          <span className="font-bold text-slate-700">
            {currentPage} / {totalPages}
          </span>
          <button
            onClick={() => setCurrentPage((p) => Math.min(p + 1, totalPages))}
            disabled={currentPage === totalPages}
            className="p-1.5 rounded-lg bg-slate-50 border border-slate-200 text-slate-600 hover:bg-slate-100 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
          >
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* Detail Modal */}
      {selectedRecord && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="bg-white border border-slate-200 rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-start justify-between border-b border-slate-100 pb-3">
              <div>
                <span className="text-xs font-mono font-extrabold text-indigo-600">
                  {selectedRecord.codigo}
                </span>
                <h4 className="text-lg font-bold text-slate-900">Ficha do Paciente</h4>
              </div>
              <button
                onClick={() => setSelectedRecord(null)}
                className="text-slate-400 hover:text-slate-700 p-1 rounded-lg hover:bg-slate-100 cursor-pointer"
              >
                ✕
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div className="flex justify-between py-1.5 border-b border-slate-100">
                <span className="text-slate-500 font-medium">Nome do Paciente:</span>
                <span className="font-bold text-slate-900">{selectedRecord.paciente}</span>
              </div>
              <div className="flex justify-between py-1.5 border-b border-slate-100">
                <span className="text-slate-500 font-medium">Telefone:</span>
                <span className="font-bold text-slate-800">{selectedRecord.telefone}</span>
              </div>
              <div className="flex justify-between py-1.5 border-b border-slate-100">
                <span className="text-slate-500 font-medium">Procedimento:</span>
                <span className="font-bold text-indigo-700">{selectedRecord.procedimento}</span>
              </div>
              <div className="flex justify-between py-1.5 border-b border-slate-100">
                <span className="text-slate-500 font-medium">Etapa Funil:</span>
                <span className="font-semibold text-slate-800">{selectedRecord.etapaFunil}</span>
              </div>
              <div className="flex justify-between py-1.5 border-b border-slate-100">
                <span className="text-slate-500 font-medium">Unidade Spa:</span>
                <span className="font-semibold text-slate-800">{selectedRecord.unidade}</span>
              </div>
              <div className="flex justify-between py-1.5 border-b border-slate-100">
                <span className="text-slate-500 font-medium">Valor Fechado:</span>
                <span className="font-extrabold text-emerald-600 text-sm">
                  R$ {selectedRecord.valorFechado.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                </span>
              </div>

              {/* Status change controls */}
              <div className="pt-2">
                <label className="block text-slate-600 mb-2 font-bold">Atualizar Status Comercial:</label>
                <div className="grid grid-cols-2 gap-2">
                  {(['Atendido', 'Agendado', 'Em Negociação', 'Cancelado'] as LeadStatus[]).map((st) => (
                    <button
                      key={st}
                      onClick={() => {
                        onUpdateStatus(selectedRecord.id, st);
                        setSelectedRecord({ ...selectedRecord, status: st });
                      }}
                      className={`py-1.5 rounded-xl font-bold text-xs transition-all cursor-pointer ${
                        selectedRecord.status === st
                          ? 'bg-indigo-600 text-white shadow-xs'
                          : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                      }`}
                    >
                      {st}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="pt-3 flex justify-end border-t border-slate-100">
              <button
                onClick={() => setSelectedRecord(null)}
                className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold rounded-xl cursor-pointer"
              >
                Concluir
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
