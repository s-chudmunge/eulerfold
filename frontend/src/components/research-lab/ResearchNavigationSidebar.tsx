"use client";

import React, { useState } from 'react';
import Link from 'next/link';
import { ChevronDown, ChevronRight, Menu, X, BookOpen } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { navigation } from '@/app/research-decoded/generatedData';

interface Props {
  currentSlug?: string;
  isInline?: boolean;
  hideTrigger?: boolean;
}

export default function ResearchNavigationSidebar({ currentSlug, isInline = false, hideTrigger = false }: Props) {
  const [isOpen, setIsOpen] = useState(false);
  const [expandedCategories, setExpandedCategories] = useState<Record<string, boolean>>({});

  const toggleCategory = (id: string) => {
    setExpandedCategories(prev => ({
      ...prev,
      [id]: !prev[id]
    }));
  };

  return (
    <>
      {/* Menu Trigger Button */}
      {!hideTrigger && (
        <button 
          onClick={() => setIsOpen(true)}
          className={`${isInline ? 'mb-4' : 'fixed top-24 left-6 z-[90]'} p-1 bg-background border border-border shadow-sm rounded-md hover:bg-accent/5 transition-colors group flex items-center gap-1`}
          title="Open Library Navigation"
        >
          <Menu className="w-3.5 h-3.5 text-text-muted group-hover:text-accent transition-colors" />
          <span className="text-[9px] font-bold uppercase tracking-widest text-text-muted group-hover:text-accent hidden md:inline">Library</span>
        </button>
      )}

      <AnimatePresence>
        {isOpen && (
          <>
            {/* Backdrop */}
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsOpen(false)}
              className="fixed inset-0 bg-black/20 backdrop-blur-[2px] z-[150]"
            />

            {/* Sidebar Panel */}
            <motion.div 
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="fixed top-0 left-0 bottom-0 w-[320px] bg-background border-r border-border z-[160] shadow-2xl flex flex-col"
            >
              {/* Header */}
              <div className="p-4 border-b border-border flex items-center justify-end bg-surface/30">
                <button 
                  onClick={() => setIsOpen(false)}
                  className="p-2 hover:bg-accent/10 rounded-full transition-colors"
                >
                  <X className="w-5 h-5 text-text-muted" />
                </button>
              </div>

              {/* Navigation Content */}
              <nav className="flex-1 overflow-y-auto p-4 custom-scrollbar">
                <div className="space-y-2">
                  {navigation.map((category) => (
                    <div key={category.id} className="border-b border-border/40 last:border-0 pb-2 mb-2">
                      <button 
                        onClick={() => toggleCategory(category.id)}
                        className="w-full flex items-center justify-between p-2 hover:bg-accent/5 rounded-md transition-colors text-left group"
                      >
                        <span className="text-[13px] font-bold text-text-heading group-hover:text-accent transition-colors uppercase tracking-wide">
                          {category.title}
                        </span>
                        {expandedCategories[category.id] ? (
                          <ChevronDown className="w-4 h-4 text-text-muted" />
                        ) : (
                          <ChevronRight className="w-4 h-4 text-text-muted" />
                        )}
                      </button>

                      <AnimatePresence>
                        {expandedCategories[category.id] && (
                          <motion.div 
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: 'auto', opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            className="overflow-hidden"
                          >
                            <div className="pl-2 mt-1 space-y-1 border-l border-accent/20 ml-2">
                              {category.sections.map((section) => (
                                <Link 
                                  key={section.slug}
                                  href={`/research-decoded/${section.slug}`}
                                  onClick={() => setIsOpen(false)}
                                  className={`block p-2 text-[13px] rounded-md transition-all ${
                                    currentSlug === section.slug 
                                      ? "bg-accent/10 text-accent font-bold" 
                                      : "text-text-primary hover:bg-accent/5 hover:text-accent font-medium"
                                  }`}
                                >
                                  {section.title}
                                </Link>
                              ))}
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  ))}
                </div>
              </nav>

              {/* Footer */}
              <div className="p-4 border-t border-border bg-surface/50">
                <Link 
                  href="/research-decoded"
                  onClick={() => setIsOpen(false)}
                  className="flex items-center justify-center gap-2 p-2 w-full bg-accent text-white rounded-lg font-bold text-[12px] hover:opacity-90 transition-all uppercase tracking-widest"
                >
                  Browse Full Index
                </Link>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      <style jsx global>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: var(--border);
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: var(--accent);
        }
      `}</style>
    </>
  );
}
