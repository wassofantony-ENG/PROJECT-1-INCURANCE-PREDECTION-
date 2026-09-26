import Link from "next/link";
import { Sparkles, ArrowRight } from "lucide-react";

const stats = [
  { value: "99.99%", label: "Uptime" },
  { value: "10M+", label: "Requests/day" },
  { value: "50K+", label: "Active users" },
  { value: "150+", label: "Countries" },
];

export function HeroSection() {
  return (
    <section className="flex flex-col items-center justify-center px-6 pt-24 pb-20 md:pt-36 md:pb-32 text-center max-w-5xl mx-auto">
      <div className="inline-flex items-center gap-2 bg-muted/50 border border-border/50 rounded-full px-5 py-2 mb-8 animate-fade-in">
        <Sparkles className="w-4 h-4 text-amber-500" />
        <span className="text-sm text-muted-foreground">
          Now with AI-powered analytics
        </span>
      </div>

      <h1 className="text-5xl sm:text-6xl md:text-8xl font-bold tracking-tight mb-8 leading-[1.1]">
        <span className="bg-linear-to-r from-foreground via-foreground to-muted-foreground bg-clip-text text-transparent">
          Build the future
        </span>
        <br />
        <span className="bg-linear-to-r from-sky-400 via-violet-400 to-sky-400 bg-clip-text text-transparent bg-size-[200%_auto] animate-gradient">
          ship with confidence
        </span>
      </h1>

      <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto mb-12 leading-relaxed">
        The complete platform for modern teams — from blazing fast
        infrastructure to powerful analytics, everything you need to scale.
      </p>

      <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
        <Link
          href="/register"
          className="group relative inline-flex items-center gap-2 overflow-hidden rounded-2xl bg-linear-to-r from-sky-500 to-violet-500 px-8 py-4 text-base font-semibold text-white transition-all hover:scale-105 active:scale-95 shadow-2xl shadow-sky-500/25"
        >
          <span className="absolute inset-0 bg-white/0 group-hover:bg-white/10 transition-colors" />
          <span className="relative">Start Building Free</span>
          <ArrowRight className="relative w-4 h-4 group-hover:translate-x-1 transition-transform" />
        </Link>
        <Link
          href="/login"
          className="inline-flex items-center gap-2 border border-border bg-card/50 backdrop-blur-sm text-foreground px-8 py-4 rounded-2xl font-medium hover:bg-muted hover:border-border transition-all"
        >
          Watch Demo
          <svg
            className="w-4 h-4"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z"
            />
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
        </Link>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-8 md:gap-16 mt-20 w-full max-w-3xl">
        {stats.map((stat) => (
          <div key={stat.label} className="text-center">
            <div className="text-3xl md:text-4xl font-bold bg-linear-to-b from-foreground to-muted-foreground bg-clip-text text-transparent">
              {stat.value}
            </div>
            <div className="text-sm text-muted-foreground/70 mt-1">{stat.label}</div>
          </div>
        ))}
      </div>
    </section>
  );
}
