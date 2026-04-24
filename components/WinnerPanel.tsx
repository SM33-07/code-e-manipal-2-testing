"use client"

import { useState } from "react"
import { Trophy } from "lucide-react"
import GlassCard from "@/components/ui/GlassCard"
import { publicAnonKey } from "@/lib/supabase/info"

const SERVER_URL =
"https://ihnclawnbtkwvbfqwxfe.supabase.co/functions/v1/make-server-f5beda68"

export default function WinnerPanel(){

  const [winners,setWinners] = useState<any[]>([])
  const [loading,setLoading] = useState(false)

  const calculateWinners = async () => {

    setLoading(true)

    const res = await fetch(`${SERVER_URL}/winners`,{
      headers:{
        Authorization:`Bearer ${publicAnonKey}`
      }
    })

    const data = await res.json()

    setWinners(data.winners || [])

    setLoading(false)

  }

  return(

    <GlassCard className="p-6 space-y-6">

      <div className="flex items-center justify-between">

        <h2 className="text-white text-xl flex items-center gap-2">

          <Trophy className="text-yellow-400"/>

          Hackathon Winners

        </h2>

        <button
          onClick={calculateWinners}
          className="px-4 py-2 bg-purple-600 rounded hover:bg-purple-500"
        >
          {loading ? "Calculating..." : "Calculate Winners"}
        </button>

      </div>


      {winners.length > 0 && (

        <div className="space-y-4">

          {winners.map((w,i)=>(

            <div
              key={w.id}
              className="flex justify-between bg-white/5 p-4 rounded-lg"
            >

              <div>

                <p className="text-white font-semibold">

                  {i === 0 && "🥇 "}
                  {i === 1 && "🥈 "}
                  {i === 2 && "🥉 "}

                  {w.projectName}

                </p>

                <p className="text-white/60 text-sm">
                  {w.teamName}
                </p>

              </div>

              <p className="text-yellow-400 font-bold">

                {w.avgScore?.toFixed(2)}

              </p>

            </div>

          ))}

        </div>

      )}

    </GlassCard>

  )

}
