import React from 'react';
import { Metadata } from 'next';
import Link from 'next/link';
import { 
  ChevronRight, 
  Share2, 
  Facebook, 
  Twitter,
  Instagram,
  Youtube,
  Rss
} from 'lucide-react';
import PublicHeader from '@/components/PublicHeader';
import Footer from '@/components/Footer';

export const metadata: Metadata = {
  title: 'What is the "Double Descent" phenomenon in Machine Learning? - EulerFold Blog',
  description: 'Exploring why larger models sometimes perform better even when they should be overfitting. A deep dive into the modern understanding of deep learning.',
};

export default function ExampleArticlePage() {
  return (
    <div className="min-h-screen bg-[#f0f7f6] text-[#1a202c] font-inter selection:bg-accent/20">
      <PublicHeader />
      
      {/* Secondary Navigation (BibGuru Style) */}
      <nav className="hidden md:flex items-center justify-center h-[48px] bg-[#f0f7f6] border-b border-[#dee2e6] text-[15px]">
        <ul className="flex items-center gap-6">
          <li><Link href="#" className="text-[#4a5568] hover:text-[#0F766E] transition-colors font-medium">Neural Networks</Link></li>
          <li><Link href="#" className="text-[#4a5568] hover:text-[#0F766E] transition-colors font-medium">Optimization</Link></li>
          <li><Link href="#" className="text-[#4a5568] hover:text-[#0F766E] transition-colors font-medium">Theory</Link></li>
          <li><Link href="#" className="text-[#4a5568] hover:text-[#0F766E] transition-colors font-medium">Resources</Link></li>
        </ul>
      </nav>

      {/* Site Content (BibGuru Layout) */}
      <div className="max-w-[1100px] mx-auto flex flex-col md:flex-row justify-center gap-[60px] mt-[30px] md:mt-[60px] pb-[80px] px-6">
        
        {/* Content Area (Max 700px) */}
        <main className="w-full max-w-[700px]">
          <article>
            <header className="mb-[40px]">
              <h1 className="text-[34px] font-bold leading-[1.1] text-[#111111] mb-[20px] font-inter tracking-tighter">
                What is the "Double Descent" phenomenon in Machine Learning?
              </h1>
              <div className="text-[17px] text-[#4a5568] opacity-70 font-medium inconsolata-ui uppercase tracking-widest">
                By <span className="text-[#111111] font-semibold">Sankalp Chudmunge</span> / <span className="date">April 15 2026</span>
              </div>
            </header>

            <div className="page-content">
              {/* Featured Image (BibGuru Featured Figure Style) */}
              <figure className="my-[40px]">
                <div className="rounded-2xl overflow-hidden border border-[#dee2e6] bg-white p-2 shadow-sm">
                  <img 
                    src="https://images.unsplash.com/photo-1509228468518-180dd4864904?q=80&w=1400&h=700&auto=format&fit=crop" 
                    alt="Neural network complexity and error rates" 
                    className="w-full h-auto rounded-xl"
                  />
                </div>
              </figure>

              <p className="text-[18px] leading-[1.6] mt-[20px] text-[#1a202c] font-inter font-normal">
                For decades, the fundamental rule of statistics was simple: as you increase model complexity, you eventually start to overfit your data. However, modern deep learning has revealed a strange, counter-intuitive second act known as "Double Descent." In this article, we decode why larger models often perform better than their smaller counterparts.
              </p>

              <h2 id="the-classic-view" className="text-[26px] font-bold leading-[1.2] mt-[60px] mb-[16px] text-[#111111] font-inter tracking-tighter">
                The Classic View: Bias-Variance Tradeoff
              </h2>
              <p className="text-[18px] leading-[1.6] mt-[20px] text-[#1a202c] font-inter font-normal">
                In traditional machine learning, we are taught the U-shaped error curve. As model capacity increases, bias (underfitting) decreases, but variance (overfitting) increases. The goal is to find the "sweet spot" at the bottom of the U. Beyond this point, any further increase in parameters should lead to a higher test error.
              </p>

              {/* Box Component (BibGuru Example Box Style) */}
              <div className="bg-[#e8f2f1] p-[30px] mt-[40px] rounded-2xl relative border border-[#dee2e6]">
                <div className="absolute top-0 left-0 px-[25px] leading-[34px] font-bold text-[13px] bg-[#0F766E] text-white rounded-tl-2xl inconsolata-ui uppercase tracking-widest">
                  Technical Insight
                </div>
                <div className="pt-[20px]">
                  <p className="text-[18px] leading-[1.6] italic text-[#2d3748] font-inter font-normal">
                    "The interpolation threshold is the critical point where the model has just enough parameters to achieve zero training error. Surprisingly, this is often the point of *maximum* test error, before the second descent begins."
                  </p>
                </div>
              </div>

              <h2 id="the-second-descent" className="text-[26px] font-bold leading-[1.2] mt-[60px] mb-[16px] text-[#111111] font-inter tracking-tighter">
                The Second Descent: Beyond Interpolation
              </h2>
              <p className="text-[18px] leading-[1.6] mt-[20px] text-[#1a202c] font-inter font-normal">
                Double descent occurs when we continue to increase model size *past* the point of perfect training data interpolation. Instead of the error continuing to rise, it begins to drop again. In this "over-parameterized" regime, larger models tend to find smoother, more generalizable solutions that smaller models simply cannot access.
              </p>

              <ul className="list-disc ml-[40px] my-[20px] text-[18px] leading-[1.6] text-[#1a202c] font-inter font-normal space-y-3">
                <li>Under-parameterized regime: The classic U-curve exists.</li>
                <li>Interpolation threshold: Peak noise and maximum test error.</li>
                <li>Over-parameterized regime: Test error descends a second time.</li>
              </ul>

              <h2 id="why-it-matters" className="text-[26px] font-bold leading-[1.2] mt-[60px] mb-[16px] text-[#111111] font-inter tracking-tighter">
                Why it matters for Modern AI
              </h2>
              <p className="text-[18px] leading-[1.6] mt-[20px] text-[#1a202c] font-inter font-normal">
                This phenomenon explains why Large Language Models (LLMs) with hundreds of billions of parameters don't just memorize their training data but develop emergent reasoning capabilities. It suggests that, in the world of deep learning, "bigger is better" isn't just a hardware preference—it's a mathematical advantage.
              </p>

              <h2 id="faq" className="text-[26px] font-bold leading-[1.2] mt-[60px] mb-[16px] text-[#111111] font-inter tracking-tighter">
                Frequently Asked Questions
              </h2>
              
              <div className="border border-[#dee2e6] rounded-2xl overflow-hidden bg-white">
                {[
                  { q: "Does double descent always happen?", a: "Not necessarily. It depends on the dataset size, the optimizer used, and the level of label noise. However, it is a remarkably robust phenomenon in neural networks." },
                  { q: "Is larger always better then?", a: "In the over-parameterized regime, increasing parameters typically improves performance, but it comes with diminishing returns and massive computational costs." }
                ].map((item, idx) => (
                  <details key={idx} className="border-b border-[#dee2e6] last:border-0 group" open={idx === 0}>
                    <summary className="p-[20px] px-[24px] text-[19px] font-bold leading-[1.2] cursor-pointer list-none flex justify-between items-center group-open:bg-[#f0f7f6] transition-colors font-inter tracking-tighter">
                      <span>{item.q}</span>
                      <span className="text-[#0F766E] text-[22px] inconsolata-ui font-medium">{idx === 0 ? '−' : '+'}</span>
                    </summary>
                    <div className="p-[26px] px-[38px] pt-0 text-[17px] leading-[1.6] text-[#4a5568] font-inter font-normal">
                      {item.a}
                    </div>
                  </details>
                ))}
              </div>

              {/* Related Articles Strip (BibGuru Style) */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-[40px] mt-[80px]">
                {[
                  { title: "Understanding Transformer Attention", slug: "transformer-attention" },
                  { title: "The Geometry of Loss Landscapes", slug: "loss-landscapes" },
                  { title: "Entropy in Neural Systems", slug: "neural-entropy" }
                ].map((item, i) => (
                  <Link key={i} href="#" className="flex flex-col gap-4 group">
                    <div className="aspect-[2/1] bg-white border border-[#dee2e6] rounded-2xl overflow-hidden group-hover:shadow-md transition-all">
                      <img src={`https://images.unsplash.com/photo-1620712943543-bcc4628c9456?q=80&w=440&h=220&auto=format&fit=crop`} alt="Related" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                    </div>
                    <span className="text-[17px] leading-[1.3] font-bold text-[#3182ce] hover:bg-[#ebf8ff] rounded px-1 -mx-1 transition-all font-inter tracking-tight">
                      {item.title} [Updated 2026]
                    </span>
                  </Link>
                ))}
              </div>

              {/* Social Buttons (BibGuru Style) */}
              <div className="flex gap-4 mt-[32px]">
                <button className="flex items-center gap-2 bg-[#00abf0] text-white px-[12px] py-[3px] rounded text-[14px] font-bold hover:bg-[#009cdc] shadow-[inset_0_-3px_0_rgba(0,0,0,0.2)]">
                  <Twitter className="w-4 h-4 fill-white" /> Tweet
                </button>
                <button className="flex items-center gap-2 bg-[#3a579a] text-white px-[12px] py-[3px] rounded text-[14px] font-bold hover:bg-[#344f8b] shadow-[inset_0_-3px_0_rgba(0,0,0,0.2)]">
                  <Facebook className="w-4 h-4 fill-white" /> Share
                </button>
              </div>
            </div>
          </article>
        </main>

        {/* Sidebar Area (325px - 400px) */}
        <aside className="w-full md:w-[325px] lg:w-[400px]">
          <div className="sticky top-[100px] border border-[#dee2e6] rounded-lg p-[20px] bg-white">
            <h2 className="text-[22px] font-normal text-center mb-[10px] text-[#0a0a0a]">About</h2>
            <p className="text-[18px] leading-[120%] text-[#4a5568] mb-[10px] font-inter font-normal">
              Make your life easier with our technical deep dives and learning resources.
            </p>
            <p className="text-[18px] leading-[120%] text-[#4a5568] mb-[20px] font-inter font-normal">
              For engineers and AI researchers.
            </p>

            <h2 className="text-[22px] font-normal text-center mb-[10px] text-[#0a0a0a]">Follow us</h2>
            <div className="flex justify-center gap-2">
              <a href="https://x.com/eulerfold" target="_blank" rel="noopener noreferrer" className="w-[36px] h-[36px] bg-[#000000] rounded flex items-center justify-center hover:opacity-80 shadow-[inset_0_-3px_0_rgba(0,0,0,0.2)] transition-colors">
                <Twitter className="w-5 h-5 fill-white text-white" />
              </a>
              <a href="https://www.instagram.com/eulerfold" target="_blank" rel="noopener noreferrer" className="w-[36px] h-[36px] bg-[#E1306C] rounded flex items-center justify-center hover:opacity-80 shadow-[inset_0_-3px_0_rgba(0,0,0,0.2)] transition-colors">
                <Instagram className="w-5 h-5 text-white" />
              </a>
              <a href="https://www.youtube.com/@eulerfold" target="_blank" rel="noopener noreferrer" className="w-[36px] h-[36px] bg-[#FF0000] rounded flex items-center justify-center hover:opacity-80 shadow-[inset_0_-3px_0_rgba(0,0,0,0.2)] transition-colors">
                <Youtube className="w-5 h-5 fill-white text-white" />
              </a>
              <a href="mailto:eulerfold@gmail.com" className="w-[36px] h-[36px] bg-[#0F766E] rounded flex items-center justify-center hover:opacity-80 shadow-[inset_0_-3px_0_rgba(0,0,0,0.2)] transition-colors">
                <Rss className="w-5 h-5 text-white" />
              </a>
            </div>
          </div>
        </aside>
      </div>

      <Footer />
    </div>
  );
}
