import { SpaKPICardData, DailyLeadPoint, WeeklyComparisonItem, FunnelStage, PatientRecord } from '../types';

export const initialSpaKPIs: SpaKPICardData[] = [
  {
    id: 'leads-novos',
    title: 'LEADS NOVOS',
    value: 619,
    changePercent: 6.7,
    isPositive: true,
    timeframe: 'vs. semana anterior',
    icon: 'users',
    colorTheme: 'violet',
  },
  {
    id: 'agendamentos',
    title: 'AGENDAMENTOS',
    value: 6,
    changePercent: -25.0,
    isPositive: false,
    timeframe: 'vs. semana anterior',
    icon: 'calendar',
    colorTheme: 'orange',
  },
  {
    id: 'comparecimentos',
    title: 'COMPARECIMENTOS',
    value: 1,
    changePercent: -50.0,
    isPositive: false,
    timeframe: 'vs. semana anterior',
    icon: 'check',
    colorTheme: 'rose',
  },
  {
    id: 'conversao-geral',
    title: 'CONVERSÃO GERAL',
    value: '88%',
    changePercent: 7.3,
    isPositive: true,
    timeframe: 'vs. semana anterior',
    icon: 'scale',
    colorTheme: 'emerald',
  },
];

export const dailyLeadsData: DailyLeadPoint[] = [
  { day: 'Segunda', leads: 85 },
  { day: 'Terça', leads: 102 },
  { day: 'Quarta', leads: 92 },
  { day: 'Quinta', leads: 118 },
  { day: 'Sexta', leads: 95 },
  { day: 'Sábado', leads: 75 },
  { day: 'Domingo', leads: 52 },
];

export const weeklyComparisons: WeeklyComparisonItem[] = [
  {
    id: 'comp-1',
    label: 'Leads Novos',
    previousValue: 580,
    currentValue: 619,
    percentFill: 92,
    color: '#6366f1' // purple/indigo
  },
  {
    id: 'comp-2',
    label: 'Agendamentos',
    previousValue: 8,
    currentValue: 6,
    percentFill: 65,
    color: '#f97316' // orange
  },
  {
    id: 'comp-3',
    label: 'Comparecimentos',
    previousValue: 2,
    currentValue: 1,
    percentFill: 40,
    color: '#f43f5e' // pink/rose
  },
  {
    id: 'comp-4',
    label: 'Conversão Geral',
    previousValue: '82%',
    currentValue: '88%',
    percentFill: 88,
    color: '#10b981' // emerald
  }
];

export const initialFunnelStages: FunnelStage[] = [
  {
    id: 'stage-1',
    title: '1ª Consulta',
    consultasCount: 9,
    fechamentosCount: 6,
    conversionPercent: 66.67,
    accentColor: '#6366f1'
  },
  {
    id: 'stage-2',
    title: '2ª Consulta',
    consultasCount: 2,
    fechamentosCount: 2,
    conversionPercent: 100.00,
    accentColor: '#ec4899'
  },
  {
    id: 'stage-3',
    title: 'Avaliação Estética Avançada',
    consultasCount: 5,
    fechamentosCount: 4,
    conversionPercent: 80.00,
    accentColor: '#10b981'
  },
  {
    id: 'stage-4',
    title: 'Plano de Tratamento Continuado',
    consultasCount: 4,
    fechamentosCount: 3,
    conversionPercent: 75.00,
    accentColor: '#f59e0b'
  }
];

export const initialPatientRecords: PatientRecord[] = [
  {
    id: 'pat-1',
    codigo: 'NAT-2026-091',
    paciente: 'Juliana Camargo do Nascimento',
    telefone: '(11) 98765-4321',
    procedimento: 'Bioestimulador de Colágeno',
    etapaFunil: '1ª Consulta',
    valorFechado: 14500.00,
    status: 'Atendido',
    dataAgendamento: '2026-07-27 10:00',
    unidade: 'Natuamed Jardins'
  },
  {
    id: 'pat-2',
    codigo: 'NAT-2026-090',
    paciente: 'Patricia Alvarenga Siqueira',
    telefone: '(11) 99123-8877',
    procedimento: 'Harmonização Facial',
    etapaFunil: '2ª Consulta',
    valorFechado: 22800.00,
    status: 'Atendido',
    dataAgendamento: '2026-07-27 11:30',
    unidade: 'Natuamed Moema'
  },
  {
    id: 'pat-3',
    codigo: 'NAT-2026-089',
    paciente: 'Camila Mendonça de Souza',
    telefone: '(11) 97744-2211',
    procedimento: 'Protocolo Spa & Emagrecimento',
    etapaFunil: '1ª Consulta',
    valorFechado: 11200.00,
    status: 'Agendado',
    dataAgendamento: '2026-07-27 14:00',
    unidade: 'Natuamed Jardins'
  },
  {
    id: 'pat-4',
    codigo: 'NAT-2026-088',
    paciente: 'Fernanda Diniz Guimarães',
    telefone: '(11) 98112-9090',
    procedimento: 'Toxina Botulínica (Botox)',
    etapaFunil: '1ª Consulta',
    valorFechado: 3850.00,
    status: 'Atendido',
    dataAgendamento: '2026-07-26 15:30',
    unidade: 'Natuamed Moema'
  },
  {
    id: 'pat-5',
    codigo: 'NAT-2026-087',
    paciente: 'Luciana Mello Vasconcelos',
    telefone: '(11) 99887-1122',
    procedimento: 'Tecnologias & Lasers',
    etapaFunil: '2ª Consulta',
    valorFechado: 18900.00,
    status: 'Em Negociação',
    dataAgendamento: '2026-07-26 16:45',
    unidade: 'Natuamed Jardins'
  },
  {
    id: 'pat-6',
    codigo: 'NAT-2026-086',
    paciente: 'Renata Castro Mello',
    telefone: '(11) 97654-3210',
    procedimento: 'Corporal & Criolipólise',
    etapaFunil: '1ª Consulta',
    valorFechado: 9800.00,
    status: 'Atendido',
    dataAgendamento: '2026-07-25 09:15',
    unidade: 'Natuamed Moema'
  }
];
