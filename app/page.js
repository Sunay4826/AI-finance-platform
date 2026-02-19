import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import {
  featuresData,
  howItWorksData,
  statsData,
} from "@/data/landing";
import HeroSection from "@/components/hero";

const LandingPage = () => {
  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Hero Section */}
      <HeroSection />

      {/* Stats Section */}
      <section className="py-10 md:py-14">
        <div className="container mx-auto px-4">
          <div className="section-soft p-6 md:p-8">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 md:gap-8">
            {statsData.map((stat, index) => (
              <div key={index} className="text-center">
                <div className="text-3xl md:text-4xl font-semibold text-teal-800 dark:text-teal-300 mb-2">
                  {stat.value}
                </div>
                <div className="text-sm md:text-base text-slate-600 dark:text-slate-300">{stat.label}</div>
              </div>
            ))}
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-14 md:py-16">
        <div className="container mx-auto px-4">
          <h2 className="text-2xl md:text-3xl font-semibold text-center mb-10 md:mb-12 text-foreground">
            Everything you need to manage your finances
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {featuresData.map((feature, index) => (
              <Card className="panel p-5 h-[240px]" key={index}>
                <CardContent className="space-y-3 pt-2 h-full">
                  {feature.icon}
                  <h3 className="text-lg md:text-xl font-semibold text-foreground">{feature.title}</h3>
                  <p className="text-sm md:text-base text-slate-600 dark:text-slate-300">{feature.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section id="how-it-works" className="py-14 md:py-16">
        <div className="container mx-auto px-4">
          <div className="section-soft p-8 md:p-10">
            <h2 className="text-2xl md:text-3xl font-semibold text-center mb-12 md:mb-14 text-foreground">How It Works</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
            {howItWorksData.map((step, index) => (
              <div key={index} className="text-center">
                <div className="w-16 h-16 bg-teal-100 dark:bg-teal-500/20 rounded-full flex items-center justify-center mx-auto mb-6">
                  {step.icon}
                </div>
                <h3 className="text-xl font-semibold mb-4 text-foreground">{step.title}</h3>
                <p className="text-base md:text-lg text-slate-600 dark:text-slate-300">{step.description}</p>
              </div>
            ))}
            </div>
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="py-14 md:py-20">
        <div className="container mx-auto px-4">
          <h2 className="text-2xl md:text-3xl font-semibold text-center mb-10 md:mb-12 text-foreground">Pricing</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <Card className="panel p-5">
              <CardContent className="pt-2">
                <h3 className="text-xl font-semibold mb-1 text-foreground">Starter</h3>
                <p className="text-3xl font-bold mb-3 text-foreground">Free</p>
                <ul className="text-sm md:text-base text-slate-600 dark:text-slate-300 space-y-1.5">
                  <li>Up to 100 transactions/month</li>
                  <li>Manual receipt uploads</li>
                  <li>Basic analytics</li>
                </ul>
              </CardContent>
            </Card>
            <Card className="panel p-5">
              <CardContent className="pt-2">
                <h3 className="text-xl font-semibold mb-1 text-foreground">Pro</h3>
                <p className="text-3xl font-bold mb-3 text-foreground">$12/mo</p>
                <ul className="text-sm md:text-base text-slate-600 dark:text-slate-300 space-y-1.5">
                  <li>Unlimited transactions</li>
                  <li>AI receipt scanner</li>
                  <li>Advanced analytics</li>
                </ul>
              </CardContent>
            </Card>
            <Card className="panel p-5">
              <CardContent className="pt-2">
                <h3 className="text-xl font-semibold mb-1 text-foreground">Business</h3>
                <p className="text-3xl font-bold mb-3 text-foreground">$29/mo</p>
                <ul className="text-sm md:text-base text-slate-600 dark:text-slate-300 space-y-1.5">
                  <li>Team accounts</li>
                  <li>Priority support</li>
                  <li>Export & integrations</li>
                </ul>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Testimonials and CTA removed */}
    </div>
  );
};

export default LandingPage;
