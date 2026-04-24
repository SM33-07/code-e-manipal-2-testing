"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { UserPlus, X } from "lucide-react";

interface Submission {
  id: number;
  team: string;
  project: string;
}

interface Judge {
  id: number;
  name: string;
}

export function JudgeAssignment() {
  const [selectedSubmission, setSelectedSubmission] = useState<number | null>(
    null
  );
  const [selectedJudge, setSelectedJudge] = useState<number | null>(null);
  const [assignments, setAssignments] = useState<
    { submissionId: number; judgeId: number }[]
  >([]);

  const submissions: Submission[] = [
    { id: 1, team: "Team Alpha", project: "AI Health Assistant" },
    { id: 2, team: "Team Beta", project: "Smart Waste Management" },
    { id: 3, team: "Team Gamma", project: "Blockchain Voting System" },
  ];

  const judges: Judge[] = [
    { id: 1, name: "Dr. Smith" },
    { id: 2, name: "Prof. Johnson" },
    { id: 3, name: "Ms. Chen" },
  ];

  const assignJudge = () => {
    if (selectedSubmission && selectedJudge) {
      setAssignments([
        ...assignments,
        { submissionId: selectedSubmission, judgeId: selectedJudge },
      ]);

      setSelectedSubmission(null);
      setSelectedJudge(null);
    }
  };

  const removeAssignment = (submissionId: number) => {
    setAssignments(assignments.filter((a) => a.submissionId !== submissionId));
  };

  return (
    <motion.div
      className="bg-white/5 border border-white/10 rounded-2xl p-6 backdrop-blur-xl"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
    >
      <div className="flex items-center gap-3 mb-6">
        <UserPlus className="text-purple-400" />
        <h2 className="text-xl font-semibold text-white">Judge Assignment</h2>
      </div>

      {/* Assignment Controls */}
      <div className="grid md:grid-cols-3 gap-4 mb-6">
        <select
          value={selectedSubmission ?? ""}
          onChange={(e) => setSelectedSubmission(Number(e.target.value))}
          className="bg-black/40 border border-white/10 text-white rounded-lg p-3"
        >
          <option value="">Select Submission</option>
          {submissions.map((s) => (
            <option key={s.id} value={s.id}>
              {s.team} — {s.project}
            </option>
          ))}
        </select>

        <select
          value={selectedJudge ?? ""}
          onChange={(e) => setSelectedJudge(Number(e.target.value))}
          className="bg-black/40 border border-white/10 text-white rounded-lg p-3"
        >
          <option value="">Select Judge</option>
          {judges.map((j) => (
            <option key={j.id} value={j.id}>
              {j.name}
            </option>
          ))}
        </select>

        <button
          onClick={assignJudge}
          className="bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-lg px-4 py-3 font-medium hover:opacity-90 transition"
        >
          Assign
        </button>
      </div>

      {/* Assigned Judges */}
      <div className="space-y-3">
        {assignments.map((assignment) => {
          const submission = submissions.find(
            (s) => s.id === assignment.submissionId
          );
          const judge = judges.find((j) => j.id === assignment.judgeId);

          return (
            <motion.div
              key={assignment.submissionId}
              className="flex items-center justify-between bg-black/30 border border-white/10 rounded-lg p-4"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
            >
              <div>
                <p className="text-white font-medium">
                  {submission?.team} — {submission?.project}
                </p>
                <p className="text-sm text-white/60">
                  Assigned to: {judge?.name}
                </p>
              </div>

              <button
                onClick={() => removeAssignment(assignment.submissionId)}
                className="text-red-400 hover:text-red-300"
              >
                <X size={18} />
              </button>
            </motion.div>
          );
        })}
      </div>
    </motion.div>
  );
}
