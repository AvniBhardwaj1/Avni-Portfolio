import { motion } from "framer-motion";
import { Chapter } from "@/components/Chapter";

const GROUPS = [
  {
    id: "data-cloud",
    title: "Data Engineering & Cloud",
    items: ["AWS", "Docker", "Kubernetes", "Kafka", "ClickHouse"],
  },
  {
    id: "ai-ml",
    title: "AI & Machine Learning",
    items: ["PyTorch", "LangChain", "RAG"],
  },
  {
    id: "backend",
    title: "Backend",
    items: ["Python", "C++", "FastAPI"],
  },
];

export const Skills = () => (
  <section
    id="skills"
    data-testid="skills-section"
    className="relative z-10 px-6 py-32 md:px-16 lg:px-24"
  >
    <Chapter no="02" title="Skills" id="skills" />
    <div className="grid grid-cols-1 gap-12 md:grid-cols-3 md:gap-8">
      {GROUPS.map((group, gi) => (
        <motion.div
          key={group.id}
          initial={{ opacity: 0, y: 28 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-60px" }}
          transition={{ duration: 0.6, delay: gi * 0.1, ease: "easeOut" }}
          data-testid={`skill-group-${group.id}`}
        >
          <p className="mb-6 font-mono text-xs uppercase tracking-[0.3em] text-accent">
            {group.title}
          </p>
          <ul className="flex flex-col">
            {group.items.map((item, i) => (
              <li
                key={item}
                data-testid={`skill-${group.id}-${i}`}
                className="group flex cursor-default items-baseline gap-4 border-b border-foreground/10 py-4 transition-[transform,border-color] duration-300 hover:translate-x-2 hover:border-accent/50"
              >
                <span className="font-mono text-[10px] text-muted-foreground">
                  {String(i + 1).padStart(2, "0")}
                </span>
                <span className="font-display text-xl font-semibold tracking-tight transition-colors group-hover:text-accent md:text-2xl">
                  {item}
                </span>
              </li>
            ))}
          </ul>
        </motion.div>
      ))}
    </div>
  </section>
);
