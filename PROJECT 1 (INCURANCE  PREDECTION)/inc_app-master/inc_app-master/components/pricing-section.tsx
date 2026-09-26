import { CheckCircle2 } from "lucide-react";
import Link from "next/link";

const plans = [
  {
    name: "Starter",
    price: "Free",
    description: "Perfect for getting started and exploring the platform.",
    features: [
      "Up to 1,000 requests/day",
      "Basic analytics dashboard",
      "Community support",
      "1 team member",
    ],
    cta: "Get Started",
    href: "/register",
    featured: false,
  },
  {
    name: "Pro",
    price: "$29",
    period: "/month",
    description: "For growing teams that need more power and flexibility.",
    features: [
      "Up to 100,000 requests/day",
      "Advanced analytics & reports",
      "Priority email support",
      "Up to 10 team members",
      "Custom integrations",
      "99.99% uptime SLA",
    ],
    cta: "Start Free Trial",
    href: "/register",
    featured: true,
  },
  {
    name: "Enterprise",
    price: "Custom",
    description: "Tailored solutions for large-scale deployments.",
    features: [
      "Unlimited requests",
      "Real-time analytics & AI insights",
      "Dedicated support engineer",
      "Unlimited team members",
      "SSO & audit logging",
      "Custom SLA",
      "On-premise deployment",
    ],
    cta: "Contact Sales",
    href: "#",
    featured: false,
  },
];

function PricingCard({
  name,
  price,
  period,
  description,
  features,
  cta,
  href,
  featured,
}: (typeof plans)[number]) {
  return (
    <div id="pricing"
      className={`relative rounded-3xl border p-8 flex flex-col ${
        featured
          ? "border-sky-500/50 bg-sky-500/5 shadow-2xl shadow-sky-500/10 scale-105"
          : "border-border bg-card/40"
      }`}
    >
      {featured && (
        <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-linear-to-r from-sky-500 to-violet-500 text-white text-xs font-semibold px-4 py-1 rounded-full">
          Most Popular
        </div>
      )}
      <div className="mb-6">
        <h3 className="text-xl font-semibold text-foreground mb-1">{name}</h3>
        <div className="flex items-baseline gap-1 mt-3">
          <span className="text-4xl font-bold text-foreground">{price}</span>
          {period && (
            <span className="text-sm text-muted-foreground">{period}</span>
          )}
        </div>
        <p className="text-sm text-muted-foreground mt-3 leading-relaxed">
          {description}
        </p>
      </div>
      <ul className="space-y-3 mb-8 flex-1">
        {features.map((feature) => (
          <li key={feature} className="flex items-start gap-3 text-sm">
            <CheckCircle2 className="w-4 h-4 text-emerald-500 mt-0.5 shrink-0" />
            <span className="text-muted-foreground">{feature}</span>
          </li>
        ))}
      </ul>
      <Link
        href={href}
        className={`text-center font-semibold px-6 py-3 rounded-2xl transition-all ${
          featured
            ? "bg-linear-to-r from-sky-500 to-violet-500 text-white hover:scale-105 active:scale-95 shadow-xl shadow-sky-500/20"
            : "border border-border text-foreground hover:bg-muted"
        }`}
      >
        {cta}
      </Link>
    </div>
  );
}

export function PricingSection() {
  return (
    <section id="pricing" className="px-6 py-20 md:py-32 max-w-6xl mx-auto">
      <div className="text-center mb-16">
        <h2 className="text-3xl md:text-5xl font-bold mb-4">
          <span className="bg-linear-to-r from-foreground to-muted-foreground bg-clip-text text-transparent">
            Simple, transparent pricing
          </span>
        </h2>
        <p className="text-muted-foreground text-lg max-w-xl mx-auto">
          Choose the plan that fits your team. No hidden fees, no surprises.
        </p>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-stretch">
        {plans.map((plan) => (
          <PricingCard key={plan.name} {...plan} />
        ))}
      </div>
    </section>
  );
}
