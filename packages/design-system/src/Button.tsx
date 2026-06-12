import type { ButtonHTMLAttributes, ReactNode } from "react";

export type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  readonly children: ReactNode;
};

export const Button = ({ children, type = "button", ...props }: ButtonProps) => (
  <button
    type={type}
    {...props}
    style={{
      appearance: "none",
      border: "1px solid var(--color-border)",
      borderRadius: "var(--radius-sm)",
      background: "var(--color-accent)",
      color: "#fff",
      cursor: "pointer",
      font: "inherit",
      fontWeight: 600,
      padding: "var(--space-2) var(--space-4)",
      ...(props.style ?? {}),
    }}
  >
    {children}
  </button>
);
