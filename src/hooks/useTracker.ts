import { useEffect, useState } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { db, type DbSession, type UserMeta } from '../db';
import { useAuth } from '../context/AuthContext';
import { formatDisplayDate, formatDisplayTime, calculateHours, toIsoDateTime } from '../utils/timeUtils';
import type { ManualEntryValues, Session, TrackerMeta } from '../types';

const defaultMeta: TrackerMeta = {
  name: '',
  school: '',
  company: '',
  supervisor: '',
  requiredHours: 486,
  autoBreak: true,
};

export const useTracker = () => {
  const { currentUser } = useAuth();
  const userId = currentUser?.id ?? 0;

  // Active shift clock-in state key per user
  const clockInKey = `ojt_active_clock_in_user_${userId}`;

  const [clockedIn, setClockedIn] = useState<boolean>(() => {
    if (typeof window === 'undefined' || !userId) return false;
    return Boolean(localStorage.getItem(clockInKey));
  });

  const [clockInTime, setClockInTime] = useState<string | null>(() => {
    if (typeof window === 'undefined' || !userId) return null;
    return localStorage.getItem(clockInKey);
  });

  useEffect(() => {
    if (!userId) return;
    const saved = localStorage.getItem(clockInKey);
    setClockedIn(Boolean(saved));
    setClockInTime(saved);
  }, [userId, clockInKey]);

  // Live Query from Dexie database for User's Sessions
  const dbSessions = useLiveQuery(
    async () => {
      if (!userId) return [];
      const list = await db.sessions.where('userId').equals(userId).toArray();
      // Sort descending by timeInISO
      return list.sort((a, b) => new Date(b.timeInISO).getTime() - new Date(a.timeInISO).getTime());
    },
    [userId],
    []
  );

  // Live Query from Dexie database for User's Meta Settings
  const dbMeta = useLiveQuery(
    async () => {
      if (!userId) return defaultMeta;
      const found = await db.meta.get(userId);
      if (found) {
        return {
          name: found.name || currentUser?.name || '',
          school: found.school || '',
          company: found.company || '',
          supervisor: found.supervisor || '',
          requiredHours: found.requiredHours || 486,
          autoBreak: found.autoBreak ?? true,
        };
      }
      return {
        ...defaultMeta,
        name: currentUser?.name || '',
      };
    },
    [userId, currentUser],
    defaultMeta
  );

  // Convert DbSession format to Session format
  const sessions: Session[] = (dbSessions || []).map((s) => ({
    id: String(s.id),
    date: s.date,
    timeIn: s.timeIn,
    timeOut: s.timeOut,
    timeInISO: s.timeInISO,
    timeOutISO: s.timeOutISO,
    hours: s.hours,
    remarks: s.remarks,
    breakMinutes: s.breakMinutes,
  }));

  const meta: TrackerMeta = dbMeta || defaultMeta;

  const clockIn = () => {
    if (!userId || clockedIn) return;
    const nowISO = new Date().toISOString();
    localStorage.setItem(clockInKey, nowISO);
    setClockedIn(true);
    setClockInTime(nowISO);
  };

  const clockOut = async () => {
    if (!userId || !clockedIn || !clockInTime) return;

    const now = new Date();
    const timeInISO = clockInTime;
    const timeOutISO = now.toISOString();

    let rawHours = calculateHours(timeInISO, timeOutISO);
    let breakMinutes = 0;

    // Auto break calculation: subtract 1 hour if shift >= 5 hours and autoBreak enabled
    if (meta.autoBreak && rawHours >= 5) {
      breakMinutes = 60;
      rawHours = Math.max(0, rawHours - 1);
    }

    const newDbSession: DbSession = {
      userId,
      date: formatDisplayDate(now),
      timeIn: formatDisplayTime(new Date(timeInISO)),
      timeOut: formatDisplayTime(now),
      timeInISO,
      timeOutISO,
      hours: Number(rawHours.toFixed(2)),
      remarks: '',
      breakMinutes,
    };

    await db.sessions.add(newDbSession);
    localStorage.removeItem(clockInKey);
    setClockedIn(false);
    setClockInTime(null);
  };

  const addManualSession = async (values: ManualEntryValues) => {
    if (!userId) return { success: false, message: 'User not authenticated.' };

    const timeInISO = toIsoDateTime(values.date, values.timeIn);
    const timeOutISO = toIsoDateTime(values.date, values.timeOut);

    if (new Date(timeOutISO).getTime() <= new Date(timeInISO).getTime()) {
      return { success: false, message: 'Time Out must be later than Time In.' };
    }

    let rawHours = calculateHours(timeInISO, timeOutISO);
    const breakMinutes = values.breakMinutes ?? 0;
    if (breakMinutes > 0) {
      rawHours = Math.max(0, rawHours - breakMinutes / 60);
    }

    const newDbSession: DbSession = {
      userId,
      date: values.date,
      timeIn: formatDisplayTime(new Date(timeInISO)),
      timeOut: formatDisplayTime(new Date(timeOutISO)),
      timeInISO,
      timeOutISO,
      hours: Number(rawHours.toFixed(2)),
      remarks: values.remarks ?? '',
      breakMinutes,
    };

    await db.sessions.add(newDbSession);
    return { success: true, message: 'Session added successfully to Dexie DB!' };
  };

  const updateRemarks = async (sessionId: string, remarks: string) => {
    const numericId = Number(sessionId);
    if (Number.isFinite(numericId)) {
      await db.sessions.update(numericId, { remarks });
    }
  };

  const deleteSession = async (sessionId: string) => {
    const numericId = Number(sessionId);
    if (Number.isFinite(numericId)) {
      await db.sessions.delete(numericId);
    }
  };

  const saveMeta = async (updatedMeta: Partial<TrackerMeta>) => {
    if (!userId) return;
    const merged: UserMeta = {
      userId,
      name: updatedMeta.name ?? meta.name,
      school: updatedMeta.school ?? meta.school,
      company: updatedMeta.company ?? meta.company,
      supervisor: updatedMeta.supervisor ?? meta.supervisor,
      requiredHours: updatedMeta.requiredHours ?? meta.requiredHours,
      autoBreak: updatedMeta.autoBreak ?? meta.autoBreak,
    };
    await db.meta.put(merged);
  };

  const importState = async (importedData: { sessions?: Session[]; meta?: Partial<TrackerMeta> }) => {
    if (!userId) return { success: false, message: 'User not authenticated.' };
    try {
      if (Array.isArray(importedData.sessions)) {
        // Clear existing user sessions in Dexie
        await db.sessions.where('userId').equals(userId).delete();

        // Add imported sessions
        const newEntries: DbSession[] = importedData.sessions.map((s) => ({
          userId,
          date: s.date,
          timeIn: s.timeIn,
          timeOut: s.timeOut,
          timeInISO: s.timeInISO,
          timeOutISO: s.timeOutISO,
          hours: s.hours,
          remarks: s.remarks,
          breakMinutes: s.breakMinutes,
        }));
        await db.sessions.bulkAdd(newEntries);

        if (importedData.meta) {
          await saveMeta(importedData.meta);
        }

        return { success: true, message: 'Backup restored to Dexie DB successfully!' };
      }
      return { success: false, message: 'Invalid backup file structure.' };
    } catch {
      return { success: false, message: 'Failed to restore backup data.' };
    }
  };

  const clearAllData = async () => {
    if (!userId) return;
    await db.sessions.where('userId').equals(userId).delete();
    await db.meta.delete(userId);
    localStorage.removeItem(clockInKey);
    setClockedIn(false);
    setClockInTime(null);
  };

  return {
    sessions,
    meta,
    clockedIn,
    clockInTime,
    clockIn,
    clockOut,
    addManualSession,
    updateRemarks,
    deleteSession,
    saveMeta,
    importState,
    clearAllData,
  };
};