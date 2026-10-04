'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/components/AuthProvider';
import { EventStatusBar } from '@/components/dashboard/EventStatusBar';
import { TeamCard } from '@/components/dashboard/TeamCard';
import { SubmissionWidget } from '@/components/dashboard/SubmissionWidget';
import { AnnouncementsWidget } from '@/components/dashboard/AnnouncementsWidget';
import { QuickLinks } from '@/components/dashboard/QuickLinks';
import { DashboardSkeleton } from '@/components/dashboard/SkeletonLoaders';
import { Sparkles, RefreshCw, AlertCircle } from 'lucide-react';

interface DashboardSummaryData {
  event: {
    phase: string;
    startTime: string | null;
    endTime: string | null;
    bufferMinutes: number;
    resultsRelease: string;
    publishAt: string | null;
  };
  team: {
    id: string;
    name: string;
    inviteCode: string;
    track: string;
    leaderName?: string | null;
    members: Array<{
      userId: string;
      role: string;
      name: string;
      email: string;
      avatarUrl?: string;
    }>;
  } | null;
  submission: {
    id: string;
    title: string;
    summary?: string;
    category?: string;
    status: string;
    githubUrl?: string;
    demoUrl?: string;
    docsUrl?: string;
    demoVideoUrl?: string;
    submittedAt?: string;
    isLocked?: boolean;
  } | null;
  announcement: {
    id?: string;
    title?: string;
    content: string;
    type?: string;
    created_at?: string;
  } | null;
  profile: {
    id: string;
    name: string;
    email: string;
    role: string;
    identifier?: string;
  };
}

export function ParticipantDashboard() {
  const { user } = useAuth();
  const [data, setData] = useState<DashboardSummaryData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);

  const fetchSummary = useCallback(async (isManualRefresh = false) => {
    if (isManualRefresh) setRefreshing(true);
    try {
      const res = await fetch('/api/dashboard/summary');
      if (!res.ok) {
        throw new Error(`Failed to load dashboard summary (${res.status})`);
      }
      const json = await res.json();
      if (json.data) {
        setData(json.data);
        setError(null);
      } else {
        throw new Error(json.error?.message || 'Empty response received');
      }
    } catch (err: any) {
      console.error('Error fetching dashboard summary:', err);
      setError(err.message || 'Unable to connect to dashboard service.');
    } finally {
      setLoading(false);
      if (isManualRefresh) setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchSummary();
    const interval = setInterval(() => fetchSummary(false), 60000);
    const onFocus = () => fetchSummary(false);
    window.addEventListener('focus', onFocus);

    return () => {
      clearInterval(interval);
      window.removeEventListener('focus', onFocus);
    };
  }, [fetchSummary]);

  if (loading && !data) {
    return (
      <div className="space-y-8">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 animate-pulse">
          <div>
            <div className="w-48 h-8 bg-muted/60 rounded-lg mb-2" />
            <div className="w-64 h-4 bg-muted/40 rounded" />
          </div>
          <div className="w-28 h-9 bg-muted/50 rounded-xl" />
        </div>
        <DashboardSkeleton />
      </div>
    );
  }

  if (error && !data) {
    return (
      <div className="p-8 rounded-2xl bg-destructive/10 border border-destructive/30 text-center max-w-lg mx-auto my-12">
        <AlertCircle className="w-10 h-10 text-destructive mx-auto mb-3" />
        <h3 className="text-lg font-bold text-foreground mb-2">
          Unable to Load Dashboard
        </h3>
        <p className="text-sm text-muted-foreground mb-5">
          {error}
        </p>
        <button
          type="button"
          onClick={() => fetchSummary(true)}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-primary text-primary-foreground font-semibold text-sm hover:opacity-95 transition-opacity"
        >
          <RefreshCw className="w-4 h-4" />
          Retry Connection
        </button>
      </div>
    );
  }

  const displayName = data?.profile?.name || user?.user_metadata?.name || 'Hacker';
  const displayIdentifier = data?.profile?.identifier || user?.user_metadata?.identifier || 'PARTICIPANT';

  return (
    <div className="space-y-8">
      {/* Welcome & Top Controls Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-bold uppercase tracking-wider text-primary flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5" />
              Live Participant Workspace
            </span>
            <span className="text-xs text-muted-foreground">&bull;</span>
            <span className="text-xs font-mono text-muted-foreground">
              {displayIdentifier}
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-foreground tracking-tight">
            Welcome back, {displayName}
          </h1>
          <p className="text-xs sm:text-sm text-muted-foreground mt-0.5">
            Monitor event deadlines, coordinate your team, and track your project submission in real time.
          </p>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto">
          <button
            type="button"
            onClick={() => fetchSummary(true)}
            disabled={refreshing}
            className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-accent hover:bg-muted border border-border text-foreground text-xs font-semibold transition-colors disabled:opacity-50 cursor-pointer"
            title="Refresh dashboard state"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${refreshing ? 'animate-spin' : ''}`} />
            {refreshing ? 'Syncing...' : 'Sync State'}
          </button>
        </div>
      </div>

      {/* Event Status Bar with Pipeline & Countdown */}
      {data?.event && (
        <EventStatusBar
          phase={data.event.phase}
          startTime={data.event.startTime}
          endTime={data.event.endTime}
          bufferMinutes={data.event.bufferMinutes}
          publishAt={data.event.publishAt}
        />
      )}

      {/* Primary Action Grid (Team & Submission Widgets) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <TeamCard team={data?.team || null} />
        <SubmissionWidget
          hasTeam={!!data?.team}
          submission={data?.submission || null}
        />
      </div>

      {/* Secondary Content Grid (Broadcasts & Resource Links) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <AnnouncementsWidget announcement={data?.announcement || null} />
        </div>
        <div>
          <QuickLinks />
        </div>
      </div>
    </div>
  );
}
