"use client";

import React, { useState } from 'react';
import { Inconsolata, Manrope } from 'next/font/google';
import { 
  Search,
  ChevronRight,
  ChevronLeft,
  Menu,
  X,
  Github,
  ExternalLink,
  Video,
  FileText,
  BookOpen,
  CheckCircle2,
  AlertCircle,
  Lightbulb,
  ArrowLeft,
  ArrowRight
} from 'lucide-react';
import Link from 'next/link';
import { supabase } from '@/lib/supabase/client';

const inconsolata = Inconsolata({
  subsets: ['latin'],
  variable: '--font-mono',
  weight: ['400', '500', '600', '700'],
});

const manrope = Manrope({
  subsets: ['latin'],
  variable: '--font-sans',
  weight: ['400', '500', '600', '700'],
});

// Mock Data following the Roadmap Schema
const topicData = {
  title: "Neural Network Architectures",
  subject: "Artificial Intelligence",
  moduleTitle: "Unit 2: Deep Learning Fundamentals",
  description: "Explore the evolution of neural network designs, from simple MLPs to complex Transformers. Understand why different architectures are suited for specific tasks like vision, language, and robotics.",
  heroImage: "https://huggingface.co/robotics-course/images/resolve/main/ch1/ch1-lerobot-figure1.png",
  outcome: "By the end of this module, you will be able to distinguish between CNNs, RNNs, and Transformers, and select the appropriate architecture for a given dataset.",
  resources: [
    { title: "Illustrated Guide to Transformers", url: "https://youtube.com/watch?v=example1", type: "video", provider: "YouTube" },
    { title: "Deep Learning Specialization: CNNs", url: "https://coursera.org/example2", type: "docs", provider: "Coursera" },
    { title: "Understanding LSTM Networks", url: "https://colah.github.io/posts/2015-08-Understanding-LSTMs/", type: "article", provider: "Colah's Blog" }
  ],
  sections: [
    {
      id: "intro",
      title: "Introduction to Architectures",
      content: "Neural networks aren't one-size-fits-all. The way neurons are connected (the architecture) determines what features the network can learn efficiently. For example, spatial patterns in images are best captured by convolutional layers, while sequential patterns in text require recurrence or attention mechanisms."
    },
    {
      id: "cnn",
      title: "Convolutional Neural Networks (CNNs)",
      content: "CNNs revolutionized computer vision by using kernels to extract spatial hierarchies. Instead of every neuron connecting to every other neuron, CNNs focus on local patches, making them translation-invariant and much more efficient for high-dimensional image data."
    }
  ],
  proofOfWork: {
    whatToBuild: "Build a digit classifier using MNIST. You must implement both a simple Feedforward network and a basic CNN, and compare their performance using a confusion matrix.",
    evidence: "GitHub repository with your Jupyter Notebook and a screenshot of your training logs showing at least 98% accuracy on the test set.",
    criteria: [
      "Correct implementation of Conv2D and MaxPool2D layers.",
      "Clear visualization of the training/validation loss curves.",
      "Brief written explanation of why the CNN outperformed the MLP."
    ]
  },
  navigation: [
    { id: "unit0", title: "0. Welcome to the Course", expanded: false, sections: [] },
    { id: "unit1", title: "1. AI Foundations", expanded: true, sections: [
        { title: "Introduction to AI", id: "1/1", active: false },
        { title: "Neural Network Architectures", id: "1/2", active: true },
        { title: "Training Models", id: "1/3", active: false }
    ]},
    { id: "unit2", title: "2. Advanced Topics", expanded: false, sections: [] }
  ]
};

