"use client";

import { motion } from "framer-motion";
import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { CheckCircle2 } from "lucide-react";

import AppShell from "@/components/ui/AppShell";
import { Confetti } from "@/components/ui/Confetti";

import SubmissionHeader from "@/components/SubmissionHeader";
import ProjectOverview from "@/components/ProjectOverview";
import VideoCarousel from "@/components/VideoCarousel";
import ProjectWriteup from "@/components/ProjectWriteup";
import ResourceLinks from "@/components/ResourceLinks";
import JudgeReview from "@/components/JudgeReview";

const container = {
  hidden: {},
  show: {
    transition: {
      staggerChildren: 0.12,
    },
  },
};

const item = {
  hidden: { opacity: 0, y: 25 },
  show: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.45 },
  },
};

export default function SubmissionResultPage() {
  const { id } = useParams();
  const [submission, setSubmission] = useState<any>(null);

  useEffect(() => {
    async function fetchSubmission() {
      const res = await fetch(`/api/submissions/${id}`);
      const data = await res.json();
      setSubmission(data.data);
    }

    if (id) fetchSubmission();
  }, [id]);

  if (!submission) {
    return <div className="text-center py-20">Loading...</div>;
  }

  const teamName = submission.teams?.name || "Team";
  const hackathonName = submission.teams?.hackathon || "Hackathon";
  const submittedAt = submission.created_at;

  return (
    <AppShell>
      <Confetti />

      <motion.main
        variants={container}
        initial="hidden"
        animate="show"
        className="relative z-10 max-w-5xl mx-auto px-6 py-12 space-y-10"
      >
        <motion.div
          variants={item}
          className="bg-green-500/10 border border-green-500/20 rounded-2xl p-5 flex items-start gap-4 shadow-sm"
        >
          <div className="p-2 rounded-full bg-green-500/20 text-green-600 dark:text-green-400 shrink-0">
            <CheckCircle2 className="w-5 h-5 animate-pulse" />
          </div>
          <div>
            <h2 className="text-base font-bold text-green-800 dark:text-green-400">
              Project Submitted Successfully!
            </h2>
            <p className="text-xs text-green-700/80 dark:text-green-400/80 mt-1 leading-relaxed">
              Congratulations! Your hackathon project submission has been successfully locked and saved to the database. The judging panel will review your write-up and video pitch during evaluations. Good luck!
            </p>
          </div>
        </motion.div>

        <motion.div variants={item}>
          <SubmissionHeader
            teamName={teamName}
            hackathonName={hackathonName}
            submittedAt={submittedAt}
          />
        </motion.div>

        <motion.div variants={item}>
          <ProjectOverview
            title={submission.title}
            summary={submission.summary}
            category={submission.category}
            technologies={submission.technologies}
            teamMembers={
              submission.teams?.team_members?.map((m: any) => ({
                name: m.profiles?.name,
                avatar: m.profiles?.avatar_url,
              })) || []
            }
          />
        </motion.div>

        <motion.div variants={item}>
          <VideoCarousel
            videoUrl={submission.demo_video_url}
            title={submission.title}
          />
        </motion.div>

        <motion.div variants={item}>
          <ProjectWriteup
            writeup={{
              problemStatement: submission.description || "",
              solutionOverview: submission.summary || "",
              technicalImplementation: "",
              architecture: "",
              challenges: "",
              futureImprovements: "",
              reflection: "",
            }}
          />
        </motion.div>

        <motion.div variants={item}>
          <ResourceLinks
            githubUrl={submission.github_url}
            demoUrl={submission.demo_url}
            docsUrl={submission.docs_url}
          />
        </motion.div>

        <motion.div variants={item}>
          <JudgeReview
            scores={null}
            feedback=""
          />
        </motion.div>
      </motion.main>
    </AppShell>
  );
}