import {
  Shield,
  Zap,
  BarChart3,
  Globe,
  Users,
  FileCode,
} from "lucide-react";
import { FeatureCard } from "@/components/feature-card";

const features = [
  {
    icon: Shield,
    title: "Enterprise Security",
    description:
      "Bank-grade encryption, multi-factor authentication, and SOC 2 compliance to keep your data safe.",
    iconBg: "bg-sky-500/15",
    iconColor: "text-sky-500",
  },
  {
    icon: Zap,
    title: "Lightning Performance",
    description:
      "Blazing fast load times with edge caching, CDN distribution, and real-time data streaming.",
    iconBg: "bg-emerald-500/15",
    iconColor: "text-emerald-500",
  },
  {
    icon: BarChart3,
    title: "Advanced Analytics",
    description:
      "Rich dashboards with custom reports, cohort analysis, and AI-powered insights and predictions.",
    iconBg: "bg-violet-500/15",
    iconColor: "text-violet-500",
  },
  {
    icon: Globe,
    title: "Global Scale",
    description:
      "Deploy across 30+ regions worldwide with automatic failover and 99.99% uptime SLA.",
    iconBg: "bg-amber-500/15",
    iconColor: "text-amber-500",
  },
  {
    icon: Users,
    title: "Team Collaboration",
    description:
      "Real-time collaboration with role-based access, shared workspaces, and activity logging.",
    iconBg: "bg-rose-500/15",
    iconColor: "text-rose-500",
  },
  {
    icon: FileCode,
    title: "API First Design",
    description:
      "RESTful and GraphQL APIs with auto-generated SDKs, webhooks, and comprehensive documentation.",
    iconBg: "bg-cyan-500/15",
    iconColor: "text-cyan-500",
  },
];

export function FeaturesSection() {
  return (
    <section id="features" className="px-6 py-20 md:py-32 max-w-7xl mx-auto">
      <div className="text-center mb-16">
        <h2 className="text-3xl md:text-5xl font-bold mb-4">
          <span className="bg-linear-to-r from-foreground to-muted-foreground bg-clip-text text-transparent">
            Everything you need
          </span>
        </h2>
        <p className="text-muted-foreground text-lg max-w-xl mx-auto">
          Powerful features to help you build, deploy, and scale your
          application.
        </p>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {features.map((feature, i) => (
          <FeatureCard key={feature.title} {...feature} delay={i * 100} />
        ))}
      </div>
    </section>
  );
}
