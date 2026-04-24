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
import { Slider } from "@/components/ui/slider";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";

import {
  ArrowLeft,
  Save,
  Lightbulb,
  Code,
  CheckSquare,
  Video,
  Map,
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
  judgeName: string;
  existingScore?: Score;
  onSave: (score: Score) => void;
  onBack: () => void;
}

export function JudgingInterface({
  submission,
  judgeName,
  existingScore,
  onSave,
  onBack,
}: JudgingInterfaceProps) {
  const [criteria, setCriteria] = useState<Criteria>(
    existingScore?.criteria || {
      innovation: 50,
      technical: 50,
      completeness: 50,
      presentation: 50,
      reflection: 50,
    }
  );

  const weightedScore = calculateWeightedScore(criteria);

  const updateCriterion = (key: keyof Criteria, value: number) => {
    setCriteria((prev) => ({ ...prev, [key]: value }));
  };

  const handleSave = () => {
    const score: Score = {
      submissionId: submission.id,
      judgeName,
      criteria,
      timestamp: new Date(),
    };

    onSave(score);
  };

  const criteriaConfig = [
    {
      key: "innovation" as keyof Criteria,
      icon: Lightbulb,
      color: "text-yellow-400",
      label: "Innovation",
    },
    {
      key: "technical" as keyof Criteria,
      icon: Code,
      color: "text-blue-400",
      label: "Technical Implementation",
    },
    {
      key: "completeness" as keyof Criteria,
      icon: CheckSquare,
      color: "text-green-400",
      label: "Completeness",
    },
    {
      key: "presentation" as keyof Criteria,
      icon: Video,
      color: "text-purple-400",
      label: "Presentation",
    },
    {
      key: "reflection" as keyof Criteria,
      icon: Map,
      color: "text-pink-400",
      label: "Reflection & Roadmap",
    },
  ];

  return (
    <div className="min-h-screen p-6">
      <div className="max-w-5xl mx-auto">

        {/* Back Button */}

        <Button
          variant="ghost"
          onClick={onBack}
          className="mb-4 text-white hover:bg-white/10"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Submissions
        </Button>

        <div className="grid lg:grid-cols-2 gap-6">

          {/* Submission Details */}

          <Card className="bg-white/5 border-white/10 backdrop-blur-sm h-fit">

            <CardHeader>
              <CardTitle className="text-white text-2xl">
                {submission.title}
              </CardTitle>

              <CardDescription className="text-gray-400">
                Blind Judging Submission Details
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
                  View Demo Video
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
                  Score each criterion from 0–100
                </CardDescription>

              </CardHeader>

              <CardContent className="space-y-6">

                {criteriaConfig.map(({ key, icon: Icon, color, label }) => (

                  <div key={key} className="space-y-3">

                    <div className="flex items-start justify-between">

                      <div className="flex gap-2">

                        <Icon className={`w-5 h-5 ${color}`} />

                        <div>

                          <Label className="text-white font-semibold">
                            {label}
                          </Label>

                          <Badge
                            variant="secondary"
                            className="ml-2 bg-blue-500/20 text-blue-300 border-0"
                          >
                            {(WEIGHTS[key] * 100).toFixed(0)}%
                          </Badge>

                        </div>

                      </div>

                      <span className="text-white font-bold text-lg">
                        {criteria[key]}
                      </span>

                    </div>

                    <Slider
                      value={[criteria[key]]}
                      onValueChange={(value) =>
                        updateCriterion(key, value[0])
                      }
                      max={100}
                      step={1}
                    />

                  </div>
                ))}

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
                    Out of 100
                  </p>

                </div>

              </CardContent>

            </Card>

            <Button
              onClick={handleSave}
              className="w-full bg-green-600 hover:bg-green-700"
            >
              <Save className="w-4 h-4 mr-2" />
              Save Score
            </Button>

          </div>

        </div>

      </div>
    </div>
  );
}
