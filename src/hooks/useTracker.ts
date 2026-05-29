import { useEffect, useState } from 'react';
import { formatDisplayDate, formatDisplayTime, calculateHours, toIsoDateTime } from '../utils/timeUtils';
import type { ManualEntryValues, Session, TrackerMeta, TrackerState } from '../types';

const STORAGE_KEY = 'ojt-hours-tracker-state-v1';

const defaultMeta: TrackerMeta = {
  name: '',
  school: '',
  company: '',
  requiredHours: 486,
};

const defaultState: TrackerState = {
  sessions: [],
  meta: defaultMeta,
  clockedIn: false,
  clockInTime: null,
};

const loadState = (): TrackerState => {
  if (typeof window === 'undefined') {
    return defaultState;
  }

  const saved = window.localStorage.getItem(STORAGE_KEY);
  if (!saved) {
    return defaultState;
  }

  try {
    const parsed = JSON.parse(saved) as TrackerState;
    return {
      sessions: Array.isArray(parsed.sessions) ? parsed.sessions : [],
      meta: {
        ...defaultMeta,
        ...(parsed.meta ?? {}),
      },
      clockedIn: Boolean(parsed.clockedIn),
      clockInTime: parsed.clockInTime ?? null,
    };
  } catch {
    return defaultState;
  }
};

export const useTracker = () => {
  const [state, setState] = useState<TrackerState>(loadState);

  useEffect(() => {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  }, [state]);

  const clockIn = () => {
    setState((current) => {
      if (current.clockedIn) {
        return current;
      }

      return {
        ...current,
        clockedIn: true,
        clockInTime: new Date().toISOString(),
      };
    });
  };

  const clockOut = () => {
    setState((current) => {
      if (!current.clockedIn || !current.clockInTime) {
        return current;
      }

      const now = new Date();
      const timeInISO = current.clockInTime;
      const timeOutISO = now.toISOString();
      const session = {
        id: crypto.randomUUID(),
        date: formatDisplayDate(now),
        timeIn: formatDisplayTime(new Date(timeInISO)),
        timeOut: formatDisplayTime(now),
        timeInISO,
        timeOutISO,
        hours: calculateHours(timeInISO, timeOutISO),
        remarks: '',
      } as Session;

      return {
        ...current,
        sessions: [session, ...current.sessions],
        clockedIn: false,
        clockInTime: null,
      };
    });
  };

  const addManualSession = (values: ManualEntryValues) => {
    const timeInISO = toIsoDateTime(values.date, values.timeIn);
    const timeOutISO = toIsoDateTime(values.date, values.timeOut);

    if (new Date(timeOutISO).getTime() <= new Date(timeInISO).getTime()) {
      return { success: false, message: 'Time Out must be later than Time In.' };
    }

    const session: Session = {
      id: crypto.randomUUID(),
      date: values.date,
      timeIn: formatDisplayTime(new Date(timeInISO)),
      timeOut: formatDisplayTime(new Date(timeOutISO)),
      timeInISO,
      timeOutISO,
      hours: calculateHours(timeInISO, timeOutISO),
      remarks: '',
    };

    setState((current) => ({
      ...current,
      sessions: [session, ...current.sessions],
    }));

    return { success: true, message: 'Session added!' };
  };

  const updateRemarks = (sessionId: string, remarks: string) => {
    setState((current) => ({
      ...current,
      sessions: current.sessions.map((session) =>
        session.id === sessionId ? { ...session, remarks } : session
      ),
    }));
  };

  const deleteSession = (sessionId: string) => {
    setState((current) => ({
      ...current,
      sessions: current.sessions.filter((session) => session.id !== sessionId),
    }));
  };

  const saveMeta = (meta: TrackerMeta) => {
    setState((current) => ({
      ...current,
      meta: {
        ...current.meta,
        ...meta,
        requiredHours: Number.isFinite(meta.requiredHours) ? meta.requiredHours : defaultMeta.requiredHours,
      },
    }));
  };

  const clearAllData = () => {
    setState(defaultState);
  };

  return {
    sessions: state.sessions,
    meta: state.meta,
    clockedIn: state.clockedIn,
    clockInTime: state.clockInTime,
    clockIn,
    clockOut,
    addManualSession,
    updateRemarks,
    deleteSession,
    saveMeta,
    clearAllData,
    setMeta: saveMeta,
  };
};