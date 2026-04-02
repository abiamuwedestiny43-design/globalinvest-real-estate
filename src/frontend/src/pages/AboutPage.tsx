import { GlobalBusinessLeaders } from "@/components/GlobalBusinessLeaders";
import { IndiaBusinessLeaders } from "@/components/IndiaBusinessLeaders";
import { MiddleEastBusinessLeaders } from "@/components/MiddleEastBusinessLeaders";
import { QatariBusinessLeaders } from "@/components/QatariBusinessLeaders";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useActor } from "@/hooks/useActor";
import { useInternetIdentity } from "@/hooks/useInternetIdentity";
import { motion } from "motion/react";
import { useState } from "react";
import { toast } from "sonner";

const PARTNERS = [
  {
    initials: "MA",
    name: "Mukesh Ambani",
    netWorth: "$95–100B",
    country: "India",
    company: "Reliance Industries",
    tagline: "Chairman dominating petrochemicals, telecom, and retail.",
    flag: "🇮🇳",
    photo: "/assets/generated/billionaire-mukesh-ambani.dim_120x120.jpg",
    companyUrl: "https://www.ril.com",
    quote:
      "Real estate is the foundation of lasting wealth and national progress.",
  },
  {
    initials: "GA",
    name: "Gautam Adani",
    netWorth: "$85–90B",
    country: "India",
    company: "Adani Group",
    tagline:
      "Founder with vast interests in infrastructure, ports, and green energy.",
    flag: "🇮🇳",
    photo: "/assets/generated/billionaire-gautam-adani.dim_120x120.jpg",
    companyUrl: "https://www.adani.com",
    quote:
      "Infrastructure and property are the backbone of every growing economy.",
  },
  {
    initials: "ZS",
    name: "Zhong Shanshan",
    netWorth: "$60–65B",
    country: "China",
    company: "Nongfu Spring",
    tagline: "Known for bottled water giant Nongfu Spring and vaccines.",
    flag: "🇨🇳",
    photo: "/assets/generated/billionaire-zhong-shanshan.dim_120x120.jpg",
    companyUrl: "https://www.nongfuspring.com",
    quote:
      "Quality assets, like quality water, sustain civilizations for centuries.",
  },
  {
    initials: "TY",
    name: "Tadashi Yanai",
    netWorth: "$45–50B",
    country: "Japan",
    company: "Fast Retailing (Uniqlo)",
    tagline:
      "Founder of Fast Retailing, parent of global fashion brand Uniqlo.",
    flag: "🇯🇵",
    photo: "/assets/generated/billionaire-tadashi-yanai.dim_120x120.jpg",
    companyUrl: "https://www.fastretailing.com",
    quote:
      "Global markets reward those who think beyond borders and invest boldly.",
  },
  {
    initials: "MH",
    name: "Ma Huateng",
    netWorth: "$40–45B",
    country: "China",
    company: "Tencent",
    tagline: "Founder of Tencent, the company behind WeChat and gaming.",
    flag: "🇨🇳",
    photo: "/assets/generated/billionaire-ma-huateng.dim_120x120.jpg",
    companyUrl: "https://www.tencent.com",
    quote:
      "Digital platforms will reshape how the world buys and sells property.",
  },
  {
    initials: "WD",
    name: "William Lei Ding",
    netWorth: "$38–42B",
    country: "China",
    company: "NetEase",
    tagline:
      "Founder of NetEase, a leading online gaming and internet company.",
    flag: "🇨🇳",
    photo: "/assets/generated/billionaire-william-ding.dim_120x120.jpg",
    companyUrl: "https://ir.netease.com",
    quote:
      "Smart technology and real estate together unlock extraordinary value.",
  },
  {
    initials: "ZY",
    name: "Zhang Yiming",
    netWorth: "$35–40B",
    country: "China",
    company: "ByteDance",
    tagline: "Founder of ByteDance, the company behind TikTok.",
    flag: "🇨🇳",
    photo: "/assets/generated/billionaire-zhang-yiming.dim_120x120.jpg",
    companyUrl: "https://www.bytedance.com",
    quote:
      "Data and innovation will define the next generation of real estate.",
  },
  {
    initials: "LK",
    name: "Li Ka-shing",
    netWorth: "$33–36B",
    country: "Hong Kong",
    company: "CK Hutchison",
    tagline: "Senior tycoon with diverse, legacy investments across the globe.",
    flag: "🇭🇰",
    photo: "/assets/generated/billionaire-li-ka-shing.dim_120x120.jpg",
    companyUrl: "https://www.ckhh.com",
    quote: "Patient capital in prime real estate always finds its reward.",
  },
  {
    initials: "CH",
    name: "Colin Huang",
    netWorth: "$30–33B",
    country: "China",
    company: "PDD Holdings",
    tagline: "Founder of PDD Holdings, parent of Pinduoduo and Temu.",
    flag: "🇨🇳",
    photo: "/assets/generated/billionaire-colin-huang.dim_120x120.jpg",
    companyUrl: "https://investor.pddholdings.com",
    quote:
      "Connecting buyers and sellers efficiently creates immense value for all.",
  },
  {
    initials: "JM",
    name: "Jack Ma",
    netWorth: "$28–30B",
    country: "China",
    company: "Alibaba Group",
    tagline: "Founder of Alibaba Group — e-commerce, fintech, and cloud.",
    flag: "🇨🇳",
    photo: "/assets/generated/billionaire-jack-ma.dim_120x120.jpg",
    companyUrl: "https://www.alibabagroup.com",
    quote: "The future of real estate is transparent, borderless, and digital.",
  },
];

