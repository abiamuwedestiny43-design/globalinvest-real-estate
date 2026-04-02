const QATARI_LEADERS = [
  {
    name: "Sheikh Hamad bin Jassim bin Jaber Al Thani",
    shortName: "Sheikh Hamad bin Jassim",
    company: "Paramount Services Holdings",
    companyUrl: "https://www.qia.qa",
    flag: "🇶🇦",
    netWorth: "Multi-Billion",
    description:
      "Known for major global investments through Paramount Services Holdings, including a landmark 3% stake in Deutsche Bank and far-reaching financial portfolios.",
    quote:
      "Real estate across borders demands trust, transparency, and vision. GlobalInvest delivers all three.",
    photo:
      "https://images.unsplash.com/photo-1560250097-0b93528c311a?w=400&h=400&fit=crop&q=80",
  },
  {
    name: "Sheikh Faisal bin Qassim Al Thani",
    shortName: "Sheikh Faisal bin Qassim",
    company: "Al Faisal Holding",
    companyUrl: "https://www.alfaisalholding.com",
    flag: "🇶🇦",
    netWorth: "Multi-Billion",
    description:
      "Chairman of Al Faisal Holding, a massive Qatari conglomerate with diverse interests across hospitality, real estate, and commerce spanning multiple continents.",
    quote:
      "GlobalInvest brings the world's finest properties to investors who think beyond borders — that is the future.",
    photo:
      "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=400&h=400&fit=crop&q=80",
  },
  {
    name: "Nasser Al-Khelaifi",
    shortName: "Nasser Al-Khelaifi",
    company: "beIN Media Group / PSG",
    companyUrl: "https://www.bein.com",
    flag: "🇶🇦",
    netWorth: "Multi-Billion",
    description:
      "Chairman of beIN Media Group and President of Paris Saint-Germain F.C., reshaping global sports, media, and investment from Qatar's most prominent boardrooms.",
    quote:
      "The champions of tomorrow invest where others haven't yet looked. GlobalInvest is that platform.",
    photo:
      "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=400&fit=crop&q=80",
  },
  {
    name: "Moutaz Al Khayyat",
    shortName: "Moutaz Al Khayyat",
    company: "Power International Holding",
    companyUrl: "https://www.powerholding.qa",
    flag: "🇶🇦",
    netWorth: "Multi-Billion",
    description:
      "Chairman of Power International Holding, a major force in construction and contracting that has shaped Qatar's modern infrastructure and built iconic projects.",
    quote:
      "We build the world's skylines — GlobalInvest connects those assets to the investors who deserve them.",
    photo:
      "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=400&h=400&fit=crop&q=80",
  },
  {
    name: "Ramez Al Khayyat",
    shortName: "Ramez Al Khayyat",
    company: "Power International Holding",
    companyUrl: "https://www.powerholding.qa",
    flag: "🇶🇦",
    netWorth: "Multi-Billion",
    description:
      "Group CEO of Power International Holding, driving operational excellence across construction, contracting, and real estate ventures throughout the Gulf region.",
    quote:
      "GlobalInvest is the digital foundation for real estate's next chapter — built for leaders who move fast.",
    photo:
      "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400&h=400&fit=crop&q=80",
  },
  {
    name: "Al Attiya Family",
    shortName: "Al Attiya",
    company: "Attiya Group",
    companyUrl: "https://www.qatar.qa",
    flag: "🇶🇦",
    netWorth: "Multi-Billion",
    description:
      "One of Qatar's most distinguished business families, with deep roots in energy, trade, and real estate investments shaping the nation's economic landscape.",
    quote:
      "Qatar's wealth is built on long-term thinking. GlobalInvest reflects that same philosophy.",
    photo:
      "https://images.unsplash.com/photo-1566492031773-4f4e44671857?w=400&h=400&fit=crop&q=80",
  },
  {
    name: "Al Emadi Family",
    shortName: "Al Emadi",
    company: "Qatar National Bank",
    companyUrl: "https://www.qnb.com",
    flag: "🇶🇦",
    netWorth: "Multi-Billion",
    description:
      "Prominent Qatari business family with pivotal roles in Qatar's banking sector, financial services, and strategic international investment portfolios.",
    quote:
      "Sound investments require a trustworthy platform. GlobalInvest sets the standard for real estate excellence.",
    photo:
      "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=400&h=400&fit=crop&q=80",
  },
  {
    name: "Al Mannai Family",
    shortName: "Al Mannai",
    company: "Mannai Corporation",
    companyUrl: "https://www.mannai.com.qa",
    flag: "🇶🇦",
    netWorth: "Multi-Billion",
    description:
      "Family behind Mannai Corporation, a leading Qatari trading and services conglomerate with operations spanning automotive, IT, and industrial sectors.",
    quote:
      "From Qatar to the world — GlobalInvest bridges the gap between local capital and global opportunity.",
    photo:
      "https://images.unsplash.com/photo-1556157382-97eda2d62296?w=400&h=400&fit=crop&q=80",
  },
  {
    name: "Al Misnad Family",
    shortName: "Al Misnad",
    company: "Al Misnad Group",
    companyUrl: "https://www.qatar.qa",
    flag: "🇶🇦",
    netWorth: "Multi-Billion",
    description:
      "Distinguished Qatari family with significant influence in education, commerce, and real estate, contributing to Qatar's Vision 2030 development agenda.",
    quote:
      "The best investments in our region are those that uplift communities. GlobalInvest shares that mission.",
    photo:
      "https://images.unsplash.com/photo-1519345182560-3f2917c472ef?w=400&h=400&fit=crop&q=80",
  },
  {
    name: "Al Mohannadi Family",
    shortName: "Al Mohannadi",
    company: "Mohannadi Holdings",
    companyUrl: "https://www.qatar.qa",
    flag: "🇶🇦",
    netWorth: "Multi-Billion",
    description:
      "Prominent Qatari business family with diverse holdings across construction, real estate, and trade, deeply embedded in Qatar's economic growth story.",
    quote:
      "GlobalInvest gives Qatar's most ambitious investors access to the world's most valuable properties.",
    photo:
      "https://images.unsplash.com/photo-1552058544-f2b08422138a?w=400&h=400&fit=crop&q=80",
  },
];

export function QatariBusinessLeaders() {
  return (
    <section
      className="py-20 bg-muted/30"
      aria-label="Qatari business leaders support"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-14">
          <span className="text-xs font-semibold tracking-widest uppercase text-primary mb-3 block">
            Trusted by Investors Worldwide
          </span>
          <h2 className="font-display text-3xl sm:text-4xl font-bold text-foreground mb-2">
            Qatar's Premier Business Leaders
          </h2>
          <span className="section-accent-bar" />
          <p className="text-muted-foreground max-w-2xl mx-auto text-base mt-5">
            The most distinguished families and business titans of Qatar — Al
            Thani, Attiya, Emadi, Fardan, Jaidah, Kaabi, Khater, Kuwari, Mana,
            Mannai, Misnad, and Mohannadi — standing behind GlobalInvest's
            vision for world-class real estate.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-5">
          {QATARI_LEADERS.map((leader) => (
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
                    Qatar Elite
                  </span>
                </div>
                <h3 className="font-display text-white font-bold text-sm leading-tight mb-0.5">
                  {leader.shortName}
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
