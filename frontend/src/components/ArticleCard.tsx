"use client";

import React from 'react';
import Link from 'next/link';
import { Article } from '@/app/articles/generatedArticles';

interface ArticleCardProps {
  article: Article;
  variant?: 'horizontal' | 'vertical';
}

export default function ArticleCard({ article, variant = 'horizontal' }: ArticleCardProps) {
  if (variant === 'vertical') {
    return (
      <Link 
        href={`/articles/${article.slug}`}
        className="group flex flex-col bg-card border border-border rounded-2xl overflow-hidden hover:shadow-lg transition-all duration-300 h-full"
      >
        <div className="aspect-[16/9] overflow-hidden shrink-0">
          <img 
            src={article.heroImage} 
            alt={article.title} 
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
          />
        </div>
        <div className="p-5 flex flex-col flex-grow justify-between overflow-hidden">
          <div>
            <span className="text-[10px] font-bold text-accent uppercase tracking-widest mb-2 inconsolata-ui block">
              {article.category}
            </span>
            <h3 className="text-[19px] font-bold text-text-heading mb-2 leading-tight group-hover:text-accent transition-colors font-inter tracking-tight line-clamp-2">
              {article.title}
            </h3>
            <p className="text-text-muted text-[14px] line-clamp-3 font-inter leading-relaxed mb-4">
              {article.excerpt}
            </p>
          </div>
          <div className="mt-auto pt-4 border-t border-border/50 flex items-center justify-between text-[11px] text-text-muted opacity-70 font-bold inconsolata-ui uppercase tracking-wider">
            <span className="truncate pr-4">By {article.author}</span>
            <span className="shrink-0">{article.date}</span>
          </div>
        </div>
      </Link>
    );
  }

  // Horizontal variant (matching Articles Index Page)
  return (
    <Link 
      href={`/articles/${article.slug}`}
      className="group bg-card border border-border rounded-2xl overflow-hidden hover:shadow-lg transition-all duration-300 flex flex-col md:flex-row h-auto md:h-[180px]"
    >
      <div className="w-full md:w-[180px] h-[180px] md:h-full overflow-hidden shrink-0">
        <img 
          src={article.heroImage} 
          alt={article.title} 
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
        />
      </div>
      <div className="p-5 flex flex-col flex-grow justify-between overflow-hidden">
        <div>
          <span className="text-[10px] font-bold text-accent uppercase tracking-widest mb-1.5 inconsolata-ui block">
            {article.category}
          </span>
          <h2 className="text-[19px] font-bold text-text-heading mb-2 leading-tight group-hover:text-accent transition-colors font-inter tracking-tight line-clamp-1">
            {article.title}
          </h2>
          <p className="text-text-muted text-[14px] line-clamp-2 font-inter leading-snug">
            {article.excerpt}
          </p>
        </div>
        <div className="mt-4 flex items-center justify-between text-[11px] text-text-muted opacity-70 font-bold inconsolata-ui uppercase tracking-wider">
          <span className="truncate pr-4">By {article.author}</span>
          <span className="shrink-0">{article.date}</span>
        </div>
      </div>
    </Link>
  );
}
