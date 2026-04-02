const GLOBAL_LEADERS = [
  {
    name: "Elon Musk",
    company: "Tesla & SpaceX",
    companyUrl: "https://www.tesla.com",
    flag: "\uD83C\uDDFA\uD83C\uDDF8",
    netWorth: "$200B+",
    description:
      "Visionary entrepreneur transforming electric vehicles, space exploration, and sustainable energy for humanity.",
    quote:
      "GlobalInvest is the future of international real estate \u2014 transparent, borderless, and built for serious investors.",
    photo: "/assets/generated/elon-musk.dim_400x400.jpg",
  },
  {
    name: "Larry Page",
    company: "Alphabet / Google",
    companyUrl: "https://abc.xyz",
    flag: "\uD83C\uDDFA\uD83C\uDDF8",
    netWorth: "$110B+",
    description:
      "Co-founder of Google, now leading Alphabet\u2019s moonshot technologies including AI, self-driving cars, and health.",
    quote:
      "Data-driven platforms like GlobalInvest are redefining how the world discovers and acquires property assets.",
    photo: "/assets/generated/larry-page.dim_400x400.jpg",
  },
  {
    name: "Jeff Bezos",
    company: "Amazon",
    companyUrl: "https://www.amazon.com",
    flag: "\uD83C\uDDFA\uD83C\uDDF8",
    netWorth: "$170B+",
    description:
      "Founder of Amazon, the world\u2019s largest e-commerce and cloud platform, revolutionizing global commerce.",
    quote:
      "The real estate market needed a platform with Amazon-level trust and scale. GlobalInvest delivers exactly that.",
    photo: "/assets/generated/jeff-bezos.dim_400x400.jpg",
  },
  {
    name: "Sergey Brin",
    company: "Alphabet / Google",
    companyUrl: "https://abc.xyz",
    flag: "\uD83C\uDDFA\uD83C\uDDF8",
    netWorth: "$105B+",
    description:
      "Co-founder of Google, pioneering information access and innovative technology ventures worldwide.",
    quote:
      "A platform that indexes the global real estate market the way Google indexes the web. Truly transformational.",
    photo: "/assets/generated/sergey-brin.dim_400x400.jpg",
  },
  {
    name: "Mark Zuckerberg",
    company: "Meta / Facebook",
    companyUrl: "https://about.meta.com",
    flag: "\uD83C\uDDFA\uD83C\uDDF8",
    netWorth: "$170B+",
    description:
      "CEO of Meta, building the next generation of social connectivity, AR/VR, and the open metaverse.",
    quote:
      "Community and connectivity are at the heart of real estate. GlobalInvest brings that vision to property markets.",
    photo: "/assets/generated/mark-zuckerberg.dim_400x400.jpg",
  },
  {
    name: "Larry Ellison",
    company: "Oracle",
    companyUrl: "https://www.oracle.com",
    flag: "\uD83C\uDDFA\uD83C\uDDF8",
    netWorth: "$140B+",
    description:
      "Founder of Oracle Corporation, a global leader in enterprise database and cloud technology solutions.",
    quote:
      "Enterprise-grade technology meets global real estate. GlobalInvest\u2019s infrastructure is built to last.",
    photo: "/assets/generated/larry-ellison.dim_400x400.jpg",
  },
  {
    name: "Jensen Huang",
    company: "NVIDIA",
    companyUrl: "https://www.nvidia.com",
    flag: "\uD83C\uDDFA\uD83C\uDDF8",
    netWorth: "$90B+",
    description:
      "Founder and CEO of NVIDIA, the AI computing powerhouse driving the modern GPU and artificial intelligence revolution.",
    quote:
      "AI-powered real estate platforms are the next frontier. GlobalInvest is already there.",
    photo: "/assets/generated/jensen-huang.dim_400x400.jpg",
  },
  {
    name: "Michael Dell",
    company: "Dell Technologies",
    companyUrl: "https://www.dell.com",
    flag: "\uD83C\uDDFA\uD83C\uDDF8",
    netWorth: "$55B+",
    description:
      "Founder of Dell Technologies, pioneering direct-to-consumer computing and enterprise technology infrastructure.",
    quote:
      "Real estate investment deserves the same technological rigor as enterprise IT. GlobalInvest sets that standard.",
    photo: "/assets/generated/michael-dell.dim_400x400.jpg",
  },
  {
    name: "Rob Walton",
    company: "Walmart",
    companyUrl: "https://www.walmart.com",
    flag: "\uD83C\uDDFA\uD83C\uDDF8",
    netWorth: "$60B+",
    description:
      "Chairman emeritus of Walmart, the world\u2019s largest retailer, with a legacy of scaling commerce globally.",
    quote:
      "Scale, trust, and accessibility \u2014 GlobalInvest brings Walmart-style democratization to global real estate.",
    photo: "/assets/generated/rob-walton.dim_400x400.jpg",
  },
  {
    name: "Bernard Arnault",
    company: "LVMH Luxury Goods",
    companyUrl: "https://www.lvmh.com",
    flag: "\uD83C\uDDEB\uD83C\uDDF7",
    netWorth: "$155B+",
    description:
      "Chairman of LVMH, the world\u2019s largest luxury conglomerate, owning Louis Vuitton, Mo\u00ebt, and 70+ prestigious brands.",
    quote:
      "Luxury real estate demands a platform with the same prestige and precision as the finest brands. GlobalInvest is that platform.",
    photo: "/assets/generated/bernard-arnault.dim_400x400.jpg",
  },
];

export function GlobalBusinessLeaders() {
  return (
    <section
      className="py-24 bg-background"
      aria-label="Global business leaders support"
    >
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <p className="text-primary text-xs font-semibold tracking-widest uppercase mb-3">
            Business Leader Support
          </p>
          <h2 className="font-display text-3xl md:text-4xl font-bold mb-2">
            Trusted by Global Business Leaders
          </h2>
          <span className="section-accent-bar" />
          <p className="text-muted-foreground max-w-2xl mx-auto text-base mt-5">
            The world\u2019s most influential entrepreneurs and investors stand
            behind GlobalInvest\u2019s vision for transparent, borderless real
            estate.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-5">
          {GLOBAL_LEADERS.map((leader) => (
            <div
              key={leader.name}
              className="group relative rounded-2xl overflow-hidden shadow-card-lg cursor-default transition-shadow duration-300 hover:shadow-card-hover"
              style={{ minHeight: 400 }}
            >
              {/* Background photo */}
              <div
                className="absolute inset-0 bg-cover bg-center transition-transform duration-700 ease-out group-hover:scale-108"
                style={{ backgroundImage: `url('${leader.photo}')` }}
              />
              {/* Layered gradient — deeper bottom for legibility */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/95 via-black/55 to-transparent" />
              <div className="absolute inset-0 bg-gradient-to-b from-black/20 to-transparent" />

              {/* Content */}
              <div className="relative z-10 h-full flex flex-col justify-end p-5">
                {/* Net worth badge */}
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
                  {leader.company} \u2197
                </a>
                <p className="text-white/65 text-xs leading-relaxed line-clamp-2 mb-3">
                  {leader.description}
                </p>
                {/* Quote \u2014 smooth grid-row reveal on hover */}
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
