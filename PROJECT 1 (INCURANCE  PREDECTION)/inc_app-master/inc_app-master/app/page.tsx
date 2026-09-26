"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { Header } from "@/components/header";
import { HeroSection } from "@/components/hero-section";
import { FeaturesSection } from "@/components/features-section";
import { PricingSection } from "@/components/pricing-section";
import { CtaSection } from "@/components/cta-section";
import { Footer } from "@/components/footer";
import { Orb } from "@/components/orb";

export default function Home() {
  const router = useRouter();

  useEffect(() => {
    const token = window.localStorage.getItem("authToken");
    if (token) {
      router.replace("/dashboard");
    }
  }, [router]);


  return (
    <main className="min-h-screen bg-background text-foreground overflow-x-hidden">
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div
          className="absolute inset-0 opacity-[0.04] dark:opacity-[0.03]"
          style={{
            backgroundImage:
              "radial-gradient(circle at 1px 1px, oklch(0.5 0 0 / 0.15) 1px, transparent 0)",
            backgroundSize: "40px 40px",
          }}
        />
        <Orb className="w-150 h-150 -top-48 -left-48 bg-sky-500" />
        <Orb className="w-125 h-125 top-1/2 -right-32 bg-violet-500" />
        <Orb className="w-100 h-100 -bottom-32 left-1/3 bg-emerald-500" />
        <div className="absolute top-0 left-0 right-0 h-150 bg-linear-to-b from-sky-500/5 via-transparent to-transparent" />
      </div>

      <div className="relative">
        <Header />
        <HeroSection />
        <FeaturesSection />
        <PricingSection />
        <CtaSection />
        <Footer />
      </div>
    </main>
  );
}
