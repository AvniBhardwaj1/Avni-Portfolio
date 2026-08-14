export const Chapter = ({ no, title, id }: { no: string; title: string; id?: string }) => (
  <div className="mb-16 flex items-baseline gap-6" data-testid={id ? `${id}-chapter` : undefined}>
    <span className="font-mono text-sm tracking-[0.2em] text-accent">{no}</span>
    <h2 className="font-display text-3xl font-bold tracking-tight md:text-5xl">{title}</h2>
    <div className="h-px flex-1 bg-foreground/10" />
  </div>
);
