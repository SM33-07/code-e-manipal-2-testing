"use client";

import { motion } from "framer-motion";
import { Download } from "lucide-react";

export function DataExport(){

  const exportCSV = ()=>{
    alert("Exporting hackathon data...");
  }

  return(
    <motion.div
      className="bg-white/5 border border-white/10 rounded-xl p-6 backdrop-blur-xl"
      initial={{opacity:0,y:20}}
      animate={{opacity:1,y:0}}
    >

      <div className="flex items-center gap-3 mb-4">

        <Download className="text-cyan-400"/>

        <h2 className="text-white text-xl">
          Data Export
        </h2>

      </div>

      <p className="text-white/60 mb-5">
        Download hackathon data including teams, submissions and scores.
      </p>

      <button
        onClick={exportCSV}
        className="px-5 py-2 bg-cyan-600 text-white rounded-lg hover:bg-cyan-500 transition"
      >
        Export CSV
      </button>

    </motion.div>
  )
}
