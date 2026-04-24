"use client";

import { motion, AnimatePresence } from "framer-motion";
import { X } from "lucide-react";

import SubmissionHeader from "@/components/SubmissionHeader";
import ProjectOverview from "@/components/ProjectOverview";
import VideoCarousel from "@/components/VideoCarousel";
import ProjectWriteup from "@/components/ProjectWriteup";
import ResourceLinks from "@/components/ResourceLinks";
import JudgeReview from "@/components/JudgeReview";

export default function SubmissionModal({ submission, onClose }: any) {
  if (!submission) return null;

  return (
    <AnimatePresence>
      <motion.div
        className="fixed inset-0 z-50 bg-black/70 backdrop-blur-md flex justify-center items-start overflow-y-auto"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
      >
        <motion.div
          className="relative w-full max-w-5xl bg-[#050816] mt-20 mb-20 rounded-xl p-6 space-y-10"
          initial={{ scale: 0.95, y: 40 }}
          animate={{ scale: 1, y: 0 }}
          exit={{ scale: 0.95, y: 40 }}
        >
          {/* CLOSE */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 text-gray-400 hover:text-white"
          >
            <X />
          </button>

          <SubmissionHeader
            teamName={submission.teamName}
            hackathonName="Hackathon"
            submittedAt={submission.submittedAt}
          />

          <ProjectOverview
            title={submission.projectName}
            summary={submission.solutionSummary}
            category={submission.category}
            technologies={submission.techStack}
            teamMembers={submission.teamMembers || []}
          />

          <VideoCarousel
            videoUrl={submission.videoUrl}
            title={submission.projectName}
          />

          <ProjectWriteup
            writeup={{
              problem: submission.problemSolved,
              solution: submission.solutionSummary,
            }}
          />

          <ResourceLinks
            githubUrl={submission.githubUrl}
            demoUrl={submission.videoUrl}
            docsUrl={submission.docsUrl}
          />

          <JudgeReview scores={[]} feedback="" />
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}