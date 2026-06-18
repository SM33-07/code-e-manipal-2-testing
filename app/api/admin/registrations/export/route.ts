import { NextResponse } from 'next/server';
import { withAuth } from '@/lib/middleware/withAuth';
import { query } from '@/lib/db';
import { Errors } from '@/lib/utils/response';
import { logger } from '@/lib/utils/logger';
import * as XLSX from 'xlsx';

/**
 * GET /api/admin/registrations/export
 * Admin only — export registrations to Excel (.xlsx).
 *
 * Query params:
 *   status — pending | approved | rejected (optional, default: all)
 *   round  — 1 | 2 (optional, default: all)
 */
export const GET = withAuth(async (req) => {
  try {
    const status = req.nextUrl.searchParams.get('status');
    const round = req.nextUrl.searchParams.get('round');

    let sql = 'SELECT * FROM public.hackathon_registrations WHERE 1=1';
    const params: any[] = [];
    let paramIdx = 1;

    if (status && ['pending', 'approved', 'rejected'].includes(status)) {
      sql += ` AND status = $${paramIdx++}`;
      params.push(status);
    }

    if (round && ['1', '2'].includes(round)) {
      sql += ` AND round = $${paramIdx++}`;
      params.push(parseInt(round, 10));
    }

    sql += ' ORDER BY created_at DESC';

    const result = await query(sql, params);

    // Build Excel data
    const rows = result.rows.map((r: any) => ({
      'Name': r.name,
      'Team Name': r.team_name,
      'Phone': r.phone,
      'Email': r.email,
      'Round': r.round,
      'Status': r.status.charAt(0).toUpperCase() + r.status.slice(1),
      'Applied At': r.created_at ? new Date(r.created_at).toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' }) : '',
      'Reviewed At': r.reviewed_at ? new Date(r.reviewed_at).toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' }) : '',
    }));

    const wb = XLSX.utils.book_new();
    const ws = XLSX.utils.json_to_sheet(rows);

    // Set column widths for readability
    ws['!cols'] = [
      { wch: 25 }, // Name
      { wch: 25 }, // Team Name
      { wch: 15 }, // Phone
      { wch: 30 }, // Email
      { wch: 8 },  // Round
      { wch: 12 }, // Status
      { wch: 22 }, // Applied At
      { wch: 22 }, // Reviewed At
    ];

    XLSX.utils.book_append_sheet(wb, ws, 'Registrations');

    const buffer = XLSX.write(wb, { type: 'buffer', bookType: 'xlsx' });

    const filename = `registrations_${new Date().toISOString().split('T')[0]}.xlsx`;

    logger.info('GET /api/admin/registrations/export', {
      status: status ?? 'all',
      round: round ?? 'all',
      count: rows.length,
    });

    return new NextResponse(buffer, {
      headers: {
        'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        'Content-Disposition': `attachment; filename="${filename}"`,
      },
    });
  } catch (err) {
    logger.error('GET /api/admin/registrations/export', { error: String(err) });
    return Errors.INTERNAL();
  }
}, 'admin');
