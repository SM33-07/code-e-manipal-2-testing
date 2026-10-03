import crypto from 'crypto';
import { query } from '@/lib/db';
import { createSupabaseAdminClient } from '@/lib/supabase/admin';
import { UserRole } from '@/types';
import { logger } from '@/lib/utils/logger';

// Unambiguous alphanumeric alphabet (excludes 0, O, 1, I, l)
const EVENT_CHARSET = '23456789ABCDEFGHJKLMNPQRSTUVWXYZ';
const ADMIN_CHARSET = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*()-_=+';

/**
 * Generate a 6-character unambiguous event credential for participants and judges
 */
export function generateEventPassword(length = 6): string {
  let result = '';
  const bytes = crypto.randomBytes(length);
  for (let i = 0; i < length; i++) {
    result += EVENT_CHARSET[bytes[i] % EVENT_CHARSET.length];
  }
  return result;
}

/**
 * Generate a 16+ character high-entropy administrative credential
 */
export function generateAdminPassword(length = 18): string {
  let result = '';
  const bytes = crypto.randomBytes(length);
  for (let i = 0; i < length; i++) {
    result += ADMIN_CHARSET[bytes[i] % ADMIN_CHARSET.length];
  }
  return result;
}

export interface GeneratedCredential {
  id: string;
  name: string;
  email: string;
  role: 'participant' | 'judge';
  password: string; // Returned ONCE; never stored in plaintext
  team_id?: string | null;
  team_name?: string | null;
}

export interface BulkGenerateParams {
  role: 'participant' | 'judge';
  count: number;
  prefix?: string;
  admin_id: string;
  domain?: string;
}

/**
 * Formats credential objects into RFC-4180 compliant CSV format for badge printing
 */
export function formatCredentialsCSV(records: GeneratedCredential[]): string {
  const header = ['ID', 'Name', 'Email', 'Role', 'Temporary_Password', 'Team_ID', 'Team_Name'];
  const lines = [header.join(',')];

  for (const r of records) {
    const row = [
      `"${r.id}"`,
      `"${(r.name || '').replace(/"/g, '""')}"`,
      `"${(r.email || '').replace(/"/g, '""')}"`,
      `"${r.role}"`,
      `"${r.password}"`,
      `"${r.team_id || ''}"`,
      `"${(r.team_name || '').replace(/"/g, '""')}"`,
    ];
    lines.push(row.join(','));
  }

  return lines.join('\r\n');
}

/**
 * Bulk generate credentials for participants or judges.
 *
 * Security Invariants:
 * 1. Zero Plaintext Persistence: passwords stored hashed only by Supabase Auth (bcrypt).
 * 2. Zero Telemetry Leakage: passwords never logged to application logs or audit logs.
 * 3. Strict Separation of Admin Accounts: rejects role = 'admin'.
 * 4. Audit Logged: records action in audit_logs without credentials.
 */
export async function createBulkCredentials(
  params: BulkGenerateParams
): Promise<GeneratedCredential[]> {
  // Strict Separation of Admin Accounts (Phase 6 Baseline Line 603)
  if ((params.role as string) === 'admin') {
    throw new Error(
      'Strict Separation of Admin Accounts: The bulk generator produces 6-character credentials only for participants and judges. Administrative accounts must be provisioned with high-entropy credentials via secure management.'
    );
  }

  if (!params.role || (params.role !== 'participant' && params.role !== 'judge')) {
    throw new Error("Role must be 'participant' or 'judge'");
  }

  const count = Math.min(Math.max(1, Math.floor(params.count || 1)), 100);
  const prefix = (params.prefix || params.role).trim().toUpperCase();
  const domain = params.domain || 'codeemanipal.in';
  const supabase = createSupabaseAdminClient();

  const generatedList: GeneratedCredential[] = [];

  for (let i = 1; i <= count; i++) {
    const randomSuffix = crypto.randomBytes(3).toString('hex').toUpperCase();
    const identifier = `${prefix}-${randomSuffix}`;
    const email = `${identifier.toLowerCase()}@${domain}`;
    const name = `${params.role === 'judge' ? 'Judge' : 'Team Member'} ${identifier}`;
    const password = generateEventPassword(6);

    // 1. Create Supabase Auth user (hashes password with bcrypt)
    const { data: authData, error: authError } = await supabase.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: {
        name,
        role: params.role,
        identifier,
      },
    });

    if (authError || !authData.user) {
      logger.error('Failed to create auth user in bulk generator', {
        email,
        error: authError?.message,
      });
      continue;
    }

    const userId = authData.user.id;

    // 2. Sync to Azure auth.users table for schema consistency
    try {
      await query(
        'INSERT INTO auth.users (id, email, raw_user_meta_data) VALUES ($1, $2, $3) ON CONFLICT (id) DO NOTHING',
        [userId, email, JSON.stringify({ name, role: params.role, identifier })]
      );
    } catch {
      // ignore
    }

    // 3. Upsert public.profiles row
    await query(
      `INSERT INTO public.profiles (id, name, email, avatar_url, role, identifier)
       VALUES ($1, $2, $3, '', $4, $5)
       ON CONFLICT (id) DO UPDATE SET role = EXCLUDED.role, name = EXCLUDED.name, identifier = EXCLUDED.identifier`,
      [userId, name, email, params.role, identifier]
    );

    generatedList.push({
      id: userId,
      name,
      email,
      role: params.role,
      password, // returned once to caller for badge printing
    });
  }

  // 4. Record bulk generation in audit_logs (NO passwords logged)
  await query(
    `INSERT INTO public.audit_logs (user_id, action, target_table, details)
     VALUES ($1, $2, $3, $4)`,
    [
      params.admin_id,
      'BULK_CREDENTIALS_GENERATED',
      'profiles',
      JSON.stringify({
        role: params.role,
        count_requested: count,
        count_generated: generatedList.length,
        prefix,
      }),
    ]
  );

  logger.info('Bulk credentials successfully generated', {
    adminId: params.admin_id,
    role: params.role,
    count: generatedList.length,
  });

  return generatedList;
}

/**
 * Bulk deactivation of event credentials upon event conclusion (ENDED phase)
 */
export async function bulkDeactivateEventAccounts(adminId: string): Promise<number> {
  const { rows } = await query(
    `UPDATE public.profiles
     SET is_disabled = true, updated_at = NOW()
     WHERE role IN ('participant', 'judge') AND is_disabled = false
     RETURNING id`
  );

  const count = rows.length;

  await query(
    `INSERT INTO public.audit_logs (user_id, action, target_table, details)
     VALUES ($1, $2, $3, $4)`,
    [
      adminId,
      'BULK_ACCOUNTS_DEACTIVATED',
      'profiles',
      JSON.stringify({ count, target_roles: ['participant', 'judge'] }),
    ]
  );

  logger.info('Event accounts bulk deactivated on event conclusion', {
    adminId,
    deactivatedCount: count,
  });

  return count;
}
