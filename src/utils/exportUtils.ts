import * as XLSX from 'xlsx';
import { format } from 'date-fns';
import type { Session, TrackerMeta } from '../types';
import { formatHours, getTotalHours } from './timeUtils';

export interface ExportOptions {
  includeProfile: boolean;
  includeRemarks: boolean;
  includeBreaks: boolean;
  includeSummaryTotals: boolean;
}

export interface AmPmBreakdown {
  amIn: string;
  amOut: string;
  pmIn: string;
  pmOut: string;
}

/**
 * Safely parses any time string (e.g. "08:00", "08:00 AM", "8:00:00", "5:30 PM")
 * into numeric 24-hour hours and minutes, eliminating NaN errors.
 */
export const parseTimeTo24H = (timeStr: string): { h: number; m: number } => {
  if (!timeStr) return { h: 0, m: 0 };
  const clean = timeStr.trim().toUpperCase();
  const isPM = clean.includes('PM');
  const isAM = clean.includes('AM');

  // Strip AM/PM letters and split digits
  const rawNumbers = clean.replace(/[A-Z]/g, '').trim().split(':');
  let h = parseInt(rawNumbers[0] || '0', 10);
  let m = parseInt(rawNumbers[1] || '0', 10);

  if (isNaN(h)) h = 0;
  if (isNaN(m)) m = 0;

  if (isPM && h < 12) h += 12;
  if (isAM && h === 12) h = 0;

  return { h, m };
};

export const formatTime12H = (h: number, m: number): string => {
  const period = h >= 12 ? 'PM' : 'AM';
  const displayH = h % 12 === 0 ? 12 : h % 12;
  const hStr = displayH < 10 ? `0${displayH}` : `${displayH}`;
  const mStr = m < 10 ? `0${m}` : `${m}`;
  return `${hStr}:${mStr} ${period}`;
};

export const getAmPmBreakdown = (session: Session): AmPmBreakdown => {
  const { h: inH, m: inM } = parseTimeTo24H(session.timeIn);
  const { h: outH, m: outM } = parseTimeTo24H(session.timeOut);

  const hasLunchBreak = (session.breakMinutes || 0) > 0 && inH < 12 && outH >= 13;

  if (hasLunchBreak) {
    return {
      amIn: formatTime12H(inH, inM),
      amOut: '12:00 PM',
      pmIn: '01:00 PM',
      pmOut: formatTime12H(outH, outM),
    };
  }

  if (inH < 12 && outH <= 12) {
    return {
      amIn: formatTime12H(inH, inM),
      amOut: formatTime12H(outH, outM),
      pmIn: '—',
      pmOut: '—',
    };
  }

  if (inH >= 12 && outH >= 12) {
    return {
      amIn: '—',
      amOut: '—',
      pmIn: formatTime12H(inH, inM),
      pmOut: formatTime12H(outH, outM),
    };
  }

  return {
    amIn: formatTime12H(inH, inM),
    amOut: '12:00 PM',
    pmIn: '12:00 PM',
    pmOut: formatTime12H(outH, outM),
  };
};

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
  lines.push('Date        | AM In    | AM Out   | PM In    | PM Out   | Hours  | Remarks');
  lines.push('-------------------------------------------------------------------------------');

  sessions.forEach((session) => {
    const amPm = getAmPmBreakdown(session);
    lines.push(
      `${session.date.padEnd(11)} | ${amPm.amIn.padEnd(8)} | ${amPm.amOut.padEnd(8)} | ${amPm.pmIn.padEnd(8)} | ${amPm.pmOut.padEnd(8)} | ${formatHours(session.hours).padEnd(6)} | ${session.remarks || '—'}`
    );
  });

  lines.push('-------------------------------------------------------------------------------');
  lines.push(`Total Rendered: ${formatHours(totalHours)} hrs | Remaining: ${formatHours(hoursLeft)} hrs`);

  return lines.join('\n');
};

