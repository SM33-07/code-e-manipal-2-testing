import { query } from '@/lib/db';

export interface EventConfigState {
  id: number;
  event_phase: 'NOT_STARTED' | 'HACKING' | 'SUBMISSION' | 'SUBMISSION_CLOSED' | 'JUDGING' | 'RESULTS' | 'ENDED';
  results_release: 'DRAFT' | 'PUBLISHING' | 'PUBLISHED';
  publish_at: string | null;
  buffer_minutes: number;
  active_release_id: string | null;
  start_time: string | null;
  end_time: string | null;
  updated_at: string;
  // Computed legacy compatibility fields
  hackathon_is_started: string;
  hackathon_start_time: string | null;
  hackathon_duration_hours: string;
  results_published: string;
  results_publish_time: string | null;
}

/**
 * Universal Event Config Loader:
 * Automatically detects whether the database has been migrated to the typed singleton
 * or is still running the legacy key-value event_config table.
 * Returns a unified EventConfigState satisfying both v4 and legacy consumers.
 */
export async function getEventConfigState(): Promise<EventConfigState> {
  try {
    // 1. Attempt structured singleton query (Post-Migration Schema)
    const { rows } = await query('SELECT * FROM public.event_config WHERE id = 1 LIMIT 1');
    if (rows.length > 0 && 'event_phase' in rows[0]) {
      const row = rows[0];
      const isStarted = row.event_phase !== 'NOT_STARTED';
      let legacyRelease = 'false';
      if (row.results_release === 'PUBLISHED') legacyRelease = 'true';
      else if (row.results_release === 'PUBLISHING') legacyRelease = 'publishing';

      return {
        id: 1,
        event_phase: row.event_phase,
        results_release: row.results_release,
        publish_at: row.publish_at ? new Date(row.publish_at).toISOString() : null,
        buffer_minutes: row.buffer_minutes || 5,
        active_release_id: row.active_release_id || null,
        start_time: row.start_time ? new Date(row.start_time).toISOString() : null,
        end_time: row.end_time ? new Date(row.end_time).toISOString() : null,
        updated_at: new Date(row.updated_at).toISOString(),
        // Legacy computed fields
        hackathon_is_started: isStarted ? 'true' : 'false',
        hackathon_start_time: row.start_time ? new Date(row.start_time).toISOString() : null,
        hackathon_duration_hours: '48',
        results_published: legacyRelease,
        results_publish_time: row.publish_at ? new Date(row.publish_at).toISOString() : null,
      };
    }
  } catch (err: any) {
    // If column "event_phase" does not exist or table is key-value, fall through to KV loader
  }

  // 2. Fallback to Legacy Key-Value query (Pre-Migration Schema)
  try {
    const { rows } = await query('SELECT key, value FROM public.event_config');
    const kv = rows.reduce((acc: Record<string, string>, r: any) => {
      acc[r.key] = r.value;
      return acc;
    }, {});

    const isStarted = kv.hackathon_is_started === 'true';
    let phase: EventConfigState['event_phase'] = isStarted ? 'HACKING' : 'NOT_STARTED';
    let release: EventConfigState['results_release'] = 'DRAFT';

    if (kv.results_published === 'true') {
      phase = 'RESULTS';
      release = 'PUBLISHED';
    } else if (kv.results_published === 'publishing') {
      phase = 'RESULTS';
      release = 'PUBLISHING';
    }

    return {
      id: 1,
      event_phase: phase,
      results_release: release,
      publish_at: kv.results_publish_time || null,
      buffer_minutes: 5,
      active_release_id: null,
      start_time: kv.hackathon_start_time || null,
      end_time: null,
      updated_at: new Date().toISOString(),
      hackathon_is_started: kv.hackathon_is_started || 'false',
      hackathon_start_time: kv.hackathon_start_time || null,
      hackathon_duration_hours: kv.hackathon_duration_hours || '48',
      results_published: kv.results_published || 'false',
      results_publish_time: kv.results_publish_time || null,
    };
  } catch (err: any) {
    // Return sensible defaults if database unreachable during cold start
    return {
      id: 1,
      event_phase: 'NOT_STARTED',
      results_release: 'DRAFT',
      publish_at: null,
      buffer_minutes: 5,
      active_release_id: null,
      start_time: null,
      end_time: null,
      updated_at: new Date().toISOString(),
      hackathon_is_started: 'false',
      hackathon_start_time: null,
      hackathon_duration_hours: '48',
      results_published: 'false',
      results_publish_time: null,
    };
  }
}