const FAQ_ITEMS = [
  {
    q: "How do I list my property on GlobalInvest?",
    a: "Sign up as an Agent, complete identity verification, and use the Agent Portal to create your listing. Listings are reviewed and published within 24 hours of approval.",
  },
  {
    q: "What is the verification process for agents?",
    a: "All agents undergo a three-step verification: government ID check, face/selfie match, and professional license validation. A verified badge is displayed on approved profiles.",
  },
  {
    q: "Which currencies are supported?",
    a: "We currently support USD, EUR, GBP, AED, and JPY. Prices are stored in the listing currency and converted in real-time for display. More currencies are planned.",
  },
  {
    q: "How can buyers contact an agent?",
    a: "Each property detail page has a Contact Agent button and a Schedule a Viewing form. Messages are delivered directly to the agent's portal and email.",
  },
  {
    q: "Is GlobalInvest available worldwide?",
    a: "Yes! We operate in 50+ countries. Our platform supports multi-language enquiries and cross-border transactions, making it truly global.",
  },
];

const STATS = [
  { value: "50+", label: "Countries" },
  { value: "12k+", label: "Listings" },
  { value: "3.4k+", label: "Verified Agents" },
  { value: "$2.1B+", label: "Transactions" },
];

function PartnerAvatar({
  photo,
  initials,
  name,
}: {
  photo: string;
  initials: string;
  name: string;
}) {
  const [imgFailed, setImgFailed] = useState(false);
  if (imgFailed) {
    return (
      <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mb-3">
        <span className="font-bold text-primary text-sm">{initials}</span>
      </div>
    );
  }
  return (
    <img
      src={photo}
      alt={name}
      className="w-16 h-16 rounded-full object-cover mb-3"
      onError={() => setImgFailed(true)}
    />
  );
}

