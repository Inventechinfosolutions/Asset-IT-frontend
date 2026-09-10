import * as XLSX from 'xlsx-js-style';

import { fetchAllRequestsApi } from '@/features/requests/api/requests-api';
import type { AdminSupportRequest } from '@/features/requests';
import { formatRequestStatus } from '@/features/requests';

function formatRequestType(type: AdminSupportRequest['requestType']): string {
  return type === 'DEVICE' ? 'Device' : 'IT Support';
}

function formatAssets(request: AdminSupportRequest): string {
  if (!request.selectedAssets?.length) return '';
  return request.selectedAssets
    .map((row) => `${row.name} (x${row.quantity})`)
    .join('; ');
}

function formatDateTime(value?: string | null): string {
  if (!value) return '';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleString();
}

async function fetchAllTicketDetails(): Promise<AdminSupportRequest[]> {
  const limit = 100;
  const first = await fetchAllRequestsApi({ page: 1, limit });
  const pages = Math.max(1, first.totalPages || 1);
  const all = [...first.data];

  for (let page = 2; page <= pages; page += 1) {
    const next = await fetchAllRequestsApi({ page, limit });
    all.push(...next.data);
  }

  return all;
}

function toExcelRows(requests: AdminSupportRequest[]) {
  return requests.map((request) => ({
    'Request Code':
      request.requestCode || `REQ-${String(request.id).padStart(2, '0')}`,
    'Request Type': formatRequestType(request.requestType),
    Title: request.title || '',
    User: request.user?.name || request.user?.aliasName || '',
    'Emp No': request.user?.empNo || '',
    Department: request.user?.department || '',
    Zone: request.zone || '',
    Location: request.location || '',
    Description: request.description || '',
    Assets: formatAssets(request),
    'Assigned To':
      request.assignee?.name || request.assignee?.aliasName || '',
    Status: formatRequestStatus(request.status),
    Comment: request.adminComment || '',
    'Created Date': formatDateTime(request.createdAt),
    'Updated Date': formatDateTime(request.updatedAt),
  }));
}

const HEADER_STYLE = {
  fill: {
    patternType: 'solid',
    fgColor: { rgb: '0256CC' },
  },
  font: {
    bold: true,
    color: { rgb: 'FFFFFF' },
  },
  alignment: {
    horizontal: 'center',
    vertical: 'center',
    wrapText: true,
  },
};

function applyBlueHeaderStyle(worksheet: XLSX.WorkSheet) {
  const range = XLSX.utils.decode_range(worksheet['!ref'] || 'A1');
  for (let col = range.s.c; col <= range.e.c; col += 1) {
    const cellAddress = XLSX.utils.encode_cell({ r: 0, c: col });
    const cell = worksheet[cellAddress];
    if (!cell) continue;
    cell.s = HEADER_STYLE;
  }
}

export async function downloadTicketDetailsExcel(): Promise<number> {
  const requests = await fetchAllTicketDetails();
  const rows = toExcelRows(requests);
  const worksheet = XLSX.utils.json_to_sheet(
    rows.length
      ? rows
      : [
          {
            'Request Code': '',
            'Request Type': '',
            Title: '',
            User: '',
            'Emp No': '',
            Department: '',
            Zone: '',
            Location: '',
            Description: '',
            Assets: '',
            'Assigned To': '',
            Status: '',
            Comment: '',
            'Created Date': '',
            'Updated Date': '',
          },
        ],
  );

  applyBlueHeaderStyle(worksheet);

  worksheet['!cols'] = [
    { wch: 14 },
    { wch: 12 },
    { wch: 28 },
    { wch: 20 },
    { wch: 12 },
    { wch: 18 },
    { wch: 14 },
    { wch: 28 },
    { wch: 36 },
    { wch: 28 },
    { wch: 20 },
    { wch: 14 },
    { wch: 28 },
    { wch: 20 },
    { wch: 20 },
  ];

  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Ticket Details');

  const stamp = new Date().toISOString().slice(0, 10);
  XLSX.writeFile(workbook, `ticket-details-${stamp}.xlsx`);

  return requests.length;
}
