"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <div className="flex justify-center py-8">
        <div className="animate-pulse w-full max-w-md h-24 bg-muted rounded-xl" />
      </div>
    );
  }

  if (submissions.length === 0) {
    return (
      <p className="text-center py-12 text-sm font-medium text-muted-foreground">
        No submissions match the active filters.
      </p>
    );
  }

  return (
    <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
      {submissions.map((submission) => {
        return (
          <Card
            key={submission.id}
            className="border border-border bg-card rounded-2xl shadow-sm transition-all duration-300 hover:shadow-md hover:border-primary/50 flex flex-col justify-between"
          >
            <CardHeader className="pb-3">
              <div className="flex justify-between items-start gap-4">
                <CardTitle className="text-lg font-bold tracking-tight text-foreground">
                  {submission.title}
                </CardTitle>
                {submission.judged ? (
                  <CheckCircle className="w-5 h-5 text-emerald-500 shrink-0" />
                ) : (
                  <Circle className="w-5 h-5 text-muted-foreground/40 shrink-0" />
                )}
              </div>
              <p className="text-xs text-muted-foreground mt-2 line-clamp-2 leading-relaxed">
                {submission.description}
              </p>
            </CardHeader>
            <CardContent className="pt-0 pb-5 flex justify-between items-center mt-auto">
              <Badge
                variant="outline"
                className="bg-primary/10 text-primary border-primary/20 px-2.5 py-0.5 rounded-full text-xs font-semibold"
              >
                {submission.teamSize} members
              </Badge>
              <button
                onClick={() => onSelectSubmission(submission.id)}
                className={`px-4 py-1.5 rounded-xl font-bold text-xs transition-all duration-200 cursor-pointer ${
                  submission.judged
                    ? "bg-muted text-foreground hover:bg-muted/80 border border-border"
                    : "bg-primary text-primary-foreground hover:opacity-95 shadow-sm"
                }`}
              >
                {submission.judged ? "View Score" : "Grade Project"}
              </button>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
