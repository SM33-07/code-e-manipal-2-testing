"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { CheckCircle, Circle } from "lucide-react";

export interface JudgeSubmission {
  id: string;
  title: string;
  description: string;
  writeup: string;
  reflection: string;
  demoUrl: string;
  teamSize: number;
  judged: boolean;
}

interface Props {
  submissions: JudgeSubmission[];
  onSelectSubmission: (id: string) => void;
}

export function SubmissionList({
  submissions,
  onSelectSubmission,
}: Props) {
  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      {submissions.length === 0 && (
        <p className="text-white/40 text-sm col-span-full text-center py-8">
          No submissions assigned yet.
        </p>
      )}
      {submissions.map((submission) => (
        <Card
          key={submission.id}
          className="bg-white/5 border-white/10 backdrop-blur-sm"
        >
          <CardHeader>
            <div className="flex justify-between">
              <CardTitle className="text-white text-lg">
                {submission.title}
              </CardTitle>
              {submission.judged
                ? <CheckCircle className="text-green-400"/>
                : <Circle className="text-gray-500"/>
              }
            </div>
          </CardHeader>
          <CardContent className="flex justify-between items-center">
            <Badge variant="secondary">
              {submission.teamSize} members
            </Badge>
            <Button
              size="sm"
              onClick={() => onSelectSubmission(submission.id)}
            >
              {submission.judged ? "Review" : "Judge"}
            </Button>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
