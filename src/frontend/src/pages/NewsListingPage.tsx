import { Link } from "@tanstack/react-router";
import { ArrowLeft, Calendar, Loader2, Tag, User } from "lucide-react";
import { motion } from "motion/react";
import { useEffect, useMemo, useState } from "react";
import { useActor } from "../hooks/useActor";

interface NewsPost {
  id: bigint;
  title: string;
  summary: string;
  content: string;
  category: string;
  author: string;
  imageUrl: string;
  publishedAt: bigint;
  featured: boolean;
}

const SAMPLE_POSTS: NewsPost[] = [
  {
    id: 0n,
    title: "Dubai Luxury Real Estate Sees Record Demand in 2025",
    summary:
      "Ultra-high-net-worth buyers are driving an unprecedented surge in Dubai's prime residential market, with Palm Jumeirah villas selling at record premiums.",
    content: "",
    category: "Market Trends",
    author: "GlobalInvest Editorial",
    imageUrl:
      "https://images.unsplash.com/photo-1512453979798-5ea266f8880c?w=800&q=80",
    publishedAt: BigInt(Date.now()) * 1_000_000n,
    featured: true,
  },
  {
    id: 1n,
    title: "Singapore Property Prices Hit 5-Year High Amid Low Supply",
    summary:
      "Government cooling measures have had limited impact as foreign investment floods into Singapore's prime districts, pushing prices to multi-year peaks.",
    content: "",
    category: "Investment",
    author: "GlobalInvest Editorial",
    imageUrl:
      "https://images.unsplash.com/photo-1555400038-63f5ba517a47?w=800&q=80",
    publishedAt: BigInt(Date.now() - 86400000) * 1_000_000n,
    featured: true,
  },
  {
    id: 2n,
    title: "London Prime Market: International Buyers Return Post-Brexit",
    summary:
      "With a favorable exchange rate and renewed confidence, overseas buyers are snapping up Mayfair and Kensington properties at levels not seen since 2015.",
    content: "",
    category: "Global Markets",
    author: "GlobalInvest Editorial",
    imageUrl:
      "https://images.unsplash.com/photo-1513635269975-59663e0ac1ad?w=800&q=80",
    publishedAt: BigInt(Date.now() - 172800000) * 1_000_000n,
    featured: true,
  },
  {
    id: 3n,
    title: "New Mortgage Regulations Reshape European Property Finance",
    summary:
      "The European Central Bank's latest guidelines introduce stress tests and loan caps that will affect buyers across Germany, France, and the Netherlands.",
    content: "",
    category: "Regulation",
    author: "GlobalInvest Editorial",
    imageUrl:
      "https://images.unsplash.com/photo-1560518883-ce09059eeffa?w=800&q=80",
    publishedAt: BigInt(Date.now() - 259200000) * 1_000_000n,
    featured: false,
  },
  {
    id: 4n,
    title: "PropTech Startups Raise $4B to Digitize Real Estate Transactions",
    summary:
      "A wave of well-funded startups are using AI, blockchain, and smart contracts to slash transaction times from months to days in key global markets.",
    content: "",
    category: "Technology",
    author: "GlobalInvest Editorial",
    imageUrl:
      "https://images.unsplash.com/photo-1486325212027-8081e485255e?w=800&q=80",
    publishedAt: BigInt(Date.now() - 345600000) * 1_000_000n,
    featured: false,
  },
  {
    id: 5n,
    title: "Abu Dhabi Freehold Zones Attract Record Foreign Capital",
    summary:
      "New legislation allowing full foreign ownership of Abu Dhabi property has triggered a surge in investment from Europe, Asia, and the Americas.",
    content: "",
    category: "Investment",
    author: "GlobalInvest Editorial",
    imageUrl:
      "https://images.unsplash.com/photo-1582672060674-bc2bd808a8b5?w=800&q=80",
    publishedAt: BigInt(Date.now() - 432000000) * 1_000_000n,
    featured: false,
  },
];

const CATEGORY_COLORS: Record<string, string> = {
  "Market Trends": "bg-teal-100 text-teal-700",
  Investment: "bg-emerald-100 text-emerald-700",
  "Global Markets": "bg-blue-100 text-blue-700",
  Regulation: "bg-violet-100 text-violet-700",
  Technology: "bg-amber-100 text-amber-700",
};

