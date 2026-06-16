import { motion } from "framer-motion";
import { Lightbulb, Users, Tag, Cpu } from "lucide-react";

interface TeamMember {
  name: string;
  role: string;
}

interface Props {
  title: string;
  summary: string;
  category: string;
  technologies: string[];
  teamMembers: TeamMember[];
}

export default function ProjectOverview({ title, summary, category, technologies, teamMembers }: Props) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
      className="glass-card p-6 md:p-8 space-y-6"
    >
      <div>
        <h2 className="text-3xl md:text-4xl font-bold gradient-text mb-3">{title}</h2>
        <p className="body-text text-lg">{summary}</p>
      </div>

      <div className="grid sm:grid-cols-2 gap-6">
        {/* Category */}
        <div>
          <h3 className="flex items-center gap-2 text-sm font-semibold uppercase tracking-wider text-[#A08070]-foreground mb-2">
            <Tag className="w-4 h-4" /> Category
          </h3>
          <span className="tech-badge inline-block">{category}</span>
        </div>

        {/* Tech Stack */}
        <div>
          <h3 className="flex items-center gap-2 text-sm font-semibold uppercase tracking-wider text-[#A08070]-foreground mb-2">
            <Cpu className="w-4 h-4" /> Tech Stack
          </h3>
          <div className="flex flex-wrap gap-2">
            {technologies.map((tech, i) => (
              <motion.span
                key={tech}
                initial={{ opacity: 0, scale: 0 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.3 + i * 0.04 }}
                className="tech-badge"
              >
                {tech}
              </motion.span>
            ))}
          </div>
        </div>
      </div>

      {/* Team Members */}
      <div>
        <h3 className="flex items-center gap-2 text-sm font-semibold uppercase tracking-wider text-[#A08070]-foreground mb-3">
          <Users className="w-4 h-4" /> Team Members
        </h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {teamMembers.map((member, i) => (
            <motion.div
              key={member.name}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 + i * 0.1 }}
              className="flex items-center gap-3 p-3 rounded-xl bg-[#A08070]/50"
            >
              <div className="w-10 h-10 rounded-full flex items-center justify-center text-primary-foreground font-bold text-sm shrink-0"
                style={{ background: "linear-gradient(135deg, hsl(var(--gradient-start)), hsl(var(--gradient-mid)))" }}>
                {member.name.charAt(0)}
              </div>
              <div className="min-w-0">
                <p className="text-sm font-medium text-[#F5EFE0] truncate">{member.name}</p>
                <p className="text-xs text-[#A08070]-foreground truncate">{member.role}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </motion.div>
  );
}
