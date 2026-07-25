import Dexie, { type Table } from 'dexie';

export interface User {
  id?: number;
  username: string;
  password: string;
  name: string;
  createdAt: string;
}

export interface DbSession {
  id?: number;
  userId: number;
  date: string;
  timeIn: string;
  timeOut: string;
  timeInISO: string;
  timeOutISO: string;
  hours: number;
  remarks: string;
  breakMinutes?: number;
}

export interface UserMeta {
  userId: number;
  name: string;
  school: string;
  company: string;
  supervisor: string;
  requiredHours: number;
  autoBreak: boolean;
}

export class OjtTrackerDatabase extends Dexie {
  users!: Table<User, number>;
  sessions!: Table<DbSession, number>;
  meta!: Table<UserMeta, number>;

  constructor() {
    super('OjtTrackerDexieDB');
    this.version(1).stores({
      users: '++id, &username, createdAt',
      sessions: '++id, userId, date, timeInISO, timeOutISO',
      meta: 'userId, name, school, company',
    });
  }
}

export const db = new OjtTrackerDatabase();
