import type { ThemeKey } from '../styles/themes';

export interface Session {
  id: string;
  date: string;
  timeIn: string;
  timeOut: string;
  timeInISO: string;
  timeOutISO: string;
  hours: number;
  remarks: string;
  breakMinutes?: number;
}

export interface TrackerMeta {
  name: string;
  school: string;
  company: string;
  supervisor: string;
  requiredHours: number;
  autoBreak: boolean;
}

export interface TrackerState {
  sessions: Session[];
  meta: TrackerMeta;
  clockedIn: boolean;
  clockInTime: string | null;
  theme: ThemeKey;
}

export type TrackerTab = 'dashboard' | 'log' | 'manual' | 'export' | 'settings';

export interface ManualEntryValues {
  date: string;
  timeIn: string;
  timeOut: string;
  remarks?: string;
  breakMinutes?: number;
}

export interface ToastMessage {
  id: string;
  message: string;
  type?: 'success' | 'info' | 'error';
}

export interface AuthUser {
  id: number;
  username: string;
  name: string;
}