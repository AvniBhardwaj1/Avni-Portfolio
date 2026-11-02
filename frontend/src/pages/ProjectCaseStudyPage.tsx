import { useEffect } from "react";
import { ArrowLeft, ArrowUpRight, Github } from "lucide-react";
import { CASE_STUDIES } from "@/components/Experience";
import { ThemeToggle } from "@/components/ThemeToggle";

const hasSpecificRepository = (href?: string) =>
  Boolean(href && href !== "https://github.com/AvniBhardwaj1");

export const ProjectCaseStudyPage = ({ slug }: { slug: string }) => {
  const project = CASE_STUDIES.find((item) => item.id === slug);

  useEffect(() => {
    const previousTitle = document.title;
    if (!project) {
      document.title = "Project not found — Avni Bhardwaj";
      return () => {
        document.title = previousTitle;
      };
    }
    const description = document.querySelector<HTMLMetaElement>('meta[name="description"]');
    const canonical = document.querySelector<HTMLLinkElement>('link[rel="canonical"]');
    const previousDescription = description?.content;
    const previousCanonical = canonical?.href;
    const title = `${project.title} — Avni Bhardwaj`;
    document.title = title;
    if (description) description.content = project.details.problem;
    if (canonical) canonical.href = `${window.location.origin}/projects/${project.id}`;
    document.querySelector<HTMLMetaElement>('meta[property="og:title"]')?.setAttribute("content", title);
    document.querySelector<HTMLMetaElement>('meta[property="og:description"]')?.setAttribute(
      "content",
      project.details.problem,
    );
    document.querySelector<HTMLMetaElement>('meta[property="og:url"]')?.setAttribute(
      "content",
      `${window.location.origin}/projects/${project.id}`,
    );

    return () => {
      document.title = previousTitle;
      if (description && previousDescription) description.content = previousDescription;
      if (canonical && previousCanonical) canonical.href = previousCanonical;
    };
  }, [project]);

  if (!project) {
    return (
      <main
        data-testid="project-case-study-not-found"
        className="flex min-h-screen flex-col items-start justify-center bg-background px-6 py-20 text-foreground md:px-16"
      >
        <p className="font-mono text-xs uppercase tracking-[0.3em] text-accent">404 // case study</p>
        <h1 className="mt-5 font-display text-4xl font-bold">Project not found.</h1>
        <a
          href="/#work"
          data-testid="case-study-not-found-back-link"
          className="mt-8 inline-flex items-center gap-2 font-mono text-xs uppercase tracking-[0.2em] text-accent"
        >
          <ArrowLeft className="h-4 w-4" /> Back to projects
        </a>
      </main>
    );
  }

  return (
    <main
      id="main-content"
      data-testid="project-case-study"
      className="min-h-screen bg-background px-6 py-10 text-foreground md:px-16 lg:px-24"
    >
      <header className="flex items-center justify-between border-b border-foreground/10 pb-5">
        <a
          href="/#hero"
          data-testid="case-study-home-link"
          className="font-mono text-sm font-bold tracking-[0.15em]"
        >
          AB<span className="text-accent">://</span>
        </a>
        <div className="flex items-center gap-4">
          <a
            href="/#work"
            data-testid="case-study-back-link"
            className="inline-flex items-center gap-2 font-mono text-[10px] uppercase tracking-[0.2em] text-muted-foreground transition-colors hover:text-accent"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            All projects
          </a>
          <ThemeToggle />
        </div>
      </header>

      <article
        data-testid={`case-study-${project.id}`}
        className="mx-auto max-w-4xl pb-24 pt-16 md:pt-24"
      >
        <p className="font-mono text-xs uppercase tracking-[0.3em] text-accent">
          {"// case study"} · {project.period}
        </p>
        <h1 className="mt-5 font-display text-4xl font-bold leading-tight tracking-tight md:text-6xl">
          {project.title}
        </h1>
        <p className="mt-4 font-mono text-xs uppercase tracking-[0.2em] text-muted-foreground">
          {project.org}
        </p>
        <div className="mt-10 flex flex-wrap gap-2">
          {project.stack.map((skill) => (
            <span
              key={skill}
              className="rounded-full border border-foreground/10 px-3 py-1.5 font-mono text-[10px] text-muted-foreground"
            >
              {skill}
            </span>
          ))}
        </div>

        <section data-testid={`case-study-section-problem-${project.id}`} className="mt-16 border-t border-foreground/10 pt-8">
          <h2 className="font-mono text-xs uppercase tracking-[0.3em] text-accent">{"// the problem"}</h2>
          <p className="mt-4 max-w-3xl text-base leading-relaxed text-muted-foreground md:text-lg">
            {project.details.problem}
          </p>
        </section>

        <section data-testid={`case-study-section-architecture-${project.id}`} className="mt-12 border-t border-foreground/10 pt-8">
          <h2 className="font-mono text-xs uppercase tracking-[0.3em] text-accent">{"// architecture"}</h2>
          <ol className="mt-5 space-y-4">
            {project.details.architecture.map((item, index) => (
              <li
                key={item}
                data-testid={`case-study-architecture-${index}`}
                className="flex gap-4 text-sm leading-relaxed text-muted-foreground md:text-base"
              >
                <span className="font-mono text-xs text-accent">{String(index + 1).padStart(2, "0")}</span>
                {item}
              </li>
            ))}
          </ol>
        </section>

        <section data-testid={`case-study-section-impact-${project.id}`} className="mt-12 border-t border-foreground/10 pt-8">
          <h2 className="font-mono text-xs uppercase tracking-[0.3em] text-accent">{"// impact"}</h2>
          <ul className="mt-5 space-y-3">
            {project.details.impact.map((item) => (
              <li key={item} className="flex gap-3 text-sm leading-relaxed text-foreground md:text-base">
                <span className="mt-2 h-1.5 w-1.5 shrink-0 rotate-45 bg-accent" aria-hidden="true" />
                {item}
              </li>
            ))}
          </ul>
        </section>

        <div className="mt-12 flex flex-wrap gap-3">
          {hasSpecificRepository(project.href) && (
            <a
              href={project.href}
              target="_blank"
              rel="noreferrer"
              data-testid="case-study-repository"
              className="inline-flex items-center gap-2 rounded-full bg-accent px-5 py-3 font-mono text-[10px] uppercase tracking-[0.2em] text-accent-foreground transition-transform hover:scale-[1.03]"
            >
              <Github className="h-4 w-4" />
              View code
              <ArrowUpRight className="h-3.5 w-3.5" />
            </a>
          )}
          <a
            href="/#work"
            data-testid="case-study-return-to-work"
            className="inline-flex items-center gap-2 rounded-full border border-foreground/15 px-5 py-3 font-mono text-[10px] uppercase tracking-[0.2em] text-muted-foreground transition-colors hover:border-accent hover:text-accent"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            More projects
          </a>
        </div>
      </article>
    </main>
  );
};
