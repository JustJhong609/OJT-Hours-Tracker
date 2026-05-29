export interface Session {
  id: string;
  date: string;
  timeIn: string;
  timeOut: string;
  timeInISO: string;
  timeOutISO: string;
  hours: number;
  remarks: string;
}

export interface TrackerMeta {
  name: string;
  school: string;
  company: string;
  requiredHours: number;
}

export interface TrackerState {
  sessions: Session[];
  meta: TrackerMeta;
  clockedIn: boolean;
  clockInTime: string | null;
}

export type TrackerTab = 'dashboard' | 'log' | 'export' | 'settings';

export interface ManualEntryValues {
  date: string;
  timeIn: string;
  timeOut: string;
}

export interface ToastMessage {
  id: string;
  message: string;
}