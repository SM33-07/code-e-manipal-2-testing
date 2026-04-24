"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { CheckCircle, Circle } from "lucide-react";
import { Submission } from "@/types/judging";

interface Props {
  submissions: Submission[];
  judgedSubmissionIds: string[];
  onSelectSubmission: (id: string) => void;
}

export function SubmissionList({
  submissions,
  judgedSubmissionIds,
  onSelectSubmission,
}: Props) {

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">

      {submissions.map((submission) => {

        const isJudged = judgedSubmissionIds.includes(submission.id);

        return (
          <Card
            key={submission.id}
            className="bg-white/5 border-white/10 backdrop-blur-sm"
          >

            <CardHeader>

              <div className="flex justify-between">

                <CardTitle className="text-white text-lg">
                  {submission.title}
                </CardTitle>

                {isJudged
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
                {isJudged ? "Review" : "Judge"}
              </Button>

            </CardContent>

          </Card>
        );
      })}

    </div>
  );
}
