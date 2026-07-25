import * as XLSX from 'xlsx';
import { format, parseISO, startOfWeek } from 'date-fns';
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

const buildRows = (sessions: Session[], options?: ExportOptions) =>
  sessions.map((session) => {
    const amPm = getAmPmBreakdown(session);
    const row: Record<string, string | number | undefined> = {
      Date: session.date,
      'AM Time In': amPm.amIn,
      'AM Time Out': amPm.amOut,
      'PM Time In': amPm.pmIn,
      'PM Time Out': amPm.pmOut,
    };
    if (options?.includeBreaks) {
      row['Break (Min)'] = session.breakMinutes || 0;
    }
    row.Hours = formatHours(session.hours);
    if (!options || options.includeRemarks) {
      row.Remarks = session.remarks || '';
    }
    return row;
  });

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

  const summaryRows: Array<Array<string | number>> = [
    ['OJT Logbook Summary'],
  ];

  if (!options || options.includeProfile) {
    summaryRows.push(
      ['Name', meta.name || ''],
      ['School', meta.school || ''],
      ['Company', meta.company || '']
    );
  }

  summaryRows.push(
    ['Required Hours', formatHours(meta.requiredHours)],
    ['Total Hours Rendered', formatHours(totalHours)],
    []
  );

  if (!options || options.includeSummaryTotals) {
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

    summaryRows.push(['Monthly Breakdown (Month, Hours)'], ['Month', 'Hours']);
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
  }

  const summarySheet = XLSX.utils.aoa_to_sheet(summaryRows);
  const sessionSheet = XLSX.utils.json_to_sheet(buildRows(sessions, options));

  XLSX.utils.book_append_sheet(workbook, summarySheet, 'Summary');
  XLSX.utils.book_append_sheet(workbook, sessionSheet, 'Sessions');

  XLSX.writeFile(workbook, `ojt-logbook-dtr-${format(new Date(), 'yyyy-MM-dd')}.xlsx`);
};