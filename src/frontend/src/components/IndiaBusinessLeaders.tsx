const INDIA_LEADERS = [
  {
    name: "Mukesh Ambani",
    company: "Reliance Industries",
    companyUrl: "https://www.ril.com",
    flag: "🇮🇳",
    netWorth: "$99.7B – $116B",
    description:
      "Chairman of Reliance Industries, with dominant interests in petrochemicals, telecom (Jio), and retail across India.",
    quote:
      "GlobalInvest gives Indian investors world-class access to international real estate — a platform built for the next decade.",
    photo: "/assets/generated/mukesh-ambani.dim_400x400.jpg",
  },
  {
    name: "Gautam Adani",
    company: "Adani Group",
    companyUrl: "https://www.adani.com",
    flag: "🇮🇳",
    netWorth: "$63.8B – $92B",
    description:
      "Founder of Adani Group, focusing on infrastructure, ports, power generation, and green energy at massive scale.",
    quote:
      "Infrastructure and real estate are the backbone of any economy. GlobalInvest connects both worlds seamlessly.",
    photo: "/assets/generated/gautam-adani.dim_400x400.jpg",
  },
  {
    name: "Savitri Jindal & Family",
    company: "O.P. Jindal Group",
    companyUrl: "https://www.opjindal.com",
    flag: "🇮🇳",
    netWorth: "$39.1B – $40.2B",
    description:
      "Chairperson of O.P. Jindal Group, with major interests in steel, power, and cement — a pillar of Indian industry.",
    quote:
      "Solid foundations are everything in business and in property. GlobalInvest is that foundation for global investors.",
    photo: "/assets/generated/savitri-jindal.dim_400x400.jpg",
  },
  {
    name: "Shiv Nadar",
    company: "HCL Technologies",
    companyUrl: "https://www.hcltech.com",
    flag: "🇮🇳",
    netWorth: "$30.9B – $36.9B",
    description:
      "Founder of HCL Technologies, a global leader in IT services and software serving enterprises worldwide.",
    quote:
      "Technology is the great equalizer. GlobalInvest uses it to level the playing field in global real estate.",
    photo: "/assets/generated/shiv-nadar.dim_400x400.jpg",
  },
  {
    name: "Lakshmi Mittal",
    company: "ArcelorMittal",
    companyUrl: "https://corporate.arcelormittal.com",
    flag: "🇮🇳",
    netWorth: "$16.4B – $31B",
    description:
      "Executive Chairman of ArcelorMittal, the world's leading steel and mining company operating across 60 countries.",
    quote:
      "Global ambition requires global platforms. GlobalInvest is exactly the kind of borderless solution the world needs.",
    photo: "/assets/generated/lakshmi-mittal.dim_400x400.jpg",
  },
  {
    name: "Cyrus Poonawalla",
    company: "Serum Institute of India",
    companyUrl: "https://www.seruminstitute.com",
    flag: "🇮🇳",
    netWorth: "$21.3B – $27B",
    description:
      "Founder of the Serum Institute of India, the world's largest vaccine manufacturer by volume.",
    quote:
      "Investment in real estate is investment in humanity's future. GlobalInvest makes that future accessible to all.",
    photo: "/assets/generated/cyrus-poonawalla.dim_400x400.jpg",
  },
  {
    name: "Dilip Shanghvi",
    company: "Sun Pharmaceutical Industries",
    companyUrl: "https://www.sunpharma.com",
    flag: "🇮🇳",
    netWorth: "$25.6B – $26.7B",
    description:
      "Founder of Sun Pharmaceutical Industries, India's largest and the world's fourth-largest generic drug manufacturer.",
    quote:
      "Discipline and vision built my company. GlobalInvest brings that same discipline to international property markets.",
    photo: "/assets/generated/dilip-shanghvi.dim_400x400.jpg",
  },
  {
    name: "Kumar Mangalam Birla",
    company: "Aditya Birla Group",
    companyUrl: "https://www.adityabirla.com",
    flag: "🇮🇳",
    netWorth: "$19.7B – $21.1B",
    description:
      "Chairman of the Aditya Birla Group, with interests in metals, cement, financial services, and textiles across 36 countries.",
    quote:
      "A truly global conglomerate needs globally intelligent investment tools. GlobalInvest delivers on that promise.",
    photo: "/assets/generated/kumar-mangalam-birla.dim_400x400.jpg",
  },
  {
    name: "Radhakishan Damani",
    company: "DMart / Avenue Supermarts",
    companyUrl: "https://www.dmartindia.com",
    flag: "🇮🇳",
    netWorth: "$15.7B – $17.6B",
    description:
      "Founder of DMart (Avenue Supermarts), India's most profitable retail chain, known for disciplined long-term thinking.",
    quote:
      "Value investing is about patience and trust. GlobalInvest has earned both in the international property space.",
    photo: "/assets/generated/radhakishan-damani.dim_400x400.jpg",
  },
  {
    name: "Sunil Mittal & Family",
    company: "Bharti Enterprises / Airtel",
    companyUrl: "https://www.bharti.com",
    flag: "🇮🇳",
    netWorth: "$9.2B – $13.6B",
    description:
      "Chairman of Bharti Enterprises, which owns Bharti Airtel, one of the world's largest telecommunications companies.",
    quote:
      "Connectivity changed how billions live. GlobalInvest is doing the same for how the world buys and sells property.",
    photo: "/assets/generated/sunil-mittal.dim_400x400.jpg",
  },
];

