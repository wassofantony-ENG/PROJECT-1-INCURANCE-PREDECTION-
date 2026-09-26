import Link from "next/link";
import { CheckCircle2 } from "lucide-react";
import { Orb } from "@/components/orb";

export function CtaSection() {
  return (
    <section className="px-6 pb-20 md:pb-32 max-w-5xl mx-auto text-center">
      <div className="relative rounded-3xl border border-border bg-card/40 backdrop-blur-xl px-8 py-16 md:py-20 overflow-hidden">
        <Orb className="w-100 h-100 -top-48 -right-32 bg-sky-500/40" />
        <div className="relative">
          <h2 className="text-3xl md:text-5xl font-bold mb-5">
            <span className="bg-linear-to-r from-foreground to-muted-foreground bg-clip-text text-transparent">
              Ready to get started?
            </span>
          </h2>
          <p className="text-muted-foreground text-lg max-w-lg mx-auto mb-10">
            Join thousands of teams already building with Incapp. Free for 14
            days, no credit card required.
          </p>
          <Link
            href="/register"
            className="inline-flex items-center gap-2 bg-primary text-primary-foreground px-8 py-4 rounded-2xl font-bold hover:opacity-90 transition-all hover:scale-105 active:scale-95 shadow-2xl"
          >
            <span>Start your free trial</span>
            <CheckCircle2 className="w-5 h-5" />
          </Link>
        </div>
      </div>
    </section>
  );
}
