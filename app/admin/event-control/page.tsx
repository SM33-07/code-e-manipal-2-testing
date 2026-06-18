"use client";

import { useState, useEffect } from "react";
import { toast } from "sonner";
import { 
  Radio, Lock, Unlock, Clock, Send, Trash2, 
  Search, ShieldAlert, Sparkles, Megaphone, Loader2 
} from "lucide-react";

interface Team {
  id: string;
  name: string;
  submission_frozen: boolean;
  deadline_extension: string | null;
  member_count: number;
}

interface Announcement {
  id: string;
  content: string;
  type: "info" | "warning" | "urgent" | "success";
  is_active: boolean;
  created_at: string;
  creator_name?: string;
}

export default function EventControlPage() {
  const [teams, setTeams] = useState<Team[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  
  // Broadcaster form state
  const [announcementContent, setAnnouncementContent] = useState("");
  const [announcementType, setAnnouncementType] = useState<"info" | "warning" | "urgent" | "success">("info");
  
  // Loading states
  const [loadingTeams, setLoadingTeams] = useState(true);
  const [loadingAnnouncements, setLoadingAnnouncements] = useState(true);
  const [submittingBroadcast, setSubmittingBroadcast] = useState(false);
  const [togglingGlobal, setTogglingGlobal] = useState(false);

  useEffect(() => {
    fetchTeams();
    fetchAnnouncements();
  }, []);

  const fetchTeams = async () => {
    setLoadingTeams(true);
    try {
      const res = await fetch("/api/admin/teams");
      if (res.ok) {
        const { data } = await res.json();
        setTeams(data);
      } else {
        toast.error("Failed to load teams.");
      }
    } catch (err) {
      console.error(err);
      toast.error("An error occurred loading teams.");
    } finally {
      setLoadingTeams(false);
    }
  };

  const fetchAnnouncements = async () => {
    setLoadingAnnouncements(true);
    try {
      const res = await fetch("/api/admin/announcements");
      if (res.ok) {
        const { data } = await res.json();
        setAnnouncements(data);
      } else {
        toast.error("Failed to load announcements.");
      }
    } catch (err) {
      console.error(err);
      toast.error("An error occurred loading announcements.");
    } finally {
      setLoadingAnnouncements(false);
    }
  };

  const handleGlobalFreeze = async (freeze: boolean) => {
    setTogglingGlobal(true);
    try {
      const res = await fetch("/api/admin/teams", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ global: true, submission_frozen: freeze }),
      });
      if (res.ok) {
        toast.success(freeze ? "All submissions frozen!" : "All submissions unfrozen!");
        // Update local state
        setTeams((prev) => prev.map((t) => ({ ...t, submission_frozen: freeze })));
      } else {
        toast.error("Failed to update global freeze status.");
      }
    } catch (err) {
      console.error(err);
      toast.error("Error toggling global freeze.");
    } finally {
      setTogglingGlobal(false);
    }
  };

  const handleTeamFreeze = async (teamId: string, freeze: boolean) => {
    try {
      const res = await fetch("/api/admin/teams", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: teamId, submission_frozen: freeze }),
      });
      if (res.ok) {
        toast.success(freeze ? "Team submission frozen" : "Team submission unfrozen");
        setTeams((prev) => prev.map((t) => (t.id === teamId ? { ...t, submission_frozen: freeze } : t)));
      } else {
        toast.error("Failed to update team freeze status.");
      }
    } catch (err) {
      console.error(err);
      toast.error("Error updating team freeze.");
    }
  };

  const handleTeamExtension = async (teamId: string, extension: string | null) => {
    try {
      const res = await fetch("/api/admin/teams", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: teamId, deadline_extension: extension }),
      });
      if (res.ok) {
        const { data } = await res.json();
        toast.success(extension ? "Deadline extension set" : "Deadline extension cleared");
        setTeams((prev) => prev.map((t) => (t.id === teamId ? { ...t, deadline_extension: data.deadline_extension } : t)));
      } else {
        toast.error("Failed to set extension.");
      }
    } catch (err) {
      console.error(err);
      toast.error("Error setting extension.");
    }
  };

  const handleBroadcast = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!announcementContent.trim()) return;

    setSubmittingBroadcast(true);
    try {
      const res = await fetch("/api/admin/announcements", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content: announcementContent, type: announcementType }),
      });
      if (res.ok) {
        toast.success("Announcement broadcasted successfully!");
        setAnnouncementContent("");
        fetchAnnouncements();
      } else {
        toast.error("Failed to broadcast announcement.");
      }
    } catch (err) {
      console.error(err);
      toast.error("Error broadcasting announcement.");
    } finally {
      setSubmittingBroadcast(false);
    }
  };

  const handleToggleAnnouncement = async (id: string, active: boolean) => {
    try {
      const res = await fetch("/api/admin/announcements", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, is_active: active }),
      });
      if (res.ok) {
        toast.success(active ? "Announcement activated" : "Announcement deactivated");
        fetchAnnouncements();
      } else {
        toast.error("Failed to toggle announcement state.");
      }
    } catch (err) {
      console.error(err);
      toast.error("Error toggling announcement.");
    }
  };

  const handleDeleteAnnouncement = async (id: string) => {
    if (!confirm("Are you sure you want to delete this announcement?")) return;
    try {
      const res = await fetch("/api/admin/announcements", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, action: "delete" }),
      });
      if (res.ok) {
        toast.success("Announcement deleted.");
        fetchAnnouncements();
      } else {
        toast.error("Failed to delete announcement.");
      }
    } catch (err) {
      console.error(err);
      toast.error("Error deleting announcement.");
    }
  };

  const filteredTeams = teams.filter((t) =>
    t.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const formatDateTime = (dateStr: string | null) => {
    if (!dateStr) return "None";
    const date = new Date(dateStr);
    return date.toLocaleString([], { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" });
  };

  return (
    <div className="space-y-8 max-w-7xl mx-auto p-2">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-[#C9A227]/20 pb-6">
        <div>
          <h1 className="text-3xl font-extrabold text-foreground flex items-center gap-2">
            <Radio className="text-[#D4732A]" />
            Event Day Control Panel
          </h1>
          <p className="text-sm text-[#A08070] mt-1">
            Real-time management for team submissions, deadline extensions, and system broadcasts.
          </p>
        </div>

        {/* Global Freeze Switch */}
        <div className="bg-[#1E1208] border border-[#C9A227]/20 rounded-2xl p-4 flex items-center gap-4 shadow-lg">
          <div className="text-left">
            <h4 className="text-sm font-bold text-foreground">Global Freeze</h4>
            <p className="text-xs text-[#A08070]">Controls all team portals</p>
          </div>
          {togglingGlobal ? (
            <Loader2 className="animate-spin text-[#D4732A] size-5" />
          ) : (
            <div className="flex gap-2">
              <button
                onClick={() => handleGlobalFreeze(true)}
                className="flex items-center gap-1.5 px-4 py-2 bg-red-950 text-red-200 border border-red-800 hover:bg-red-900 rounded-xl text-xs font-bold transition duration-200 cursor-pointer"
              >
                <Lock size={14} /> Freeze All
              </button>
              <button
                onClick={() => handleGlobalFreeze(false)}
                className="flex items-center gap-1.5 px-4 py-2 bg-emerald-950 text-emerald-200 border border-emerald-800 hover:bg-emerald-900 rounded-xl text-xs font-bold transition duration-200 cursor-pointer"
              >
                <Unlock size={14} /> Unfreeze All
              </button>
            </div>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column: Announcement Broadcaster */}
        <div className="space-y-8 lg:col-span-1">
          {/* Broadcaster Form */}
          <div className="bg-[#1E1208] border border-[#C9A227]/20 rounded-2xl p-6 shadow-xl relative overflow-hidden">
            <div className="absolute top-0 right-0 p-3 opacity-10">
              <Megaphone size={80} className="text-[#D4732A]" />
            </div>
            
            <h3 className="text-lg font-bold text-foreground flex items-center gap-2 mb-4">
              <Megaphone size={18} className="text-[#D4732A]" />
              Live Broadcast Alert
            </h3>

            <form onSubmit={handleBroadcast} className="space-y-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-[#A08070] mb-2">
                  Announcement Message
                </label>
                <textarea
                  value={announcementContent}
                  onChange={(e) => setAnnouncementContent(e.target.value)}
                  placeholder="Type message to broadcast to all participants..."
                  className="w-full min-h-[100px] bg-black/35 border border-[#C9A227]/20 rounded-xl p-3 text-sm text-foreground focus:ring-1 focus:ring-[#D4732A] focus:outline-none placeholder-[#A08070]/50"
                  maxLength={250}
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-[#A08070] mb-2">
                  Alert Severity / Type
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {(["info", "success", "warning", "urgent"] as const).map((type) => (
                    <button
                      key={type}
                      type="button"
                      onClick={() => setAnnouncementType(type)}
                      className={`px-3 py-2 text-xs font-semibold rounded-lg capitalize border cursor-pointer transition ${
                        announcementType === type
                          ? type === "info" ? "bg-blue-950 text-blue-200 border-blue-600"
                            : type === "success" ? "bg-emerald-950 text-emerald-200 border-emerald-600"
                            : type === "warning" ? "bg-amber-950 text-amber-200 border-amber-600"
                            : "bg-red-950 text-red-200 border-red-600"
                          : "bg-black/20 text-[#A08070] border-transparent hover:border-[#C9A227]/20"
                      }`}
                    >
                      {type}
                    </button>
                  ))}
                </div>
              </div>

              <button
                type="submit"
                disabled={submittingBroadcast || !announcementContent.trim()}
                className="w-full py-3 rounded-xl bg-[#D4732A] text-[#1E1208] font-bold text-sm hover:bg-[#D4732A]/90 transition duration-200 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-md"
              >
                {submittingBroadcast ? (
                  <Loader2 className="animate-spin size-4" />
                ) : (
                  <Send size={14} />
                )}
                Broadcast Alert
              </button>
            </form>
          </div>

          {/* Past Announcements */}
          <div className="bg-[#1E1208] border border-[#C9A227]/20 rounded-2xl p-6 shadow-xl space-y-4">
            <h3 className="text-lg font-bold text-foreground">Announcement History</h3>
            
            {loadingAnnouncements ? (
              <div className="flex justify-center p-6">
                <Loader2 className="animate-spin text-[#D4732A]" />
              </div>
            ) : announcements.length === 0 ? (
              <p className="text-xs text-[#A08070] text-center py-6">No announcements broadcasted yet.</p>
            ) : (
              <div className="space-y-3 max-h-[300px] overflow-y-auto pr-1">
                {announcements.map((ann) => (
                  <div
                    key={ann.id}
                    className="p-3 bg-black/20 rounded-xl border border-[#C9A227]/10 flex flex-col gap-2 relative group"
                  >
                    <div className="flex justify-between items-start gap-2">
                      <span className={`text-[10px] px-2 py-0.5 rounded-full capitalize font-bold ${
                        ann.type === "info" ? "bg-blue-950 text-blue-300"
                          : ann.type === "success" ? "bg-emerald-950 text-emerald-300"
                          : ann.type === "warning" ? "bg-amber-950 text-amber-300"
                          : "bg-red-950 text-red-300"
                      }`}>
                        {ann.type}
                      </span>
                      <div className="flex items-center gap-1.5">
                        <button
                          onClick={() => handleToggleAnnouncement(ann.id, !ann.is_active)}
                          className={`text-[10px] px-2 py-0.5 rounded font-bold cursor-pointer transition ${
                            ann.is_active ? "bg-emerald-500/20 text-emerald-300 hover:bg-emerald-500/30" : "bg-[#A08070]/20 text-[#A08070] hover:bg-[#A08070]/30"
                          }`}
                        >
                          {ann.is_active ? "Active" : "Inactive"}
                        </button>
                        <button
                          onClick={() => handleDeleteAnnouncement(ann.id)}
                          className="text-[#A08070] hover:text-red-400 p-0.5 rounded cursor-pointer"
                        >
                          <Trash2 size={12} />
                        </button>
                      </div>
                    </div>
                    <p className="text-xs text-foreground font-medium line-clamp-3">{ann.content}</p>
                    <div className="flex justify-between text-[9px] text-[#A08070]">
                      <span>By {ann.creator_name || "Admin"}</span>
                      <span>{new Date(ann.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Submission & Deadline Table */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-[#1E1208] border border-[#C9A227]/20 rounded-2xl p-6 shadow-xl space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h3 className="text-lg font-bold text-foreground">Team Submissions Manager</h3>
                <p className="text-xs text-[#A08070] mt-0.5">Configure individual grace extensions or locks.</p>
              </div>

              {/* Search Bar */}
              <div className="relative">
                <Search className="absolute left-3 top-2.5 text-[#A08070]/60 size-4" />
                <input
                  type="text"
                  placeholder="Search team name..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="bg-black/30 border border-[#C9A227]/20 rounded-xl pl-9 pr-4 py-2 text-xs text-foreground focus:ring-1 focus:ring-[#D4732A] focus:outline-none placeholder-[#A08070]/40 w-full sm:w-60"
                />
              </div>
            </div>

            {loadingTeams ? (
              <div className="flex justify-center py-20">
                <Loader2 className="animate-spin text-[#D4732A]" />
              </div>
            ) : filteredTeams.length === 0 ? (
              <div className="text-center py-20 text-[#A08070]">No teams found.</div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="border-b border-[#C9A227]/20 text-[#A08070] font-bold uppercase tracking-wider text-[10px]">
                      <th className="pb-3 pl-2">Team Details</th>
                      <th className="pb-3">Submission Status</th>
                      <th className="pb-3">Deadline Extension (Grace)</th>
                      <th className="pb-3 text-right pr-2">Lock Controls</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredTeams.map((team) => (
                      <tr key={team.id} className="border-b border-[#C9A227]/10 hover:bg-black/10 transition">
                        {/* Team Info */}
                        <td className="py-4 pl-2">
                          <p className="font-semibold text-foreground">{team.name}</p>
                          <span className="text-[10px] text-[#A08070]">{team.member_count} Members</span>
                        </td>
                        
                        {/* Status badge */}
                        <td className="py-4">
                          <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full font-bold text-[10px] ${
                            team.submission_frozen 
                              ? "bg-red-950 text-red-300 border border-red-800" 
                              : "bg-emerald-950 text-emerald-300 border border-emerald-800"
                          }`}>
                            {team.submission_frozen ? <Lock size={10} /> : <Unlock size={10} />}
                            {team.submission_frozen ? "Frozen" : "Open"}
                          </span>
                        </td>
                        
                        {/* Extensions control */}
                        <td className="py-4">
                          <div className="flex flex-col gap-1.5">
                            <span className="text-[10px] font-semibold text-[#C9A227]">
                              {formatDateTime(team.deadline_extension)}
                            </span>
                            <div className="flex gap-1">
                              <input
                                type="datetime-local"
                                value={team.deadline_extension ? new Date(new Date(team.deadline_extension).getTime() - new Date().getTimezoneOffset() * 60000).toISOString().slice(0, 16) : ""}
                                onChange={(e) => handleTeamExtension(team.id, e.target.value ? new Date(e.target.value).toISOString() : null)}
                                className="bg-black/30 border border-[#C9A227]/20 rounded px-1.5 py-0.5 text-[10px] focus:ring-1 focus:ring-[#D4732A] focus:outline-none text-foreground"
                              />
                              {team.deadline_extension && (
                                <button
                                  onClick={() => handleTeamExtension(team.id, null)}
                                  className="text-[#A08070] hover:text-red-400 font-bold px-1.5 border border-[#C9A227]/20 rounded hover:border-red-400 cursor-pointer"
                                >
                                  Clear
                                </button>
                              )}
                            </div>
                          </div>
                        </td>
                        
                        {/* Lock / Unlock button */}
                        <td className="py-4 text-right pr-2">
                          <button
                            onClick={() => handleTeamFreeze(team.id, !team.submission_frozen)}
                            className={`px-3 py-1.5 rounded-lg border font-bold text-[10px] cursor-pointer transition ${
                              team.submission_frozen
                                ? "bg-emerald-950 text-emerald-200 border-emerald-700 hover:bg-emerald-900"
                                : "bg-red-950 text-red-200 border-red-700 hover:bg-red-900"
                            }`}
                          >
                            {team.submission_frozen ? "Unlock Portal" : "Lock Portal"}
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
