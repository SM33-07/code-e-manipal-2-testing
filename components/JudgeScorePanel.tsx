"use client"

import { useState } from "react"

export default function JudgeScorePanel({
  projectId,
}: {
  projectId: string
}) {
  const [scoreInnovation, setScoreInnovation] = useState(5)
  const [scoreTechnical, setScoreTechnical] = useState(5)
  const [scorePresentation, setScorePresentation] = useState(5)
  const [scoreImpact, setScoreImpact] = useState(5)
  const [feedback, setFeedback] = useState("")
  const [submitting, setSubmitting] = useState(false)

  const submitScore = async () => {
    setSubmitting(true)
    try {
      const res = await fetch("/api/judging/reviews", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          submission_id: projectId,
          score_innovation: scoreInnovation,
          score_technical: scoreTechnical,
          score_presentation: scorePresentation,
          score_impact: scoreImpact,
          feedback,
          is_complete: true,
        }),
      })

      if (!res.ok) throw new Error("Submit failed")
      alert("Score submitted!")
    } catch (err) {
      console.error("Submit error:", err)
      alert("Failed to submit score")
    }
    setSubmitting(false)
  }

  const renderSlider = (label: string, value: number, setter: (v: number) => void) => (
    <div className="mb-3">
      <div className="flex justify-between text-white text-sm mb-1">
        <span>{label}</span>
        <span>{value}/10</span>
      </div>
      <input
        type="range"
        min={1}
        max={10}
        step={1}
        value={value}
        onChange={(e) => setter(Number(e.target.value))}
        className="w-full accent-purple-500"
      />
    </div>
  )

  return (
    <div className="bg-white/5 p-6 rounded-xl">
      <h3 className="text-white text-lg mb-4">Judge Score</h3>

      {renderSlider("Innovation", scoreInnovation, setScoreInnovation)}
      {renderSlider("Technical", scoreTechnical, setScoreTechnical)}
      {renderSlider("Presentation", scorePresentation, setScorePresentation)}
      {renderSlider("Impact", scoreImpact, setScoreImpact)}

      <textarea
        placeholder="Judge feedback..."
        value={feedback}
        onChange={(e) => setFeedback(e.target.value)}
        className="w-full mt-4 p-2 rounded bg-black/40 text-white border border-white/10 resize-none"
        rows={3}
      />

      <button
        onClick={submitScore}
        disabled={submitting}
        className="mt-4 px-4 py-2 bg-purple-600 hover:bg-purple-500 rounded text-white w-full disabled:opacity-40"
      >
        {submitting ? "Submitting..." : "Submit Score"}
      </button>
    </div>
  )
}
