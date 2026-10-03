import { NextRequest } from 'next/server';
import { withAuth } from '@/lib/middleware/withAuth';
import { query } from '@/lib/db';
import { successResponse, Errors } from '@/lib/utils/response';
import { logger } from '@/lib/utils/logger';
import { getEventConfigState } from '@/lib/event/eventConfigHelper';

/**
 * GET /api/event-config
 * Public — retrieves global hackathon timer and phase configuration.
 * Strictly read-only (no database mutation side-effects).
 */
export async function GET(req: NextRequest) {
  try {
    const config = await getEventConfigState();
    return successResponse(config);
  } catch (err) {
    logger.error('GET /api/event-config failed', { error: String(err) });
    return Errors.INTERNAL('Failed to fetch event configuration.');
  }
}

/**
 * PATCH /api/event-config
 * Admin only — updates hackathon phase, timer settings, and results publishing state.
 * Compatible with both post-migration singleton schema and pre-migration key-value schema.
 */
export const PATCH = withAuth(async (req, { user }) => {
  try {
    const body = await req.json();
    const {
      hackathon_start_time,
      hackathon_duration_hours,
      hackathon_is_started,
      results_published,
      results_publish_time,
      event_phase,
      results_release,
      buffer_minutes,
    } = body;

    // Detect if database has migrated to structured singleton table
    let isSingleton = false;
    try {
      const check = await query('SELECT 1 FROM information_schema.columns WHERE table_name = $1 AND column_name = $2', [
        'event_config',
        'event_phase',
      ]);
      isSingleton = check.rows.length > 0;
    } catch (e) {
      isSingleton = false;
    }

    if (isSingleton) {
      // 1. Structured Singleton Update
      let mappedPhase = event_phase;
      if (!mappedPhase && hackathon_is_started !== undefined) {
        mappedPhase = (hackathon_is_started === 'true' || hackathon_is_started === true) ? 'HACKING' : 'NOT_STARTED';
      }
      let mappedRelease = results_release;
      if (!mappedRelease && results_published !== undefined) {
        if (results_published === 'true') mappedRelease = 'PUBLISHED';
        else if (results_published === 'publishing') mappedRelease = 'PUBLISHING';
        else mappedRelease = 'DRAFT';
      }

      const startTimeVal = hackathon_start_time ? new Date(hackathon_start_time).toISOString() : null;
      const bufferVal = buffer_minutes ? parseInt(buffer_minutes, 10) : null;

      await query(
        `UPDATE public.event_config SET
           event_phase = COALESCE($1, event_phase),
           results_release = COALESCE($2, results_release),
           start_time = COALESCE($3, start_time),
           buffer_minutes = COALESCE($4, buffer_minutes),
           updated_at = NOW()
         WHERE id = 1`,
        [mappedPhase || null, mappedRelease || null, startTimeVal, bufferVal]
      );
    } else {
      // 2. Legacy Key-Value Update
      const updates: { key: string; val: string }[] = [];
      if (hackathon_start_time !== undefined) updates.push({ key: 'hackathon_start_time', val: String(hackathon_start_time) });
      if (hackathon_duration_hours !== undefined) updates.push({ key: 'hackathon_duration_hours', val: String(hackathon_duration_hours) });
      if (hackathon_is_started !== undefined) updates.push({ key: 'hackathon_is_started', val: String(hackathon_is_started) });
      if (results_published !== undefined) updates.push({ key: 'results_published', val: String(results_published) });
      if (results_publish_time !== undefined) updates.push({ key: 'results_publish_time', val: String(results_publish_time) });

      if (updates.length > 0) {
        await query('BEGIN');
        try {
          for (const u of updates) {
            await query(
              `INSERT INTO public.event_config (key, value, updated_at) 
               VALUES ($1, $2, NOW()) 
               ON CONFLICT (key) DO UPDATE SET value = $2, updated_at = NOW()`,
              [u.key, u.val]
            );
          }
          await query('COMMIT');
        } catch (e) {
          await query('ROLLBACK');
          throw e;
        }
      }
    }

    // Archive announcements if starting hackathon
    if (hackathon_is_started === 'true' || hackathon_is_started === true || event_phase === 'HACKING') {
      const closeMsg = '⏰ Submissions are now closed! Thank you for participating. Teams with approved extensions may still submit.';
      await query(
        `UPDATE public.announcements 
         SET is_active = FALSE 
         WHERE content = $1`,
        [closeMsg]
      );
    }

    logger.info('PATCH /api/event-config successful', { userId: user.id });

    // Fetch and return unified configuration
    const updated = await getEventConfigState();
    return successResponse(updated);
  } catch (err) {
    logger.error('PATCH /api/event-config failed', { error: String(err) });
    return Errors.INTERNAL('Failed to update event configuration.');
  }
}, 'admin');
