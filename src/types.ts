export type PeriodOption = 'SEMANAL' | 'MENSAL' | 'TRIMESTRAL' | 'ANUAL';

export type ProcedureCategory = 
  | 'Harmonização Facial'
  | 'Bioestimulador de Colágeno'
  | 'Protocolo Spa & Emagrecimento'
  | 'Toxina Botulínica (Botox)'
  | 'Tecnologias & Lasers'
  | 'Corporal & Criolipólise';

export type LeadStatus = 'Atendido' | 'Agendado' | 'Em Negociação' | 'Cancelado';

export interface SpaKPICardData {
  id: string;
  title: string;
  value: string | number;
  changePercent: number;
  isPositive: boolean;
  timeframe: string;
  icon: 'users' | 'calendar' | 'check' | 'scale';
  colorTheme: 'violet' | 'orange' | 'rose' | 'emerald';
}

export interface DailyLeadPoint {
  day: string;
  leads: number;
}

export interface WeeklyComparisonItem {
  id: string;
  label: string;
  previousValue: number | string;
  currentValue: number | string;
  percentFill: number; // 0 to 100
  color: string;
}

export interface FunnelStage {
  id: string;
  title: string;
  consultasCount: number;
  fechamentosCount: number;
  conversionPercent: number;
  accentColor: string;
}

export interface PatientRecord {
  id: string;
  codigo: string;
  paciente: string;
  telefone: string;
  procedimento: ProcedureCategory;
  etapaFunil: string;
  valorFechado: number;
  status: LeadStatus;
  dataAgendamento: string;
  unidade: string;
}
