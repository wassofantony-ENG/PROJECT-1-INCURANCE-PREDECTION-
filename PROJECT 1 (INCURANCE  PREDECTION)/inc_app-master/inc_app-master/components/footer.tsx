import { Zap } from "lucide-react";

export function Footer() {
  return (
    <footer className="border-t border-border/60 py-8 px-6">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Zap className="w-4 h-4 text-sky-500" />
          <span>Incapp</span>
        </div>
        <div className="text-sm text-muted-foreground/60">
          &copy; 2026 Incapp, Inc. All rights reserved.
        </div>
      </div>
    </footer>
  );
}
