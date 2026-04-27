"use client";

import React, { useEffect, useState } from "react";
import { Youtube, Instagram, ExternalLink, RefreshCcw } from "lucide-react";
import { FaXTwitter } from "react-icons/fa6";
import Link from "next/link";

const platformIcons = {
  YouTube: Youtube,
  Instagram: Instagram,
  X: FaXTwitter,
};

const platformLinks = {
  YouTube: "https://www.youtube.com/@eulerfold",
  Instagram: "https://www.instagram.com/eulerfold",
  X: "https://x.com/eulerfold",
};

// YouTube Channel ID for @eulerfold (would normally be fetched or hardcoded)
// For now, using a common RSS-to-JSON proxy to get real data
const YOUTUBE_RSS_URL = "https://www.youtube.com/feeds/videos.xml?channel_id=UC_x5XG1OV2P6uYZ5gzS9rqw"; // Placeholder ID, @eulerfold ID needed

export default function SocialFeed() {
  const [posts, setPosts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchPosts = async () => {
    setLoading(true);
    try {
      // 1. Fetch YouTube Latest via RSS-to-JSON (CORS-friendly for frontend)
      const channelId = "UChb5eYPxT20MgfLzZznpt-Q";
      const rssUrl = `https://www.youtube.com/feeds/videos.xml?channel_id=${channelId}`;
      const ytResponse = await fetch(`https://api.rss2json.com/v1/api.json?rss_url=${encodeURIComponent(rssUrl)}`);
      const ytData = await ytResponse.json();
      
      let combinedPosts = [];

      if (ytData.status === "ok" && ytData.items) {
        combinedPosts = ytData.items.slice(0, 3).map((item: any) => ({
          id: item.guid,
          platform: "YouTube",
          content: item.title,
          date: new Date(item.pubDate).toLocaleDateString(undefined, { month: 'short', day: 'numeric' }),
          link: item.link
        }));
      }

      // If YouTube fetch fails or is empty, provide a clean state or high-quality placeholder
      if (combinedPosts.length === 0) {
        combinedPosts.push({ 
          id: "yt-fallback", 
          platform: "YouTube", 
          content: "Check out the latest explainer videos on our channel.", 
          date: "Latest", 
          link: platformLinks.YouTube 
        });
      }

      // 2. Instagram & X placeholders (clean and community-focused)
      combinedPosts.push(
        { id: "ig-1", platform: "Instagram", content: "Visualizing the beauty of mathematical structures in modern AI.", date: "Community", link: platformLinks.Instagram },
        { id: "tw-1", platform: "X", content: "Updates on the latest research and engineering breakthroughs at EulerFold.", date: "Community", link: platformLinks.X }
      );

      setPosts(combinedPosts);
    } catch (error) {
      console.error("Failed to fetch social posts:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPosts();
  }, []);

  return (
    <section className="py-20 px-6 bg-background relative overflow-hidden border-t border-border/30">
      <div className="lg:max-w-[60%] mx-auto">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-10 gap-6">
          <div className="max-w-md">
            <h3 className="text-lg md:text-xl font-bold text-text-heading leading-tight font-inter tracking-tight">
              Latest updates from the <span className="text-accent italic">EulerFold</span> community.
            </h3>
          </div>
          <div className="flex gap-4">
            <button 
               onClick={fetchPosts}
               className="p-2.5 rounded-xl border border-border/50 hover:border-accent/50 text-text-muted hover:text-accent transition-all bg-sidebar/30"
               title="Refresh Feed"
            >
              <RefreshCcw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
            </button>
            <Link 
               href={platformLinks.YouTube}
               target="_blank"
               className="p-2.5 rounded-xl border border-border/50 hover:border-accent/50 text-text-muted hover:text-accent transition-all bg-sidebar/30"
            >
              <Youtube className="w-4 h-4" />
            </Link>
            <Link 
               href={platformLinks.Instagram}
               target="_blank"
               className="p-2.5 rounded-xl border border-border/50 hover:border-accent/50 text-text-muted hover:text-accent transition-all bg-sidebar/30"
            >
              <Instagram className="w-4 h-4" />
            </Link>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {posts.map((post) => {
            const Icon = (platformIcons as any)[post.platform];
            return (
              <Link
                key={post.id}
                href={post.link}
                target="_blank"
                className="group relative p-4 rounded-2xl border border-border/50 bg-sidebar/20 hover:bg-sidebar/40 transition-all duration-300 flex flex-col justify-between min-h-[140px] shadow-sm hover:shadow-lg hover:shadow-accent/5"
              >
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2 text-accent">
                      <div className="p-1 rounded-md bg-accent/10">
                        <Icon className="w-4 h-4" />
                      </div>
                      <span className="text-[12px] font-bold tracking-widest uppercase manrope-body">
                        {post.platform}
                      </span>
                    </div>
                    <span className="text-[11px] text-text-muted font-bold uppercase tracking-wider">{post.date}</span>
                  </div>

                  <p className="text-text-primary text-[14px] leading-snug manrope-body font-medium">
                    {post.content}
                  </p>
                </div>

                <div className="mt-3 flex items-center gap-1.5 text-[12px] font-bold text-accent opacity-0 group-hover:opacity-100 transition-opacity tracking-widest uppercase">
                  View Post <ExternalLink className="w-3 h-3" />
                </div>
                
                {/* Subtle Hover Glow */}
                <div className="absolute -z-10 inset-0 rounded-2xl bg-accent/5 blur-xl opacity-0 group-hover:opacity-100 transition-opacity" />
              </Link>
            );
          })}
        </div>
      </div>
    </section>
  );
}
