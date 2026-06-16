import { motion } from "framer-motion";
import { Github, Globe, FileText, ExternalLink } from "lucide-react";

interface Props {
  githubUrl: string;
  demoUrl: string;
  docsUrl: string;
}

const links = [
  { key: "githubUrl", label: "GitHub Repository", icon: Github },
  { key: "demoUrl", label: "Live Demo", icon: Globe },
  { key: "docsUrl", label: "Documentation", icon: FileText },
] as const;

export default function ResourceLinks({ githubUrl, demoUrl, docsUrl }: Props) {
  const urls = { githubUrl, demoUrl, docsUrl };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay: 0.3 }}
      className="glass-card p-6"
    >
      <h2 className="section-heading">
        <div className="gradient-accent-bar" />
        Resources
      </h2>
      <div className="grid sm:grid-cols-3 gap-3">
        {links.map(({ key, label, icon: Icon }, i) => (
          <motion.a
            key={key}
            href={urls[key]}
            target="_blank"
            rel="noopener noreferrer"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 + i * 0.1 }}
            className="flex items-center gap-3 p-4 rounded-xl bg-muted/40 hover:bg-muted/70 transition-colors group"
          >
            <Icon className="w-5 h-5 text-primary" />
            <span className="text-sm font-medium text-foreground flex-1">{label}</span>
            <ExternalLink className="w-4 h-4 text-muted-foreground group-hover:text-foreground transition-colors" />
          </motion.a>
        ))}
      </div>
    </motion.div>
  );
}
