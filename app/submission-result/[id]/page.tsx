"use client";

import { motion } from "framer-motion";
import { useEffect, useState } from "react";
import { useParams } from "next/navigation";

import { AnimatedBackground } from "@/components/AnimatedBackground";
import { GradientOrbs } from "@/components/GradientOrbs";
import AppShell from "@/components/ui/AppShell";

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
  const submittedAt = submission.submitted_at;

  return (
    <AppShell>
      <AnimatedBackground />
      <GradientOrbs />

      <motion.main
        variants={container}
        initial="hidden"
        animate="show"
        className="relative z-10 max-w-5xl mx-auto px-6 py-12 space-y-10"
      >
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
              problem: submission.description,
              solution: submission.summary,
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
            scores={[]} // will plug real reviews later
            feedback=""
          />
        </motion.div>
      </motion.main>
    </AppShell>
  );
}