export function IndiaBusinessLeaders() {
  return (
    <section
      className="py-20 bg-gradient-to-b from-slate-950 to-slate-900"
      aria-label="India business titans support"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-14">
          <span className="inline-block text-xs font-bold tracking-widest uppercase text-primary mb-3 px-3 py-1 bg-primary/10 rounded-full">
            🇮🇳 India's Business Titans
          </span>
          <h2 className="font-display text-3xl md:text-4xl font-bold text-white mb-2">
            Endorsed by India's Wealthiest Leaders
          </h2>
          <span className="block w-12 h-0.5 rounded-full bg-primary mx-auto mt-3 mb-5" />
          <p className="text-white/55 max-w-2xl mx-auto text-sm">
            India's most powerful industrialists and entrepreneurs trust
            GlobalInvest as the platform for cross-border real estate
            investment.
          </p>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
          {INDIA_LEADERS.map((leader) => (
            <div
              key={leader.name}
              className="group relative rounded-2xl overflow-hidden shadow-card-lg cursor-default transition-shadow duration-300 hover:shadow-card-hover"
              style={{ minHeight: 400 }}
            >
              <div
                className="absolute inset-0 bg-cover bg-center transition-transform duration-700 ease-out group-hover:scale-[1.08]"
                style={{ backgroundImage: `url('${leader.photo}')` }}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/95 via-black/55 to-transparent" />
              <div className="absolute inset-0 bg-gradient-to-b from-black/20 to-transparent" />
              <div className="relative z-10 h-full flex flex-col justify-end p-5">
                <div className="mb-2.5 flex items-center gap-2 flex-wrap">
                  <span className="text-lg">{leader.flag}</span>
                  <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-amber-400/90 text-amber-950 shadow-sm">
                    {leader.netWorth}
                  </span>
                </div>
                <h3 className="font-display text-white font-bold text-base leading-tight mb-0.5">
                  {leader.name}
                </h3>
                <a
                  href={leader.companyUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-primary/90 text-xs font-semibold hover:text-primary hover:underline mb-2 inline-block transition-colors"
                >
                  {leader.company} ↗
                </a>
                <p className="text-white/65 text-xs leading-relaxed line-clamp-2 mb-3">
                  {leader.description}
                </p>
                <div className="leader-quote-wrap">
                  <div className="leader-quote-inner">
                    <p className="text-white/90 text-xs italic border-l-2 border-primary pl-3 leading-relaxed pt-1 pb-2">
                      &ldquo;{leader.quote}&rdquo;
                    </p>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