export default function AboutPage() {
  // Legacy contact form state
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [submitted, setSubmitted] = useState(false);

  // Support ticket form state
  const [ticketEmail, setTicketEmail] = useState("");
  const [ticketSubject, setTicketSubject] = useState("");
  const [ticketMessage, setTicketMessage] = useState("");
  const [ticketSubmitting, setTicketSubmitting] = useState(false);
  const [ticketSubmitted, setTicketSubmitted] = useState(false);

  const { identity } = useInternetIdentity();
  const { actor } = useActor();

  function handleContact(e: React.FormEvent) {
    e.preventDefault();
    setSubmitted(true);
    toast.success("Message sent! We'll get back to you within 24 hours.");
  }

  async function handleTicketSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!actor) return;
    setTicketSubmitting(true);
    try {
      await (actor as any).createSupportTicket(
        ticketSubject,
        ticketMessage,
        ticketEmail,
      );
      setTicketSubmitted(true);
      toast.success("Your support ticket has been submitted.");
    } catch {
      toast.error("Failed to submit your support ticket. Please try again.");
    } finally {
      setTicketSubmitting(false);
    }
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Hero */}
      <section className="relative bg-secondary text-secondary-foreground py-24 overflow-hidden">
        <div
          className="absolute inset-0 opacity-10"
          style={{
            backgroundImage:
              "url('/assets/generated/hero-skyline.dim_1600x900.jpg')",
            backgroundSize: "cover",
            backgroundPosition: "center",
          }}
        />
        <div className="container mx-auto px-4 max-w-4xl relative z-10 text-center">
          <motion.p
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-accent text-sm font-semibold tracking-widest uppercase mb-3"
          >
            About Us
          </motion.p>
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="font-serif text-5xl font-bold mb-5 leading-tight"
          >
            Connecting the World Through Real Estate
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-secondary-foreground/70 text-lg max-w-2xl mx-auto"
          >
            GlobalInvest is a decentralized real estate marketplace built on the
            Internet Computer — bringing transparency, security, and global
            reach to property transactions.
          </motion.p>
        </div>
      </section>

      {/* Stats */}
      <section className="border-b border-border">
        <div className="container mx-auto px-4 max-w-4xl">
          <div className="grid grid-cols-2 md:grid-cols-4 divide-x divide-border">
            {STATS.map((s) => (
              <div key={s.label} className="py-8 text-center">
                <p className="font-serif text-3xl font-bold text-primary">
                  {s.value}
                </p>
                <p className="text-sm text-muted-foreground mt-1">{s.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Mission */}
      <section className="container mx-auto px-4 py-20 max-w-4xl">
        <div className="grid md:grid-cols-2 gap-12 items-center">
          <div>
            <p className="text-accent text-sm font-semibold tracking-wider uppercase mb-2">
              Our Mission
            </p>
            <h2 className="font-serif text-3xl font-bold mb-4">
              Democratizing Global Real Estate
            </h2>
            <p className="text-muted-foreground leading-relaxed mb-4">
              We believe that anyone, anywhere, should be able to invest in real
              estate with confidence. Our platform removes barriers through
              verified agents, transparent pricing in multiple currencies, and
              on-chain transaction records.
            </p>
            <p className="text-muted-foreground leading-relaxed">
              Built on the Internet Computer Protocol, GlobalInvest ensures
              every listing, inquiry, and transaction is tamper-proof and
              auditable — giving buyers and sellers unprecedented peace of mind.
            </p>
          </div>
          <div className="grid grid-cols-2 gap-4">
            {[
              {
                icon: "🌍",
                title: "Global Reach",
                desc: "50+ countries, 12k+ listings",
              },
              {
                icon: "🔒",
                title: "Verified Agents",
                desc: "3-step KYC process",
              },
              {
                icon: "💱",
                title: "Multi-Currency",
                desc: "USD, EUR, GBP, AED, JPY",
              },
              {
                icon: "⛓️",
                title: "On-Chain",
                desc: "ICP-powered transparency",
              },
            ].map((item) => (
              <div
                key={item.title}
                className="bg-card border border-border rounded-xl p-4"
              >
                <p className="text-2xl mb-2">{item.icon}</p>
                <p className="font-semibold text-sm">{item.title}</p>
                <p className="text-xs text-muted-foreground mt-0.5">
                  {item.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Global Supporters */}
      <section className="bg-muted/30 py-20">
        <div className="container mx-auto px-4 max-w-6xl">
          <div className="text-center mb-12">
            <p className="text-accent text-sm font-semibold tracking-wider uppercase mb-2">
              Global Supporters
            </p>
            <h2 className="font-serif text-3xl font-bold">
              Asia's Wealthiest Business Leaders
            </h2>
            <p className="text-muted-foreground mt-3 max-w-xl mx-auto">
              GlobalInvest is backed and supported by some of Asia's most
              influential entrepreneurs and industry titans.
            </p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {PARTNERS.map((p) => (
              <div
                key={p.name}
                className="bg-card border border-border rounded-xl p-6 hover:shadow-md transition-shadow"
              >
                <div className="flex items-center gap-1.5 mb-3">
                  <span className="text-base">{p.flag}</span>
                  <span className="text-xs text-muted-foreground font-medium">
                    {p.country}
                  </span>
                </div>
                <PartnerAvatar
                  photo={p.photo}
                  initials={p.initials}
                  name={p.name}
                />
                <p className="font-semibold leading-snug">{p.name}</p>
                <a
                  href={p.companyUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs text-accent font-medium mt-0.5 mb-2 inline-block hover:underline"
                >
                  {p.company} ↗
                </a>
                <span className="block bg-muted text-muted-foreground text-xs px-2 py-0.5 rounded-full mb-3 w-fit">
                  {p.netWorth}
                </span>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {p.tagline}
                </p>
                <blockquote className="mt-3 pl-3 border-l-2 border-accent/50 italic text-xs text-muted-foreground/80 leading-relaxed">
                  {p.quote}
                </blockquote>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="container mx-auto px-4 py-20 max-w-3xl">
        <div className="text-center mb-10">
          <p className="text-accent text-sm font-semibold tracking-wider uppercase mb-2">
            FAQ
          </p>
          <h2 className="font-serif text-3xl font-bold">Common Questions</h2>
        </div>
        <div className="bg-card border border-border rounded-2xl overflow-hidden">
          <Accordion
            type="single"
            collapsible
            className="divide-y divide-border"
          >
            {FAQ_ITEMS.map((item, i) => (
              <AccordionItem
                key={item.q}
                value={`faq-${i}`}
                className="border-0"
              >
                <AccordionTrigger className="px-6 py-4 text-left font-medium hover:no-underline hover:bg-muted/50">
                  {item.q}
                </AccordionTrigger>
                <AccordionContent className="px-6 pb-5 text-muted-foreground">
                  {item.a}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>
      </section>

      {/* Contact Support Ticket */}
      <section className="container mx-auto px-4 py-20 max-w-2xl">
        <div className="text-center mb-10">
          <p className="text-accent text-sm font-semibold tracking-wider uppercase mb-2">
            Need Help?
          </p>
          <h2 className="font-serif text-3xl font-bold">Contact Support</h2>
          <p className="text-muted-foreground mt-2">
            Submit a support ticket and our team will get back to you within 24
            hours.
          </p>
        </div>

        {!identity ? (
          <div
            className="bg-card border border-border rounded-2xl p-10 text-center"
            data-ocid="about.support.panel"
          >
            <p className="text-4xl mb-4">🔒</p>
            <h3 className="font-serif text-lg font-semibold mb-2">
              Login Required
            </h3>
            <p className="text-muted-foreground text-sm">
              Please log in to submit a support ticket.
            </p>
          </div>
        ) : ticketSubmitted ? (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-card border border-border rounded-2xl p-10 text-center"
            data-ocid="about.support.success_state"
          >
            <p className="text-5xl mb-4">✅</p>
            <h3 className="font-serif text-xl font-semibold mb-2">
              Ticket Submitted!
            </h3>
            <p className="text-muted-foreground">
              Your support ticket has been submitted. We'll get back to you
              within 24 hours.
            </p>
            <Button
              variant="outline"
              className="mt-6"
              onClick={() => {
                setTicketSubmitted(false);
                setTicketEmail("");
                setTicketSubject("");
                setTicketMessage("");
              }}
              data-ocid="about.support.reset.button"
            >
              Submit Another
            </Button>
          </motion.div>
        ) : (
          <form
            onSubmit={handleTicketSubmit}
            className="bg-card border border-border rounded-2xl p-8 space-y-5"
            data-ocid="about.support.panel"
          >
            <div>
              <Label htmlFor="support-email">Email Address</Label>
              <Input
                id="support-email"
                type="email"
                value={ticketEmail}
                onChange={(e) => setTicketEmail(e.target.value)}
                required
                placeholder="you@example.com"
                className="mt-1"
                data-ocid="about.support.email.input"
              />
            </div>
            <div>
              <Label htmlFor="support-subject">Subject</Label>
              <Input
                id="support-subject"
                value={ticketSubject}
                onChange={(e) => setTicketSubject(e.target.value)}
                required
                placeholder="Brief description of your issue"
                className="mt-1"
                data-ocid="about.support.subject.input"
              />
            </div>
            <div>
              <Label htmlFor="support-message">Message</Label>
              <Textarea
                id="support-message"
                value={ticketMessage}
                onChange={(e) => setTicketMessage(e.target.value)}
                required
                placeholder="Describe your issue in detail..."
                rows={5}
                className="mt-1"
                data-ocid="about.support.message.textarea"
              />
            </div>
            <Button
              type="submit"
              disabled={ticketSubmitting}
              className="w-full bg-accent text-accent-foreground hover:opacity-90"
              data-ocid="about.support.submit.button"
            >
              {ticketSubmitting ? "Submitting..." : "Submit Support Ticket"}
            </Button>
          </form>
        )}
      </section>

      {/* Contact Form (legacy general enquiry) */}
      <section className="container mx-auto px-4 py-20 max-w-2xl">
        <div className="text-center mb-10">
          <p className="text-accent text-sm font-semibold tracking-wider uppercase mb-2">
            Get in Touch
          </p>
          <h2 className="font-serif text-3xl font-bold">General Enquiry</h2>
          <p className="text-muted-foreground mt-2">
            Have a question or need help? Our team typically responds within 24
            hours.
          </p>
        </div>

        {submitted ? (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-card border border-border rounded-2xl p-10 text-center"
            data-ocid="about.contact.success_state"
          >
            <p className="text-5xl mb-4">✅</p>
            <h3 className="font-serif text-xl font-semibold mb-2">
              Message Sent!
            </h3>
            <p className="text-muted-foreground">
              Thanks for reaching out. We'll get back to you within 24 hours.
            </p>
            <Button
              variant="outline"
              className="mt-6"
              onClick={() => setSubmitted(false)}
              data-ocid="about.contact.reset.button"
            >
              Send Another
            </Button>
          </motion.div>
        ) : (
          <form
            onSubmit={handleContact}
            className="bg-card border border-border rounded-2xl p-8 space-y-5"
            data-ocid="about.contact.panel"
          >
            <div>
              <Label htmlFor="contact-name">Full Name</Label>
              <Input
                id="contact-name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                placeholder="Your name"
                className="mt-1"
                data-ocid="about.contact.name.input"
              />
            </div>
            <div>
              <Label htmlFor="contact-email">Email Address</Label>
              <Input
                id="contact-email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                placeholder="you@example.com"
                className="mt-1"
                data-ocid="about.contact.email.input"
              />
            </div>
            <div>
              <Label htmlFor="contact-message">Message</Label>
              <Textarea
                id="contact-message"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                required
                placeholder="How can we help you?"
                rows={5}
                className="mt-1"
                data-ocid="about.contact.message.textarea"
              />
            </div>
            <Button
              type="submit"
              className="w-full bg-accent text-accent-foreground hover:opacity-90"
              data-ocid="about.contact.submit.button"
            >
              Send Message
            </Button>
          </form>
        )}
      </section>
      <GlobalBusinessLeaders />
      <IndiaBusinessLeaders />
      <MiddleEastBusinessLeaders />
      <QatariBusinessLeaders />
    </div>
  );
}
