import type { ReactNode } from "react";

export function AuthCard({
  title,
  subtitle,
  children,
  footer,
}: {
  title: string;
  subtitle: string;
  children: ReactNode;
  footer?: ReactNode;
}) {
  return (
    <div className="max-w-lg w-full rounded-3xl border border-border bg-card p-8 shadow-2xl shadow-black/10 dark:shadow-black/30">
      <h1 className="text-3xl font-semibold mb-2">{title}</h1>
      <p className="text-muted-foreground mb-6">{subtitle}</p>
      {children}
      {footer && (
        <p className="mt-6 text-center text-sm text-muted-foreground">{footer}</p>
      )}
    </div>
  );
}
