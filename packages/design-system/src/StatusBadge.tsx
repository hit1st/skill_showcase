import type { HTMLAttributes } from "react";

export type StatusTone = "neutral" | "success" | "danger";

export type StatusBadgeProps = HTMLAttributes<HTMLSpanElement> & {
  readonly label: string;
  readonly tone?: StatusTone;
};

const toneColor: Record<StatusTone, string> = {
  neutral: "var(--color-muted)",
  success: "var(--color-success)",
  danger: "var(--color-danger)",
};

export const StatusBadge = ({
  label,
  tone = "neutral",
  ...props
}: StatusBadgeProps) => (
  <span
    {...props}
    style={{
      border: "1px solid var(--color-border)",
      borderRadius: "999px",
      color: toneColor[tone],
      display: "inline-block",
      fontFamily: "var(--font-mono)",
      fontSize: "0.8125rem",
      padding: "var(--space-1) var(--space-3)",
      ...(props.style ?? {}),
    }}
  >
    {label}
  </span>
);