export default function StrictlyHFPage() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  const handleSignIn = async () => {
    try {
      await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: { 
          redirectTo: `${window.location.origin}/auth/callback`,
          queryParams: { prompt: 'select_account' } 
        },
      });
    } catch (error) {
      console.error('Sign in error:', error);
    }
  };

  return (
    <div className={`${inconsolata.variable} ${manrope.variable} fixed inset-0 z-[100] flex flex-col bg-background text-black selection:bg-indigo-100 selection:text-indigo-900 overflow-hidden`}>
      <style jsx global>{`
        .manrope-body {
          font-family: var(--font-sans), sans-serif;
          font-size: 16px;
          line-height: 1.7;
        }
        .inconsolata-ui {
          font-family: var(--font-mono), monospace;
          letter-spacing: -0.01em;
        }
      `}</style>

      {/* 1. Global Header */}
      <header className="inconsolata-ui border-b border-border bg-background h-[48px] shrink-0">
        <div className="w-full px-6 flex h-full items-center justify-between">
          <div className="flex items-center">
            <Link className="flex items-center group shrink-0" href="/">
              <img src="/apple-touch-icon.png" alt="EulerFold" className="w-7 h-7 group-hover:opacity-80 transition-opacity" />
            </Link>

            {/* Search Input */}
            <div className="relative w-full max-w-[400px]">
              <input 
                autoComplete="off" 
                className="w-full pl-10 h-10 pr-3 rounded-md border border-border bg-sidebar focus:bg-background focus:ring-1 focus:ring-indigo-500 transition-all text-[14px] outline-none" 
                placeholder="Search documentation..." 
                type="text" 
              />
              <Search className="absolute left-3 text-gray-400 top-1/2 transform -translate-y-1/2 w-4 h-4" />
            </div>
          </div>

          {/* Minimal Nav */}
          <nav aria-label="Main" className="hidden lg:block ml-4">
            <ul className="flex items-center gap-x-6 text-[14px] font-medium text-gray-500">
              <li className="hover:text-gray-900 transition-colors">
                <button onClick={handleSignIn}>Log In</button>
              </li>
              <li>
                <button 
                  onClick={handleSignIn}
                  className="whitespace-nowrap rounded-full bg-gray-900 px-5 py-1.5 text-white hover:bg-black transition-colors"
                >
                  Sign In
                </button>
              </li>
            </ul>
          </nav>
        </div>
      </header>

      {/* 2. Main Layout (Sidebar + Content) */}
      <div className="flex flex-1 relative overflow-hidden">
        
        {/* Left Sidebar */}
        <aside 
          className={`${
            isSidebarOpen ? 'translate-x-0' : '-translate-x-full'
          } inconsolata-ui bg-background border-r border-border transition-transform duration-300 w-[260px] flex flex-col h-full overflow-y-auto lg:translate-x-0 shrink-0 shadow-sm`}
        >
          {/* Sidebar Header */}
          <div className="bg-gradient-to-r from-amber-50 to-white p-5 border-b border-border shrink-0">
            <div className="flex items-start mb-4">
              <div className="mt-2 mr-2.5 h-2 w-2 rounded-full bg-amber-500 shrink-0"></div>
              <h1 className="text-[15px] font-bold leading-tight uppercase tracking-tight text-gray-900">
                {topicData.subject}<br/>Course
              </h1>
            </div>
            
            <button className="w-full flex items-center rounded-full border border-border bg-background px-4 py-2 text-left text-[13px] text-gray-400 hover:ring-1 hover:ring-indigo-100 transition-all">
              <Search className="mr-2 w-3.5 h-3.5" />
              <span>Search topics...</span>
            </button>
          </div>

          {/* Sidebar Nav Items */}
          <nav className="flex-1 px-4 pt-6 pb-16 space-y-2">
            {topicData.navigation.map((nav) => (
              <div key={nav.id} className="mb-6">
                <div className="flex items-center px-2 py-1.5 text-[12px] font-bold uppercase tracking-widest text-gray-400 group cursor-pointer hover:text-gray-600 transition-colors">
                  <span className="flex-1">{nav.title}</span>
                  <ChevronRight className={`w-3.5 h-3.5 transition-transform ${nav.expanded ? 'rotate-90' : ''}`} />
                </div>
                
                {nav.expanded && (
                  <div className="mt-2 space-y-1 ml-1">
                    {nav.sections.map((section, idx) => (
                      <Link 
                        key={idx}
                        href="#"
                        className={`block py-2 px-4 text-[14px] rounded-xl transition-all ${
                          section.active 
                            ? 'bg-gradient-to-br from-black to-gray-800 text-white font-medium shadow-md' 
                            : 'text-gray-500 hover:text-black hover:bg-sidebar'
                        }`}
                      >
                        {section.title}
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </nav>
        </aside>

        {/* Main Content Area */}
        <main className="flex-1 min-w-0 h-full overflow-y-auto bg-background">
          <div className="max-w-[800px] mr-auto ml-4 md:ml-12 lg:ml-20 px-8 py-12 md:px-12">
            
            {/* 3. Community Banner */}
            <div className="mb-8 bg-gradient-to-br from-orange-300/10 to-transparent rounded-2xl p-8 ring-1 ring-orange-100/50 relative overflow-hidden group">
              <div className="relative z-10">
                <h2 className="text-[22px] font-bold mb-2 text-gray-900 tracking-tight inconsolata-ui">Join the EulerFold community</h2>
                <p className="manrope-body text-gray-600 mb-6 max-w-lg">Track progress and collaborate on roadmaps with students worldwide.</p>
                <button 
                  onClick={handleSignIn}
                  className="inline-block bg-background border border-gray-300 rounded-xl px-6 py-2 text-[14px] font-bold text-gray-800 hover:bg-sidebar shadow-sm transition-all inconsolata-ui"
                >
                  Sign In Free
                </button>
              </div>
              <span className="absolute -bottom-6 -right-6 text-[140px] opacity-5 grayscale -rotate-45 pointer-events-none group-hover:scale-110 transition-transform duration-700">🐢</span>
            </div>

            {/* 4. Article Content */}
            <article className="text-gray-800">
              <h1 className="inconsolata-ui text-[36px] font-bold text-gray-900 mb-8 group flex items-center -ml-12">
                <span className="text-indigo-600 opacity-0 group-hover:opacity-100 w-12 text-3xl transition-opacity">#</span>
                {topicData.title}
              </h1>
              
              <img 
                src={topicData.heroImage} 
                alt="Architecture Overview" 
                className="w-full rounded-2xl border border-border mb-8 shadow-sm" 
              />

              <p className="manrope-body mb-3">
                {topicData.description}
              </p>

              <blockquote className="my-8 border-l-4 border-indigo-500 bg-indigo-50/30 py-3 px-4 rounded-r-2xl">
                <p className="inconsolata-ui m-0 font-bold text-indigo-900 text-[14px] uppercase tracking-wider mb-1">Supported Platforms:</p>
                <p className="manrope-body m-0 text-indigo-800 italic">SO-100/SO-101 (3D‑printable arms) and ALOHA manipulation systems.</p>
              </blockquote>

              {topicData.sections.map((section) => (
                <section key={section.id} id={section.id} className="mt-8">
                  <h2 className="inconsolata-ui text-[26px] font-semibold text-gray-900 mb-2 group flex items-center -ml-12">
                    <span className="text-indigo-600 opacity-0 group-hover:opacity-100 w-12 text-2xl transition-opacity">#</span>
                    {section.title}
                  </h2>
                  <p className="manrope-body mb-3">
                    {section.content}
                  </p>
                </section>
              ))}

              <h2 className="inconsolata-ui text-[26px] font-semibold text-gray-900 mt-8 mb-4 group flex items-center -ml-12">
                <span className="text-indigo-600 opacity-0 group-hover:opacity-100 w-12 text-2xl transition-opacity">#</span>
                References & Resources
              </h2>
              <ul className="manrope-body space-y-6 list-none p-0 mb-10">
                {topicData.resources.map((res, idx) => (
                  <li key={idx} className="border-b border-gray-50 pb-6 last:border-0">
                    <p className="font-bold text-gray-900 m-0 text-[18px] mb-1">{res.title}</p>
                    <p className="text-gray-500 m-0 text-[14px] font-medium">{res.provider} • {res.type}</p>
                    <Link href={res.url} target="_blank" className="inconsolata-ui text-indigo-600 text-[14px] hover:underline mt-3 inline-flex items-center gap-1.5 font-bold">
                      Explore Resource <ExternalLink className="w-4 h-4" />
                    </Link>
                  </li>
                ))}
              </ul>

              <blockquote className="my-8 border-l-4 border-amber-500 bg-amber-50/30 py-3 px-4 rounded-r-2xl">
                <p className="inconsolata-ui m-0 font-bold text-amber-900 text-[14px] uppercase tracking-wider mb-1">Performance Note:</p>
                <p className="manrope-body m-0 text-amber-800 italic">Optimized inference stack is crucial for real-time control where millisecond delays matter.</p>
              </blockquote>

            </article>

            {/* 5. Footer Navigation */}
            <footer className="inconsolata-ui mt-16 flex items-center pb-16 text-[15px] font-medium border-t border-border pt-12">
              <Link href="#" className="mr-8 flex items-center text-gray-500 hover:text-gray-900 transition-all group">
                <span className="mr-3 text-2xl group-hover:-translate-x-1 transition-transform">←</span>
                <span>Introduction to AI</span>
              </Link>
              <Link href="#" className="ml-auto flex items-center text-right text-gray-500 hover:text-gray-900 transition-all group">
                <span>Training Models</span>
                <span className="ml-3 text-2xl group-hover:translate-x-1 transition-transform">→</span>
              </Link>
            </footer>
          </div>
        </main>
      </div>

      {/* 6. AI Input */}
      <div className="fixed bottom-8 right-8 z-50 inconsolata-ui">
        <form className="shadow-2xl flex items-center justify-between rounded-2xl border border-border bg-background/90 px-5 py-1.5 backdrop-blur-xl transition-all sm:w-[360px] focus-within:ring-2 focus-within:ring-indigo-100">
          <span className="text-xl mr-3 opacity-60">💬</span>
          <input 
            required 
            type="text" 
            placeholder="Ask EulerFold AI" 
            className="flex-1 border-none bg-transparent px-1 py-3 text-[15px] text-gray-800 placeholder-gray-400 outline-none" 
          />
          <button type="submit" className="bg-sidebar p-2 rounded-full hover:bg-indigo-600 hover:text-white transition-colors group">
            <ArrowRight className="w-5 h-5 -rotate-90 group-hover:scale-110 transition-transform" />
          </button>
        </form>
      </div>

    </div>
  );
}
