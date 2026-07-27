export interface ReportExportRow {
  period: string;
  count?: number;
  spend: number;
  impression: number;
  ctr: number;
  cpc: number;
  conversations: number;
  closings: number;
  revenue: number;
  roas: number;
  costPerClosing: number;
}

export function buildReportCsv(rows: ReportExportRow[], title: string): string {
  const headers = ['period', 'spend', 'revenue', 'conversations', 'closings', 'count', 'impression', 'ctr', 'cpc', 'roas', 'costPerClosing'];
  const lines = [headers.join(',')];

  rows.forEach((row) => {
    const values = [
      row.period,
      row.spend,
      row.revenue,
      row.conversations,
      row.closings,
      row.count ?? 0,
      row.impression,
      row.ctr,
      row.cpc,
      row.roas,
      row.costPerClosing,
    ];

    lines.push(values.map((value) => String(value).replace(/,/g, ' ')).join(','));
  });

  return `# ${title}\n${lines.join('\n')}`;
}

export function buildPrintableReportHtml(title: string, tableHtml: string): string {
  return `<!DOCTYPE html>
<html lang="id">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>${title}</title>
    <style>
      body { font-family: Arial, sans-serif; padding: 24px; color: #111827; }
      h1 { font-size: 20px; margin-bottom: 16px; }
      table { width: 100%; border-collapse: collapse; font-size: 12px; }
      th, td { border: 1px solid #d1d5db; padding: 8px; text-align: left; }
      th { background: #f3f4f6; }
      @media print { body { padding: 0; } .no-print { display: none; } }
    </style>
  </head>
  <body>
    <div class="no-print" style="margin-bottom: 12px;">
      <button onclick="window.print()" type="button">Cetak / Simpan PDF</button>
    </div>
    <h1>${title}</h1>
    ${tableHtml}
  </body>
</html>`;
}
