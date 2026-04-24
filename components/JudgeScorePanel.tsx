"use client"

import { useState } from "react"

import { publicAnonKey } from "@/lib/supabase/info"

const SERVER_URL =
"https://ihnclawnbtkwvbfqwxfe.supabase.co/functions/v1/make-server-f5beda68"

export default function JudgeScorePanel({
  projectId,
  judgeEmail,
}: {
  projectId: string
  judgeEmail: string
}) {

  const [score, setScore] = useState(5)
  const [feedback, setFeedback] = useState("")

  const submitScore = async () => {

    await fetch(`${SERVER_URL}/score/${projectId}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${publicAnonKey}`,
      },
      body: JSON.stringify({
        judgeEmail,
        score,
        feedback,
      }),
    })

    alert("Score submitted!")

  }

  return (

    <div className="bg-white/5 p-6 rounded-xl">

      <h3 className="text-white text-lg mb-4">
        Judge Score
      </h3>

      <input
        type="range"
        min="0"
        max="10"
        value={score}
        onChange={(e)=>setScore(Number(e.target.value))}
        className="w-full"
      />

      <p className="text-white mt-2">
        Score: {score}/10
      </p>

      <textarea
        placeholder="Judge feedback..."
        value={feedback}
        onChange={(e)=>setFeedback(e.target.value)}
        className="w-full mt-4 p-2 rounded bg-black/40 text-white"
      />

      <button
        onClick={submitScore}
        className="mt-4 px-4 py-2 bg-purple-600 rounded"
      >
        Submit Score
      </button>

    </div>
  )
}