function formatDate(ts: bigint): string {
  const ms = Number(ts / 1_000_000n);
  return new Date(ms).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

export default function NewsListingPage() {
  const { actor } = useActor();
  const [posts, setPosts] = useState<NewsPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState("All");

  useEffect(() => {
    if (!actor) return;
    actor
      .getAllNewsPosts()
      .then((fetched) => {
        if ((fetched as NewsPost[]).length === 0) {
          setPosts(SAMPLE_POSTS);
        } else {
          const sorted = [...(fetched as NewsPost[])].sort((a, b) =>
            Number(b.publishedAt - a.publishedAt),
          );
          setPosts(sorted);
        }
      })
      .catch(() => setPosts(SAMPLE_POSTS))
      .finally(() => setLoading(false));
  }, [actor]);

  // Show samples while loading
  const displayPosts = loading && posts.length === 0 ? SAMPLE_POSTS : posts;

  const categories = useMemo(() => {
    const cats = Array.from(new Set(displayPosts.map((p) => p.category)));
    return ["All", ...cats];
  }, [displayPosts]);

  const filtered = useMemo(() => {
    if (activeCategory === "All") return displayPosts;
    return displayPosts.filter((p) => p.category === activeCategory);
  }, [displayPosts, activeCategory]);

  return (
    <div className="min-h-screen bg-background">
      {/* Page Header */}
      <div className="bg-gradient-to-br from-primary/10 via-background to-background border-b border-border">
        <div className="container mx-auto px-4 py-16">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <Link
              to="/"
              className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors mb-6"
            >
              <ArrowLeft className="w-4 h-4" />
              Back to Home
            </Link>
            <p className="text-primary text-xs font-semibold tracking-widest uppercase mb-3">
              Stay Informed
            </p>
            <h1 className="font-display text-4xl md:text-5xl font-bold text-foreground mb-4">
              News &amp; Market Updates
            </h1>
            <p className="text-muted-foreground text-lg max-w-2xl">
              The latest insights, trends, and opportunities from global real
              estate markets — curated by our editorial team.
            </p>
          </motion.div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-12">
        {/* Category Filters */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.1 }}
          className="flex flex-wrap gap-2 mb-10"
        >
          {categories.map((cat) => (
            <button
              key={cat}
              type="button"
              onClick={() => setActiveCategory(cat)}
              data-ocid="news.filter.tab"
              className={`px-4 py-1.5 rounded-full text-sm font-medium border transition-all duration-200 ${
                activeCategory === cat
                  ? "bg-primary text-primary-foreground border-primary shadow-sm"
                  : "bg-background text-muted-foreground border-border hover:border-primary hover:text-primary"
              }`}
            >
              {cat}
            </button>
          ))}
        </motion.div>

        {/* Loading */}
        {loading && posts.length === 0 && (
          <div className="flex items-center justify-center gap-2 text-muted-foreground py-24">
            <Loader2 className="w-5 h-5 animate-spin" />
            <span>Loading news posts...</span>
          </div>
        )}

        {/* Grid */}
        {!loading || posts.length > 0 ? (
          filtered.length === 0 ? (
            <div
              data-ocid="news.empty_state"
              className="text-center py-24 text-muted-foreground"
            >
              <p className="text-lg font-medium mb-1">
                No posts in this category
              </p>
              <p className="text-sm">Try selecting a different filter above.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {filtered.map((post, i) => (
                <motion.article
                  key={String(post.id)}
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.45, delay: i * 0.07 }}
                  data-ocid={`news.item.${i + 1}`}
                  className="group bg-card border border-border rounded-2xl overflow-hidden shadow-card hover:shadow-card-hover hover:-translate-y-1 transition-all duration-300 flex flex-col"
                >
                  {/* Image */}
                  <div className="relative h-48 overflow-hidden">
                    <img
                      src={post.imageUrl}
                      alt={post.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      loading="lazy"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
                    <span
                      className={`absolute top-3 left-3 text-xs font-semibold px-2.5 py-1 rounded-full ${
                        CATEGORY_COLORS[post.category] ??
                        "bg-gray-100 text-gray-700"
                      }`}
                    >
                      <Tag className="inline w-3 h-3 mr-1 -mt-0.5" />
                      {post.category}
                    </span>
                  </div>

                  {/* Content */}
                  <div className="p-6 flex flex-col flex-1">
                    <h3 className="font-display text-lg font-bold text-foreground leading-snug mb-3 group-hover:text-primary transition-colors">
                      {post.title}
                    </h3>
                    <p className="text-sm text-muted-foreground leading-relaxed mb-4 flex-1">
                      {post.summary}
                    </p>

                    {/* Meta */}
                    <div className="flex items-center gap-4 text-xs text-muted-foreground mt-auto pt-4 border-t border-border">
                      <span className="flex items-center gap-1">
                        <User className="w-3 h-3" />
                        {post.author}
                      </span>
                      <span className="flex items-center gap-1">
                        <Calendar className="w-3 h-3" />
                        {formatDate(post.publishedAt)}
                      </span>
                    </div>
                  </div>
                </motion.article>
              ))}
            </div>
          )
        ) : null}
      </div>
    </div>
  );
}
