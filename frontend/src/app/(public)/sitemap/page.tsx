import React from 'react';
import { 
  FileText, 
  ChevronRight,
  ExternalLink
} from 'lucide-react';
import Link from 'next/link';

export const metadata = {
  title: 'Sitemap | EulerFold',
  description: 'List of all pages on EulerFold.',
};

export default function SitemapPage() {
  const categories = [
    {
      title: "Main Pages",
      links: [
        { name: "Home", href: "/" },
        { name: "Dashboard", href: "/dashboard" },
        { name: "Study Planner", href: "/planner" },
        { name: "BuildPilot", href: "/buildpilot" },
        { name: "Roadmap Generator", href: "/generate" },
        { name: "Explore Roadmaps", href: "/explore" },
        { name: "Roadmap Index", href: "/roadmap" },
        { name: "Leaderboard", href: "/leaderboard" },
        { name: "Pricing", href: "/pricing" },
      ]
    },
    {
      title: "Learning Resources",
      links: [
        { name: "Learning Directory", href: "/learn" },
        { name: "Research Decoded", href: "/research-decoded" },
        { name: "Technical Articles", href: "/articles" },
        { name: "Exam Archive", href: "/archive/exams/previous-year-papers" },
      ]
    },
    {
      title: "Exam Papers",
      links: [
        { name: "JEE Advanced", href: "/archive/exams/previous-year-papers/jee_advance" },
        { name: "GATE Engineering", href: "/archive/exams/previous-year-papers/gate" },
        { name: "UPSC Civil Services", href: "/archive/exams/previous-year-papers/upsc" },
        { name: "NEET Medical", href: "/archive/exams/previous-year-papers/neet" },
        { name: "AP Exams", href: "/archive/exams/previous-year-papers/ap" },
        { name: "AMC / AIME", href: "/archive/exams/previous-year-papers/amc" },
        { name: "STEP / MAT", href: "/archive/exams/previous-year-papers/step" },
        { name: "Olympiads", href: "/archive/exams/previous-year-papers/imo" },
      ]
    },
    {
      title: "Support & Legal",
      links: [
        { name: "About Us", href: "/about" },
        { name: "Careers", href: "/careers" },
        { name: "Settings", href: "/settings" },
        { name: "Help Center", href: "/help" },
        { name: "Privacy Policy", href: "/privacy" },
        { name: "Terms of Service", href: "/terms" },
        { name: "Unsubscribe", href: "/unsubscribe" },
      ]
    }
  ];

  return (
    <div className="flex-1 bg-background">
      <div className="max-w-4xl mx-auto px-6 py-12 md:py-20">
        <h1 className="text-2xl font-bold text-text-heading mb-2">Sitemap</h1>
        <p className="text-text-muted mb-12">A list of all pages and resources on EulerFold.</p>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-10">
          {categories.map((category, idx) => (
            <section key={idx}>
              <h2 className="text-[11px] font-bold text-text-muted uppercase tracking-wider border-b border-border pb-2 mb-4">
                {category.title}
              </h2>
              <ul className="space-y-3">
                {category.links.map((link, lIdx) => (
                  <li key={lIdx}>
                    <Link 
                      href={link.href}
                      className="text-[14px] text-text-primary hover:text-teal-700 flex items-center gap-2 group transition-colors"
                    >
                      <ChevronRight className="w-3 h-3 text-text-muted group-hover:text-teal-700" />
                      {link.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </section>
          ))}
        </div>

        <div className="mt-20 pt-8 border-t border-border flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-[11px] text-text-muted">
            Last updated: {new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
          </p>
          <Link 
            href="https://www.eulerfold.com/sitemap.xml" 
            className="text-[11px] text-text-muted hover:text-teal-700 flex items-center gap-1.5"
          >
            XML Version <ExternalLink className="w-3 h-3" />
          </Link>
        </div>
      </div>
    </div>
  );
}
