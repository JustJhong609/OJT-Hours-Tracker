import * as XLSX from 'xlsx';
import { format, parseISO, startOfWeek } from 'date-fns';
import type { Session, TrackerMeta } from '../types';
import { formatHours, getTotalHours } from './timeUtils';

const buildRows = (sessions: Session[]) =>
  sessions.map((session) => ({
    Date: session.date,
    'Time In': session.timeIn,
    'Time Out': session.timeOut,
    Hours: formatHours(session.hours),
    Remarks: session.remarks,
  }));

export const buildTextReport = (sessions: Session[], meta: TrackerMeta) => {
  const lines: string[] = [];
  const totalHours = getTotalHours(sessions);
  const hoursLeft = Math.max(meta.requiredHours - totalHours, 0);

  lines.push('OJT LOGBOOK DTR');
  lines.push(`Name: ${meta.name || '—'}`);
  lines.push(`School: ${meta.school || '—'}`);
  lines.push(`Company: ${meta.company || '—'}`);
  lines.push(`Required Hours: ${formatHours(meta.requiredHours)}`);
  lines.push(`Generated: ${format(new Date(), 'yyyy-MM-dd hh:mm a')}`);
  lines.push('');
  lines.push('Date        | Time In   | Time Out  | Hours  | Remarks');
  lines.push('-----------------------------------------------------------------------');

  sessions.forEach((session) => {
    lines.push(
      `${session.date.padEnd(11)} | ${session.timeIn.padEnd(9)} | ${session.timeOut.padEnd(9)} | ${formatHours(session.hours).padEnd(6)} | ${session.remarks || '—'}`
    );
  });

  lines.push('-----------------------------------------------------------------------');
  lines.push(`Total Hours: ${formatHours(totalHours)}`);
  lines.push(`Hours Left: ${formatHours(hoursLeft)}`);

  return lines.join('\n');
};

export const downloadTextReport = (sessions: Session[], meta: TrackerMeta) => {
  const content = buildTextReport(sessions, meta);
  const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);

  link.href = url;
  link.download = `ojt-logbook-${format(new Date(), 'yyyyMMdd-HHmm')}.txt`;
  link.click();
  URL.revokeObjectURL(url);
};

export const downloadExcelReport = (sessions: Session[], meta: TrackerMeta) => {
  const workbook = XLSX.utils.book_new();
  const totalHours = getTotalHours(sessions);

  // Aggregate by month
  const monthly: Record<string, number> = {};
  sessions.forEach((s) => {
    const month = s.date.slice(0, 7); // yyyy-MM
    monthly[month] = (monthly[month] || 0) + s.hours;
  });

  // Aggregate by week (week start date)
  const weekly: Record<string, number> = {};
  sessions.forEach((s) => {
    const ws = format(startOfWeek(parseISO(s.timeInISO), { weekStartsOn: 1 }), 'yyyy-MM-dd');
    weekly[ws] = (weekly[ws] || 0) + s.hours;
  });

  const summaryRows: any[] = [
    ['OJT Logbook Summary'],
    ['Name', meta.name || ''],
    ['School', meta.school || ''],
    ['Company', meta.company || ''],
    ['Required Hours', formatHours(meta.requiredHours)],
    ['Total Hours', formatHours(totalHours)],
    [],
    ['Monthly Breakdown (Month, Hours)'],
    ['Month', 'Hours'],
  ];

  Object.keys(monthly)
    .sort()
    .forEach((m) => {
      summaryRows.push([m, formatHours(monthly[m])]);
    });

  summaryRows.push([], ['Weekly Breakdown (Week Start, Hours)'], ['Week Start', 'Hours']);
  Object.keys(weekly)
    .sort()
    .forEach((w) => {
      summaryRows.push([w, formatHours(weekly[w])]);
    });

  const summarySheet = XLSX.utils.aoa_to_sheet(summaryRows);
  const sessionSheet = XLSX.utils.json_to_sheet(buildRows(sessions));

  XLSX.utils.book_append_sheet(workbook, summarySheet, 'Summary');
  XLSX.utils.book_append_sheet(workbook, sessionSheet, 'Sessions');
  XLSX.writeFile(workbook, `ojt-logbook-${format(new Date(), 'yyyyMMdd-HHmm')}.xlsx`);
};

export const downloadCsvReport = (sessions: Session[], meta: TrackerMeta) => {
  const workbook = XLSX.utils.book_new();
  const sheet = XLSX.utils.json_to_sheet(buildRows(sessions));
  XLSX.utils.book_append_sheet(workbook, sheet, 'Sessions');
  XLSX.writeFile(workbook, `ojt-logbook-${meta.name ? meta.name.toLowerCase().replace(/\s+/g, '-') : 'export'}.csv`);
};