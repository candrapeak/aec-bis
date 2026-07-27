import test from 'node:test';
import assert from 'node:assert/strict';
import { buildReportCsv, buildPrintableReportHtml } from '../src/utils/export';

test('buildReportCsv includes headers and period rows', () => {
  const csv = buildReportCsv([
    { period: '2026-01', spend: 1000000, revenue: 2000000, conversations: 10, closings: 2 },
  ], 'Laporan Rekap');

  assert.match(csv, /period,spend,revenue,conversations,closings/i);
  assert.match(csv, /2026-01/);
  assert.match(csv, /1000000/);
});

test('buildPrintableReportHtml includes report title and table markup', () => {
  const html = buildPrintableReportHtml('Laporan Rekap', '<table></table>');

  assert.match(html, /Laporan Rekap/);
  assert.match(html, /<table>/);
  assert.match(html, /window.print/);
});
