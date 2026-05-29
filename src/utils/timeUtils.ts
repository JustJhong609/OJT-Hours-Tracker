import { differenceInMinutes, format, parse } from 'date-fns';
import type { Session, TrackerMeta } from '../types';

export const formatDisplayTime = (date: Date) => format(date, 'hh:mm a');
export const formatDisplayDate = (date: Date) => format(date, 'yyyy-MM-dd');

export const toIsoDateTime = (dateValue: string, timeValue: string) =>
  parse(`${dateValue} ${timeValue}`, 'yyyy-MM-dd HH:mm', new Date()).toISOString();

export const calculateHours = (startISO: string, endISO: string) => {
  const start = new Date(startISO);
  const end = new Date(endISO);

  // total minutes between start and end
  const totalMinutes = (end.getTime() - start.getTime()) / 60000;

  // subtract any overlap with the lunch window (12:00 - 12:59) for each day spanned
  let lunchOverlapMinutes = 0;
  const dayMs = 24 * 60 * 60 * 1000;
  // iterate each day boundary from start's day to end's day
  const startOfStartDay = new Date(start);
  startOfStartDay.setHours(0, 0, 0, 0);

  for (
    let day = new Date(startOfStartDay);
    day.getTime() <= end.getTime();
    day = new Date(day.getTime() + dayMs)
  ) {
    const lunchStart = new Date(day);
    lunchStart.setHours(12, 0, 0, 0);
    const lunchEnd = new Date(day);
    lunchEnd.setHours(13, 0, 0, 0);

    const overlapStart = Math.max(start.getTime(), lunchStart.getTime());
    const overlapEnd = Math.min(end.getTime(), lunchEnd.getTime());

    if (overlapEnd > overlapStart) {
      lunchOverlapMinutes += (overlapEnd - overlapStart) / 60000;
    }
  }

  const effectiveMinutes = Math.max(totalMinutes - lunchOverlapMinutes, 0);
  return Number((effectiveMinutes / 60).toFixed(2));
};

export const formatHours = (hours: number) => hours.toFixed(2);

export const getDistinctWorkDays = (sessions: Session[]) => {
  return new Set(sessions.map((session) => session.date)).size;
};

export const getTotalHours = (sessions: Session[]) => {
  return sessions.reduce((total, session) => total + session.hours, 0);
};

export const getHoursLeft = (sessions: Session[], meta: TrackerMeta) => {
  return Math.max(meta.requiredHours - getTotalHours(sessions), 0);
};

export const getAverageHours = (sessions: Session[]) => {
  const days = getDistinctWorkDays(sessions);
  if (days === 0) {
    return 0;
  }

  return Number((getTotalHours(sessions) / days).toFixed(2));
};

export const getElapsedSeconds = (startISO: string | null) => {
  if (!startISO) {
    return 0;
  }

  return Math.max(Math.floor((Date.now() - new Date(startISO).getTime()) / 1000), 0);
};

export const formatElapsedTime = (seconds: number) => {
  const hours = Math.floor(seconds / 3600)
    .toString()
    .padStart(2, '0');
  const minutes = Math.floor((seconds % 3600) / 60)
    .toString()
    .padStart(2, '0');
  const remainingSeconds = (seconds % 60).toString().padStart(2, '0');

  return `${hours}:${minutes}:${remainingSeconds}`;
};

export const ensureTwoDigits = (value: number) => value.toString().padStart(2, '0');