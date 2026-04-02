const MIDDLE_EAST_LEADERS = [
  {
    name: "Pavel Durov",
    company: "Telegram",
    companyUrl: "https://telegram.org",
    flag: "🇦🇪",
    netWorth: "$15B – $17.1B",
    description:
      "Founder of Telegram, one of the world's most popular encrypted messaging platforms with 900M+ users globally.",
    quote:
      "GlobalInvest represents the next generation of borderless investment — exactly what the world needs.",
    photo: "/assets/generated/pavel-durov.dim_400x400.jpg",
  },
  {
    name: "Hussain Sajwani",
    company: "DAMAC Properties",
    companyUrl: "https://www.damacproperties.com",
    flag: "🇦🇪",
    netWorth: "$10.2B",
    description:
      "Founder of DAMAC Properties, one of the Middle East's largest luxury real estate developers shaping Dubai's skyline.",
    quote:
      "Real estate is the backbone of wealth creation. GlobalInvest is the platform that makes it truly global.",
    photo: "/assets/generated/hussain-sajwani.dim_400x400.jpg",
  },
  {
    name: "M.A. Yusuff Ali",
    company: "Lulu Group International",
    companyUrl: "https://www.luluhypermarket.com",
    flag: "🇦🇪",
    netWorth: "$6.4B – $7.4B",
    description:
      "Chairman of Lulu Group International, the UAE's retail powerhouse operating 240+ hypermarkets across 22 countries.",
    quote:
      "Platforms like GlobalInvest open real estate to millions who never had access before. That's true progress.",
    photo: "/assets/generated/ma-yusuff-ali.dim_400x400.jpg",
  },
  {
    name: "Abdulla Al Futtaim",
    company: "Al-Futtaim Group",
    companyUrl: "https://www.alfuttaim.com",
    flag: "🇦🇪",
    netWorth: "$4.9B",
    description:
      "Owner of Al-Futtaim Group, a diversified conglomerate spanning automotive, retail, real estate, and financial services.",
    quote:
      "Transparency and trust are the pillars of long-term investment. GlobalInvest has built both into its core.",
    photo: "/assets/generated/abdulla-al-futtaim.dim_400x400.jpg",
  },
  {
    name: "Abdulla Al Ghurair",
    company: "Mashreq Bank",
    companyUrl: "https://www.mashreqbank.com",
    flag: "🇦🇪",
    netWorth: "$4.8B",
    description:
      "Founder of Mashreq Bank, one of the UAE's oldest and most trusted financial institutions with a 55-year legacy.",
    quote:
      "The future of finance and real estate are converging. GlobalInvest is leading that transformation.",
    photo: "/assets/generated/abdulla-al-ghurair.dim_400x400.jpg",
  },
  {
    name: "Ravi Pillai",
    company: "RP Group",
    companyUrl: "https://www.rpgroup.com",
    flag: "🇦🇪",
    netWorth: "$3B+",
    description:
      "Founder of RP Group, a major conglomerate with interests in construction, hospitality, and real estate across the Gulf.",
    quote:
      "I've built projects across the Gulf for decades. GlobalInvest connects that work with global investors seamlessly.",
    photo: "/assets/generated/ravi-pillai.dim_400x400.jpg",
  },
  {
    name: "Sunny Varkey",
    company: "GEMS Education",
    companyUrl: "https://www.gemseducation.com",
    flag: "🇦🇪",
    netWorth: "$2B+",
    description:
      "Founder of GEMS Education, the world's largest operator of private K-12 schools, educating 140,000+ students globally.",
    quote:
      "Building for the future means investing in both people and property. GlobalInvest understands that vision.",
    photo: "/assets/generated/sunny-varkey.dim_400x400.jpg",
  },
  {
    name: "Joy Alukkas",
    company: "Joyalukkas Group",
    companyUrl: "https://www.joyalukkas.com",
    flag: "🇦🇪",
    netWorth: "$2B+",
    description:
      "Chairman of Joyalukkas Group, operating one of the world's largest jewelry retail chains with 140+ showrooms.",
    quote:
      "Just as gold holds its value across generations, GlobalInvest helps investors secure timeless real estate assets.",
    photo: "/assets/generated/joy-alukkas.dim_400x400.jpg",
  },
  {
    name: "Feroz Allana",
    company: "IFFCO Group",
    companyUrl: "https://www.iffco.com",
    flag: "🇦🇪",
    netWorth: "$1B+",
    description:
      "Founder of IFFCO Group, a leading FMCG conglomerate distributing food and consumer products across 60+ countries.",
    quote:
      "GlobalInvest brings the same efficiency to real estate that great supply chains bring to global commerce.",
    photo: "/assets/generated/feroz-allana.dim_400x400.jpg",
  },
  {
    name: "Shamsheer Vayalil",
    company: "Burjeel Holdings",
    companyUrl: "https://www.burjeelholdings.com",
    flag: "🇦🇪",
    netWorth: "$1B+",
    description:
      "Founder of Burjeel Holdings, one of the largest private healthcare operators in the Middle East and North Africa.",
    quote:
      "Wealth built on real assets endures. GlobalInvest is the platform I trust to connect serious investors worldwide.",
    photo: "/assets/generated/shamsheer-vayalil.dim_400x400.jpg",
  },
];

export function MiddleEastBusinessLeaders() {
  return (
    <section
      className="py-20 bg-background"
      aria-label="Middle East business leaders support"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-14">
          <span className="text-xs font-semibold tracking-widest uppercase text-primary mb-3 block">
            Trusted by Investors Worldwide
          </span>
          <h2 className="font-display text-3xl sm:text-4xl font-bold text-foreground mb-2">
            Middle East &amp; Global Business Leaders
          </h2>
          <span className="section-accent-bar" />
          <p className="text-muted-foreground max-w-2xl mx-auto text-base mt-5">
            Pioneering entrepreneurs and business titans from the UAE and beyond
            who stand behind GlobalInvest's vision for transparent, borderless
            real estate.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-5">
          {MIDDLE_EAST_LEADERS.map((leader) => (
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
