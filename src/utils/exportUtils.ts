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

export const getAmPmBreakdown = (session: Session): AmPmBreakdown => {
  const [inH, inM] = session.timeIn.split(':').map(Number);
  const [outH, outM] = session.timeOut.split(':').map(Number);

  const formatTimeStr = (h: number, m: number) => {
    const period = h >= 12 ? 'PM' : 'AM';
    const displayH = h % 12 === 0 ? 12 : h % 12;
    const displayM = m < 10 ? `0${m}` : `${m}`;
    return `${displayH < 10 ? '0' + displayH : displayH}:${displayM} ${period}`;
  };

  const hasLunchBreak = (session.breakMinutes || 0) > 0 && inH < 12 && outH >= 13;

  if (hasLunchBreak) {
    return {
      amIn: formatTimeStr(inH, inM),
      amOut: '12:00 PM',
      pmIn: '01:00 PM',
      pmOut: formatTimeStr(outH, outM),
    };
  }

  if (inH < 12 && outH <= 12) {
    return {
      amIn: formatTimeStr(inH, inM),
      amOut: formatTimeStr(outH, outM),
      pmIn: '—',
      pmOut: '—',
    };
  }

  if (inH >= 12 && outH >= 12) {
    return {
      amIn: '—',
      amOut: '—',
      pmIn: formatTimeStr(inH, inM),
      pmOut: formatTimeStr(outH, outM),
    };
  }

  return {
    amIn: formatTimeStr(inH, inM),
    amOut: '12:00 PM',
    pmIn: '12:00 PM',
    pmOut: formatTimeStr(outH, outM),
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
  a.click();
  URL.revokeObjectURL(url);
};

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
    { wch: 12 },
    { wch: 12 },
    { wch: 12 },
    { wch: 12 },
    { wch: 10 },
    ...(options?.includeBreaks ? [{ wch: 12 }] : []),
    ...(!options || options.includeRemarks ? [{ wch: 25 }] : []),
  ];

  XLSX.utils.book_append_sheet(workbook, dtrSheet, 'DTR Logbook');
  XLSX.writeFile(workbook, `ojt-logbook-dtr-${format(new Date(), 'yyyy-MM-dd')}.xlsx`);
};