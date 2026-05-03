/**
 * Tiny set of presentational primitives shared across admin pages.
 * Keep these thin wrappers — anything more complex earns its own file.
 */
import type { ButtonHTMLAttributes, InputHTMLAttributes, ReactNode, SelectHTMLAttributes } from "react";

export function Card({ children, className = "" }: { children: ReactNode; className?: string }) {
  return (
    <div className={`rounded-lg border border-line bg-bg-1 ${className}`}>{children}</div>
  );
}

export function Stat({
  label,
  value,
  sub,
}: {
  label: string;
  value: ReactNode;
  sub?: ReactNode;
}) {
  return (
    <Card className="p-5">
      <div className="text-xs uppercase tracking-widest text-fg-3">{label}</div>
      <div className="mt-2 text-2xl font-semibold text-fg-0">{value}</div>
      {sub != null && <div className="mt-1 text-xs text-fg-2">{sub}</div>}
    </Card>
  );
}

type Variant = "default" | "primary" | "danger" | "ghost";

const variantClass: Record<Variant, string> = {
  default: "bg-bg-3 text-fg-1 hover:bg-bg-2 border border-line",
  primary: "bg-accent text-white hover:bg-accent-hover",
  danger: "bg-danger/15 text-danger hover:bg-danger/25 border border-danger/30",
  ghost: "text-fg-2 hover:text-fg-0 hover:bg-bg-2",
};

export function Button({
  variant = "default",
  className = "",
  ...rest
}: ButtonHTMLAttributes<HTMLButtonElement> & { variant?: Variant }) {
  return (
    <button
      {...rest}
      className={`inline-flex items-center gap-1.5 rounded-md px-3 py-1.5 text-sm transition disabled:opacity-50 disabled:cursor-not-allowed ${variantClass[variant]} ${className}`}
    />
  );
}

export function TextInput({ className = "", ...rest }: InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      {...rest}
      className={`w-full rounded-md border border-line bg-bg-2 px-3 py-1.5 text-sm text-fg-1 outline-none focus:border-accent ${className}`}
    />
  );
}

export function Select({ className = "", children, ...rest }: SelectHTMLAttributes<HTMLSelectElement>) {
  return (
    <select
      {...rest}
      className={`rounded-md border border-line bg-bg-2 px-3 py-1.5 text-sm text-fg-1 outline-none focus:border-accent ${className}`}
    >
      {children}
    </select>
  );
}

export function Badge({
  children,
  tone = "default",
}: {
  children: ReactNode;
  tone?: "default" | "success" | "danger" | "warn" | "info" | "accent";
}) {
  const tones: Record<string, string> = {
    default: "bg-bg-3 text-fg-2 border-line",
    success: "bg-success/15 text-success border-success/30",
    danger: "bg-danger/15 text-danger border-danger/30",
    warn: "bg-warn/15 text-warn border-warn/30",
    info: "bg-info/15 text-info border-info/30",
    accent: "bg-accent/15 text-accent border-accent/30",
  };
  return (
    <span className={`inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-xs ${tones[tone]}`}>
      {children}
    </span>
  );
}

export function Table({ children }: { children: ReactNode }) {
  return (
    <div className="overflow-x-auto rounded-lg border border-line bg-bg-1">
      <table className="min-w-full text-sm">{children}</table>
    </div>
  );
}

export function THead({ children }: { children: ReactNode }) {
  return (
    <thead className="border-b border-line text-left text-xs uppercase tracking-widest text-fg-3">
      {children}
    </thead>
  );
}

export function TR({ children, className = "" }: { children: ReactNode; className?: string }) {
  return <tr className={`border-b border-line/60 last:border-0 ${className}`}>{children}</tr>;
}

export function TH({ children, className = "" }: { children: ReactNode; className?: string }) {
  return <th className={`px-4 py-2.5 font-medium ${className}`}>{children}</th>;
}

export function TD({ children, className = "" }: { children: ReactNode; className?: string }) {
  return <td className={`px-4 py-2.5 align-middle ${className}`}>{children}</td>;
}
