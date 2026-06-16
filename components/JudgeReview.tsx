import { motion } from "framer-motion";
import { Award, MessageSquare } from "lucide-react";

interface Props {
  scores: { innovation: number; technical: number; impact: number; presentation: number } | null;
  feedback: string | null;
}

const criteria = [
  { key: "innovation", label: "Innovation" },
  { key: "technical", label: "Technical Depth" },
  { key: "impact", label: "Impact & Feasibility" },
  { key: "presentation", label: "Presentation" },
] as const;

export default function JudgeReview({ scores, feedback }: Props) {
  const pending = !scores;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay: 0.4 }}
      className="glass-card p-6 md:p-8"
    >
      <h2 className="section-heading">
        <div className="gradient-accent-bar" />
        <Award className="w-5 h-5 text-gold" />
        Judge Review
      </h2>

      {pending ? (
        <div className="text-center py-12">
          <div className="w-16 h-16 rounded-full bg-[#A08070]/50 flex items-center justify-center mx-auto mb-4">
            <Award className="w-8 h-8 text-[#A08070]-foreground" />
          </div>
          <p className="text-lg font-medium text-[#F5EFE0]/70">Review Pending</p>
          <p className="text-sm text-[#A08070]-foreground mt-1">
            Judges will review your submission and provide scores & feedback here.
          </p>
        </div>
      ) : (
        <div className="space-y-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {criteria.map(({ key, label }) => (
              <div key={key} className="text-center p-4 rounded-xl bg-[#A08070]/50">
                <p className="text-3xl font-bold gradient-text">{scores[key]}</p>
                <p className="text-xs text-[#A08070]-foreground mt-1 uppercase tracking-wider">{label}</p>
              </div>
            ))}
          </div>
          {feedback && (
            <div className="p-4 rounded-xl bg-[#A08070]/30 border border-border/50">
              <h3 className="flex items-center gap-2 text-sm font-semibold text-[#F5EFE0] mb-2">
                <MessageSquare className="w-4 h-4" /> Judge Feedback
              </h3>
              <p className="body-text text-sm">{feedback}</p>
            </div>
          )}
        </div>
      )}
    </motion.div>
  );
}