export const downloadTextReport = (sessions: Session[], meta: TrackerMeta) => {
  const text = buildTextReport(sessions, meta);
  const blob = new Blob([text], { type: 'text/plain;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `ojt-logbook-dtr-${format(new Date(), 'yyyy-MM-dd')}.txt`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  setTimeout(() => URL.revokeObjectURL(url), 1000);
};

/**
 * Generates and automatically downloads the Excel (.xlsx) file directly
 * to the mobile/desktop device storage without Web Share prompts.
 */
export const downloadExcelReport = (sessions: Session[], meta: TrackerMeta, options?: ExportOptions) => {
  const workbook = XLSX.utils.book_new();
  const totalHours = getTotalHours(sessions);
  const hoursLeft = Math.max(meta.requiredHours - totalHours, 0);

  const rows: Array<Array<string | number>> = [];

  // 1. Trainee Profile Block
  if (!options || options.includeProfile) {
    rows.push(['OJT DAILY TIME RECORD (DTR)']);
    rows.push(['Trainee Name:', meta.name || '—', '', 'Company / Agency:', meta.company || '—']);
    rows.push(['School / University:', meta.school || '—', '', 'Supervisor:', meta.supervisor || '—']);
    rows.push(['Required Hours:', `${formatHours(meta.requiredHours)} hrs`, '', 'Hours Rendered:', `${formatHours(totalHours)} hrs`]);
    rows.push(['Hours Remaining:', `${formatHours(hoursLeft)} hrs`, '', 'Generated Date:', format(new Date(), 'yyyy-MM-dd hh:mm a')]);
    rows.push([]);
  }

  // 2. DTR Header Row
  const headerRow: string[] = ['Date', 'AM Time In', 'AM Time Out', 'PM Time In', 'PM Time Out', 'Hours'];
  if (options?.includeBreaks) {
    headerRow.push('Break (mins)');
  }
  if (!options || options.includeRemarks) {
    headerRow.push('Remarks');
  }
  rows.push(headerRow);

  // 3. DTR Session Log Rows
  sessions.forEach((s) => {
    const amPm = getAmPmBreakdown(s);
    const row: Array<string | number> = [
      s.date,
      amPm.amIn,
      amPm.amOut,
      amPm.pmIn,
      amPm.pmOut,
      s.hours,
    ];
    if (options?.includeBreaks) {
      row.push(s.breakMinutes ?? 0);
    }
    if (!options || options.includeRemarks) {
      row.push(s.remarks || '');
    }
    rows.push(row);
  });

  // 4. Totals Summary Row
  if (!options || options.includeSummaryTotals) {
    const totalRow: Array<string | number> = [
      'TOTAL',
      '—',
      '—',
      '—',
      '—',
      Number(totalHours.toFixed(2)),
    ];
    if (options?.includeBreaks) {
      totalRow.push('—');
    }
    if (!options || options.includeRemarks) {
      totalRow.push('—');
    }
    rows.push(totalRow);
  }

  const dtrSheet = XLSX.utils.aoa_to_sheet(rows);

  dtrSheet['!cols'] = [
    { wch: 14 },
    { wch: 14 },
    { wch: 14 },
    { wch: 14 },
    { wch: 14 },
    { wch: 10 },
    ...(options?.includeBreaks ? [{ wch: 12 }] : []),
    ...(!options || options.includeRemarks ? [{ wch: 25 }] : []),
  ];

  XLSX.utils.book_append_sheet(workbook, dtrSheet, 'DTR Logbook');

  // Generate Excel ArrayBuffer & Blob for mobile-direct device save
  const wbout = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
  const blob = new Blob([wbout], {
    type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  });

  const fileName = `ojt-logbook-dtr-${format(new Date(), 'yyyy-MM-dd')}.xlsx`;
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = fileName;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);

  setTimeout(() => URL.revokeObjectURL(url), 1500);
};