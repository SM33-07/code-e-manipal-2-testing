"use client";

import { motion } from "framer-motion";
import { Trophy } from "lucide-react";

export function ResultsManagement(){

  return(
    <motion.div
      className="bg-white/5 border border-white/10 rounded-xl p-6 backdrop-blur-xl"
      initial={{opacity:0,y:20}}
      animate={{opacity:1,y:0}}
    >

      <div className="flex items-center gap-3 mb-4">

        <Trophy className="text-yellow-400"/>

        <h2 className="text-white text-xl">
          Results Management
        </h2>

      </div>

      <p className="text-white/60 mb-5">
        Control when results are announced and visible.
      </p>

      <button className="px-5 py-2 bg-green-600 text-white rounded-lg hover:bg-green-500 transition">
        Publish Results
      </button>

    </motion.div>
  )
}
