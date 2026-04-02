import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Link } from "@tanstack/react-router";
import { Globe, ShieldCheck, TrendingUp, Upload } from "lucide-react";
import { motion } from "motion/react";

const FEATURES = [
  {
    icon: Upload,
    title: "List in Minutes",
    desc: "Upload property details, images, and documents in a simple guided flow.",
  },
  {
    icon: Globe,
    title: "Global Reach",
    desc: "Reach verified buyers across 150+ countries on one trusted platform.",
  },
  {
    icon: ShieldCheck,
    title: "Verified Buyers",
    desc: "Every buyer is ID-verified and pre-qualified before they contact you.",
  },
];

const STATS = [
  { value: "10,000+", label: "Properties Listed" },
  { value: "150+", label: "Countries" },
  { value: "98%", label: "Seller Satisfaction" },
];

export default function SellerHomePage() {
  return (
    <div className="flex flex-col">
      {/* Hero */}
      <section
        className="relative min-h-[92vh] flex items-center justify-center overflow-hidden"
        aria-label="Seller hero"
        data-ocid="seller.hero.section"
      >
        {/* Background */}
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{
            backgroundImage:
              "url('https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=1920&q=80')",
          }}
          role="presentation"
        />
        {/* Gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-br from-black/80 via-black/60 to-[oklch(0.22_0.06_220)]/70" />

        {/* Content */}
        <div className="relative z-10 container mx-auto px-4 text-center text-white">
          <motion.div
            initial={{ opacity: 0, y: 32 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="max-w-3xl mx-auto"
          >
            <span className="inline-block mb-4 px-4 py-1.5 rounded-full bg-white/10 border border-white/20 text-sm font-medium tracking-wide backdrop-blur-sm">
              Seller Platform — GlobalInvest
            </span>
            <h1 className="font-display text-5xl md:text-7xl font-bold leading-tight mb-6">
              Sell Your Property{" "}
              <span className="italic text-[oklch(0.78_0.14_175)]">
                with Confidence
              </span>
            </h1>
            <p className="text-lg md:text-xl text-white/80 mb-10 max-w-xl mx-auto">
              Reach verified global buyers. List in minutes. Get the best price.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link to="/login">
                <Button
                  size="lg"
                  className="px-8 py-6 text-base bg-primary text-primary-foreground hover:bg-primary/90 rounded-full shadow-lg"
                  data-ocid="seller.signin.primary_button"
                >
                  Sign In to Sell
                </Button>
              </Link>
              <Link to="/signup">
                <Button
                  size="lg"
                  variant="outline"
                  className="px-8 py-6 text-base border-white text-white hover:bg-white/10 rounded-full backdrop-blur-sm"
                  data-ocid="seller.create_account.secondary_button"
                >
                  Create Seller Account
                </Button>
              </Link>
            </div>
          </motion.div>
        </div>

        {/* Scroll cue */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 animate-bounce">
          <div className="w-6 h-10 rounded-full border-2 border-white/40 flex items-start justify-center pt-1.5">
            <div className="w-1 h-2 bg-white/60 rounded-full" />
          </div>
        </div>
      </section>

      {/* Feature cards */}
      <section
        className="py-20 bg-background"
        aria-label="Platform features"
        data-ocid="seller.features.section"
      >
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center mb-12"
          >
            <h2 className="font-display text-3xl md:text-4xl font-bold text-foreground mb-3">
              Why Sell on GlobalInvest?
            </h2>
            <p className="text-muted-foreground max-w-lg mx-auto">
              A platform built for serious sellers who want results, not just
              listings.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {FEATURES.map(({ icon: Icon, title, desc }, i) => (
              <motion.div
                key={title}
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: i * 0.12 }}
              >
                <Card className="h-full border-border hover:shadow-lg transition-shadow duration-300 group">
                  <CardContent className="p-8 flex flex-col items-start gap-4">
                    <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 transition-colors">
                      <Icon className="w-6 h-6 text-primary" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-lg mb-1">{title}</h3>
                      <p className="text-muted-foreground text-sm leading-relaxed">
                        {desc}
                      </p>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Stats bar */}
      <section
        className="py-14 bg-muted/50 border-y border-border"
        aria-label="Platform statistics"
        data-ocid="seller.stats.section"
      >
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-8 text-center">
            {STATS.map(({ value, label }, i) => (
              <motion.div
                key={label}
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: i * 0.1 }}
              >
                <p className="font-display text-4xl font-bold text-primary mb-1">
                  {value}
                </p>
                <p className="text-muted-foreground text-sm font-medium">
                  {label}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="py-20 bg-background">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center mb-14"
          >
            <h2 className="font-display text-3xl md:text-4xl font-bold mb-3">
              How It Works
            </h2>
            <p className="text-muted-foreground">
              From listing to sold in three simple steps.
            </p>
          </motion.div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-10 relative">
            {[
              {
                step: "01",
                title: "Create Your Account",
                desc: "Sign up as a seller and verify your identity to get started.",
              },
              {
                step: "02",
                title: "Upload Your Property",
                desc: "Add photos, pricing, and property details in minutes.",
              },
              {
                step: "03",
                title: "Connect with Buyers",
                desc: "Receive inquiries from verified global buyers and close deals.",
              },
            ].map(({ step, title, desc }, i) => (
              <motion.div
                key={step}
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: i * 0.15 }}
                className="flex flex-col items-center text-center"
              >
                <div className="w-14 h-14 rounded-2xl bg-primary text-primary-foreground flex items-center justify-center font-display text-xl font-bold mb-5 shadow-md">
                  {step}
                </div>
                <h3 className="font-semibold text-lg mb-2">{title}</h3>
                <p className="text-muted-foreground text-sm leading-relaxed">
                  {desc}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Bottom CTA */}
      <section
        className="py-20 bg-gradient-to-br from-primary to-[oklch(0.36_0.12_220)] text-primary-foreground"
        aria-label="Call to action"
        data-ocid="seller.cta.section"
      >
        <div className="container mx-auto px-4 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <TrendingUp className="w-12 h-12 mx-auto mb-5 opacity-80" />
            <h2 className="font-display text-3xl md:text-5xl font-bold mb-4">
              Ready to sell?
            </h2>
            <p className="text-primary-foreground/80 text-lg mb-8 max-w-lg mx-auto">
              Join thousands of sellers on GlobalInvest and reach buyers
              worldwide.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link to="/signup">
                <Button
                  size="lg"
                  className="px-10 py-6 text-base bg-white text-primary hover:bg-white/90 rounded-full font-semibold shadow-lg"
                  data-ocid="seller.cta.primary_button"
                >
                  Get Started Free
                </Button>
              </Link>
              <Link to="/login">
                <Button
                  size="lg"
                  variant="outline"
                  className="px-10 py-6 text-base border-white/60 text-white hover:bg-white/10 rounded-full"
                  data-ocid="seller.cta.secondary_button"
                >
                  Sign In
                </Button>
              </Link>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  );
}
