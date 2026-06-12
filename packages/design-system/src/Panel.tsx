import type { HTMLAttributes, ReactNode } from "react";

export type PanelProps = HTMLAttributes<HTMLElement> & {
  readonly title: string;
  readonly children: ReactNode;
  readonly id?: string;
};

export const Panel = ({ title, children, id, ...props }: PanelProps) => (
  <section
    id={id}
    aria-labelledby={id ? `${id}-title` : undefined}
    {...props}
    style={{
      background: "var(--color-surface)",
      border: "1px solid var(--color-border)",
      borderRadius: "var(--radius-md)",
      padding: "var(--space-6)",
      ...(props.style ?? {}),
    }}
  >
    <h2
      id={id ? `${id}-title` : undefined}
      style={{ margin: "0 0 var(--space-4)", fontSize: "1.125rem" }}
    >
      {title}
    </h2>
    {children}
  </section>
);
