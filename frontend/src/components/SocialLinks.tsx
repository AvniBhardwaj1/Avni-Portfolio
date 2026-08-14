import { Braces, Github, Linkedin, Mail } from "lucide-react";

const LINKS = [
  { id: "github", href: "https://github.com/avnibhardwaj1", Icon: Github, label: "GitHub" },
  { id: "linkedin", href: "https://www.linkedin.com/in/avnibhardwaj", Icon: Linkedin, label: "LinkedIn" },
  { id: "leetcode", href: "https://leetcode.com/u/avnibhardwaj1", Icon: Braces, label: "LeetCode" },
  { id: "email", href: "mailto:avnibhardwaj01.ab@gmail.com", Icon: Mail, label: "Email" },
];

export const SocialLinks = () => (
  <div className="flex flex-wrap items-center gap-3" data-testid="social-links">
    {LINKS.map(({ id, href, Icon, label }) => (
      <a
        key={id}
        href={href}
        target={href.startsWith("http") ? "_blank" : undefined}
        rel="noreferrer"
        aria-label={label}
        data-testid={`social-${id}`}
        data-magnetic
        className="flex h-11 w-11 items-center justify-center rounded-full border border-foreground/15 text-muted-foreground transition-colors hover:border-accent hover:text-accent"
      >
        <Icon className="h-4 w-4" />
      </a>
    ))}
  </div>
);
