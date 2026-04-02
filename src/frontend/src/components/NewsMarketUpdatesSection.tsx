import { Link } from "@tanstack/react-router";
import { ArrowRight, Calendar, Tag, User } from "lucide-react";
import { motion } from "motion/react";
import { useEffect, useState } from "react";
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

export function NewsMarketUpdatesSection() {
  const { actor } = useActor();
  const [posts, setPosts] = useState<NewsPost[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!actor) return;
    actor
      .getFeaturedNewsPosts()
      .then((fetched) => {
        if (fetched.length === 0) {
          setPosts(SAMPLE_POSTS);
        } else {
          setPosts(fetched as NewsPost[]);
        }
      })
      .catch(() => {
        setPosts(SAMPLE_POSTS);
      })
      .finally(() => setLoading(false));
  }, [actor]);

  // Show sample posts immediately if actor not yet ready
  const displayPosts = loading && posts.length === 0 ? SAMPLE_POSTS : posts;

  return (
    <section
      className="py-20 bg-background"
      aria-label="News and Market Updates"
    >
      <div className="container mx-auto px-4">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.55 }}
          className="text-center mb-14"
        >
          <p className="text-primary text-xs font-semibold tracking-widest uppercase mb-3">
            Stay Informed
          </p>
          <h2 className="font-display text-3xl md:text-4xl font-bold text-foreground">
            News &amp; Market Updates
          </h2>
          <p className="text-muted-foreground mt-3 text-base max-w-xl mx-auto">
            The latest insights, trends, and opportunities from global real
            estate markets
          </p>
          <span className="section-accent-bar" />
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {displayPosts.slice(0, 3).map((post, i) => (
            <motion.article
              key={String(post.id)}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: i * 0.1 }}
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

        {/* View all link */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.45, delay: 0.35 }}
          className="text-center mt-10"
        >
          <Link
            to="/news"
            data-ocid="news.link"
            className="inline-flex items-center gap-2 text-primary font-semibold text-sm hover:gap-3 transition-all duration-200"
          >
            View All Market Updates
            <ArrowRight className="w-4 h-4" />
          </Link>
        </motion.div>
      </div>
    </section>
  );
}
