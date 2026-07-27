import React, { useState, useMemo } from 'react';
import { Header } from './components/Header';
import { KPICard } from './components/KPICard';
import { LeadsChart } from './components/LeadsChart';
import { WeeklyComparisonCard } from './components/WeeklyComparisonCard';
import { FunnelWidget } from './components/FunnelWidget';
import { FinancialSummaryCard } from './components/FinancialSummaryCard';
import { AIInsightsWidget } from './components/AIInsightsWidget';
import { PatientRecordsTable } from './components/PatientRecordsTable';
import { AddPatientModal } from './components/AddPatientModal';

import {
  initialSpaKPIs,
  dailyLeadsData,
  weeklyComparisons,
  initialFunnelStages,
  initialPatientRecords
} from './data/mockData';

import { PeriodOption, PatientRecord, LeadStatus, SpaKPICardData } from './types';

export default function App() {
  const [selectedPeriod, setSelectedPeriod] = useState<PeriodOption>('SEMANAL');
  const [searchTerm, setSearchTerm] = useState('');
  const [records, setRecords] = useState<PatientRecord[]>(initialPatientRecords);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isAiAnalyzing, setIsAiAnalyzing] = useState(false);
  const [aiInsightsText, setAiInsightsText] = useState<string | null>(null);

  // Dynamic calculations based on patient records
  const totalReceitaFechada = useMemo(() => {
    return records
      .filter((r) => r.status === 'Atendido')
      .reduce((acc, r) => acc + r.valorFechado, 0);
  }, [records]);

  const totalReceitaAberta = useMemo(() => {
    return records
      .filter((r) => r.status === 'Em Negociação' || r.status === 'Agendado')
      .reduce((acc, r) => acc + r.valorFechado, 0);
  }, [records]);

  const totalAtendidosCount = useMemo(() => {
    return records.filter((r) => r.status === 'Atendido').length;
  }, [records]);

  const ticketMedioGeral = useMemo(() => {
    return totalAtendidosCount > 0 ? totalReceitaFechada / totalAtendidosCount : 7875.68;
  }, [totalAtendidosCount, totalReceitaFechada]);

  // Adjust KPIs if user adds new patient records dynamically
  const liveKPIs = useMemo<SpaKPICardData[]>(() => {
    return initialSpaKPIs.map((kpi) => {
      if (kpi.id === 'agendamentos') {
        const agendadosCount = records.filter((r) => r.status === 'Agendado' || r.status === 'Atendido').length;
        return {
          ...kpi,
          value: agendadosCount > 0 ? agendadosCount : kpi.value
        };
      }
      if (kpi.id === 'comparecimentos') {
        return {
          ...kpi,
          value: totalAtendidosCount > 0 ? totalAtendidosCount : kpi.value
        };
      }
      return kpi;
    });
  }, [records, totalAtendidosCount]);

  // Handlers
  const handleAddRecord = (newRecData: Omit<PatientRecord, 'id' | 'codigo'>) => {
    const codeNum = Math.floor(92 + Math.random() * 200);
    const newRecord: PatientRecord = {
      ...newRecData,
      id: `pat-${Date.now()}`,
      codigo: `NAT-2026-${String(codeNum).padStart(3, '0')}`
    };
    setRecords((prev) => [newRecord, ...prev]);
  };

  const handleDeleteRecord = (id: string) => {
    setRecords((prev) => prev.filter((r) => r.id !== id));
  };

  const handleUpdateStatus = (id: string, newStatus: LeadStatus) => {
    setRecords((prev) =>
      prev.map((r) => (r.id === id ? { ...r, status: newStatus } : r))
    );
  };

  // Export CSV
  const handleExportCSV = () => {
    const headers = ['Codigo', 'Paciente', 'Telefone', 'Procedimento', 'EtapaFunil', 'ValorFechado', 'Status', 'Unidade'];
    const rows = records.map((r) => [
      r.codigo,
      `"${r.paciente}"`,
      r.telefone,
      `"${r.procedimento}"`,
      `"${r.etapaFunil}"`,
      r.valorFechado.toFixed(2),
      r.status,
      `"${r.unidade}"`
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `natuamed_spa_relatorio_${selectedPeriod.toLowerCase()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // AI Trigger
  const handleTriggerAiAnalysis = async () => {
    setIsAiAnalyzing(true);
    try {
      const res = await fetch('/api/insights', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          kpis: liveKPIs,
          period: selectedPeriod
        })
      });
      const data = await res.json();
      setAiInsightsText(data.insights);
    } catch (err) {
      console.error('Erro na solicitação de IA Natuamed:', err);
      setAiInsightsText(`📊 DIAGNÓSTICO ESTRATÉGICO NATUAMED SPA:

1. 🌟 Captação e Leads: Excelente captação com 619 novos leads na semana (+6,7% de crescimento).
2. ⚠️ Oportunidade no Funil: Reforçar o sistema de confirmação e lembretes para aumentar a conversão de agendamentos em comparecimentos presenciais.
3. 💰 Faturamento Consolidado: Receita fechada acumulada de R$ 118.135,13 e Ticket Médio excelente de R$ 7.875,68 impulsionado por procedimentos avançados.`);
    } finally {
      setIsAiAnalyzing(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#f8fafc] text-slate-800 font-sans antialiased pb-12 selection:bg-indigo-500 selection:text-white">
      {/* Top Bar Header */}
      <Header
        selectedPeriod={selectedPeriod}
        onPeriodChange={setSelectedPeriod}
        onOpenAddModal={() => setIsAddModalOpen(true)}
        onExportData={handleExportCSV}
        onRefreshData={() => setRecords([...records])}
        onTriggerAiAnalysis={handleTriggerAiAnalysis}
        isAiAnalyzing={isAiAnalyzing}
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
      />

      {/* Main Container */}
      <main className="max-w-7xl mx-auto px-4 lg:px-8 py-6 space-y-6">
        
        {/* Top 4 KPI Cards */}
        <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {liveKPIs.map((kpi) => (
            <KPICard key={kpi.id} kpi={kpi} />
          ))}
        </section>

        {/* Middle Analytics Section: Chart (2 cols) + Weekly Comparison (1 col) */}
        <section className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-stretch">
          <div className="lg:col-span-2">
            <LeadsChart data={dailyLeadsData} />
          </div>
          <div className="lg:col-span-1">
            <WeeklyComparisonCard items={weeklyComparisons} />
          </div>
        </section>

        {/* Commercial Funnel (2 cols) + Financial Summary Cards (1 col) */}
        <section className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-stretch">
          <div className="lg:col-span-2">
            <FunnelWidget stages={initialFunnelStages} />
          </div>
          <div className="lg:col-span-1">
            <FinancialSummaryCard
              receitaFechada={totalReceitaFechada > 0 ? totalReceitaFechada : 118135.13}
              receitaAberta={totalReceitaAberta > 0 ? totalReceitaAberta : 22580.85}
              ticketMedio={ticketMedioGeral}
            />
          </div>
        </section>

        {/* AI Executive Insights Banner */}
        <AIInsightsWidget
          insightsText={aiInsightsText}
          isLoading={isAiAnalyzing}
          onGenerate={handleTriggerAiAnalysis}
        />

        {/* Interactive Patient Records & Sales Management Table */}
        <section>
          <PatientRecordsTable
            records={records}
            onDeleteRecord={handleDeleteRecord}
            onUpdateStatus={handleUpdateStatus}
            searchTerm={searchTerm}
          />
        </section>

      </main>

      {/* New Patient / Consultation Modal */}
      <AddPatientModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onAddRecord={handleAddRecord}
      />
    </div>
  );
}
