const ITEMS = [
  "DATA PIPELINES",
  "CLOUD ARCHITECTURE",
  "GENERATIVE AI",
  "RAG SYSTEMS",
  "DISTRIBUTED COMPUTE",
  "MLOPS",
  "AGENTIC AI",
];

const Row = ({ hidden }: { hidden?: boolean }) => (
  <div className="flex shrink-0 items-center" aria-hidden={hidden}>
    {ITEMS.map((item) => (
      <span key={item} className="flex items-center">
        <span className="px-8 font-mono text-sm tracking-[0.35em] text-muted-foreground">
          {item}
        </span>
        <span className="h-1.5 w-1.5 rotate-45 bg-accent" />
      </span>
    ))}
  </div>
);

export const Marquee = () => (
  <div
    data-testid="editorial-marquee"
    className="relative z-10 overflow-hidden border-y border-foreground/10 bg-background/50 py-6 backdrop-blur-sm"
  >
    <div className="marquee-track flex w-max">
      <Row />
      <Row hidden />
    </div>
  </div>
);
