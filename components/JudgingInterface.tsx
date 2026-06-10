"use client";

import { useState } from "react";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";

import {
  ArrowLeft,
  Save,
  Lightbulb,
  Code,
  Video,
  Target,
} from "lucide-react";

import {
  Submission,
  Score,
  Criteria,
  WEIGHTS,
} from "@/types/judging";

import { calculateWeightedScore } from "@/utils/scoring";

interface JudgingInterfaceProps {
  submission: Submission;
  judgeId: string;
  existingScore?: Score;
  onSave: (score: Score) => void;
  onBack: () => void;
}

export function JudgingInterface({
  submission,
  judgeId,
  existingScore,
  onSave,
  onBack,
}: JudgingInterfaceProps) {
  const [criteria, setCriteria] = useState<Criteria>(
    existingScore?.criteria || {
      innovation: 5,
      technical: 5,
      presentation: 5,
      impact: 5,
    }
  );

  const [feedback, setFeedback] = useState(existingScore?.feedback || "");

  const weightedScore = calculateWeightedScore(criteria);

  const updateCriterion = (key: keyof Criteria, value: number) => {
    setCriteria((prev) => ({ ...prev, [key]: value }));
  };

  const handleSave = () => {
    const score: Score = {
      submissionId: submission.id,
      judgeId,
      criteria,
      feedback: feedback.trim(),
      isComplete: true,
    };

    onSave(score);
  };

  const criteriaConfig = [
    {
      key: "innovation" as keyof Criteria,
      icon: Lightbulb,
      color: "text-yellow-400",
      label: "Innovation",
      desc: "Novelty and originality of the solution.",
    },
    {
      key: "technical" as keyof Criteria,
      icon: Code,
      color: "text-blue-400",
      label: "Technical Implementation",
      desc: "Quality of code, architecture, and complexity.",
    },
    {
      key: "presentation" as keyof Criteria,
      icon: Video,
      color: "text-purple-400",
      label: "Presentation",
      desc: "Clarity and quality of the demo and write-up.",
    },
    {
      key: "impact" as keyof Criteria,
      icon: Target,
      color: "text-green-400",
      label: "Impact",
      desc: "Potential real-world impact and scalability.",
    },
  ];

  return (
    <div className="min-h-screen p-6">
      <div className="max-w-5xl mx-auto">

        <Button
          variant="ghost"
          onClick={onBack}
          className="mb-4 text-white hover:bg-white/10"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Submissions
        </Button>

        <div className="grid lg:grid-cols-2 gap-6">

          {/* Submission Details (blind — no team name) */}

          <Card className="bg-white/5 border-white/10 backdrop-blur-sm h-fit">
            <CardHeader>
              <CardTitle className="text-white text-2xl">
                {submission.title}
              </CardTitle>
              <CardDescription className="text-gray-400">
                Blind Judging — Team info hidden
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h3 className="text-sm font-semibold text-gray-300 mb-2">
                  Description
                </h3>
                <p className="text-gray-400 text-sm">
                  {submission.description}
                </p>
              </div>

              <Separator className="bg-white/10" />

              <div>
                <h3 className="text-sm font-semibold text-gray-300 mb-2">
                  Write-up
                </h3>
                <p className="text-gray-400 text-sm">
                  {submission.writeup}
                </p>
              </div>

              <Separator className="bg-white/10" />

              <div>
                <h3 className="text-sm font-semibold text-gray-300 mb-2">
                  Reflection
                </h3>
                <p className="text-gray-400 text-sm">
                  {submission.reflection}
                </p>
              </div>

              <Separator className="bg-white/10" />

              <div>
                <h3 className="text-sm font-semibold text-gray-300 mb-2">
                  Demo
                </h3>
                <a
                  href={submission.demoUrl}
                  target="_blank"
                  className="text-blue-400 hover:text-blue-300 underline text-sm"
                >
                  View Demo
                </a>
              </div>
            </CardContent>
          </Card>

          {/* Scoring Panel */}

          <div className="space-y-6">
            <Card className="bg-white/5 border-white/10 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="text-white">
                  Judging Rubric
                </CardTitle>
                <CardDescription className="text-gray-400">
                  Score each criterion from 1 (worst) to 10 (best)
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {criteriaConfig.map(({ key, icon: Icon, color, label, desc }) => (
                  <div key={key} className="space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Icon className={`w-5 h-5 ${color}`} />
                        <Label className="text-white font-semibold">
                          {label}
                        </Label>
                        <span className="text-xs text-white/40">
                          ({(WEIGHTS[key] * 100).toFixed(0)}%)
                        </span>
                      </div>
                      <span className="text-white font-bold text-lg">
                        {criteria[key]}
                      </span>
                    </div>
                    <p className="text-xs text-white/40 mb-1">{desc}</p>
                    <div className="flex items-center gap-3">
                      <span className="text-xs text-white/30">1</span>
                      <input
                        type="range"
                        min={1}
                        max={10}
                        step={1}
                        value={criteria[key]}
                        onChange={(e) => updateCriterion(key, Number(e.target.value))}
                        className="flex-1 accent-purple-500"
                      />
                      <span className="text-xs text-white/30">10</span>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* Feedback */}

            <Card className="bg-white/5 border-white/10 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="text-white text-sm">
                  Feedback (optional)
                </CardTitle>
              </CardHeader>
              <CardContent>
                <textarea
                  value={feedback}
                  onChange={(e) => setFeedback(e.target.value)}
                  placeholder="Write your feedback for the team..."
                  rows={4}
                  className="w-full bg-black/40 border border-white/10 text-white rounded-lg p-3 text-sm resize-none"
                />
              </CardContent>
            </Card>

            {/* Weighted Score */}

            <Card className="bg-gradient-to-br from-blue-600/20 to-purple-600/20 border-blue-500/30 backdrop-blur-sm">
              <CardContent className="pt-6">
                <div className="text-center">
                  <p className="text-gray-300 text-sm mb-2">
                    Weighted Final Score
                  </p>
                  <p className="text-5xl font-bold text-white">
                    {weightedScore.toFixed(2)}
                  </p>
                  <p className="text-gray-400 text-xs mt-2">
                    Out of 10
                  </p>
                </div>
              </CardContent>
            </Card>

            <Button
              onClick={handleSave}
              className="w-full bg-green-600 hover:bg-green-700"
            >
              <Save className="w-4 h-4 mr-2" />
              Submit Score
            </Button>
          </div>

        </div>
      </div>
    </div>
  );
}
