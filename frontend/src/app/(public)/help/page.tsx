import React from 'react';
import { metadata } from './metadata';
import HelpClient from './HelpClient';

export { metadata };

export default function HelpPage() {
  const faqItems = [
    {
      question: 'How does the AI generate my roadmap?',
      answer: 'Our engine analyzes your goal, experience, and duration to identify high-density learning units and Resources We Trust.',
    },
    {
      question: 'How is my technical score calculated?',
      answer: 'We use an "Honest Progress" formula: 40% Project Proof (homework reviews), 30% Recall Score (practice sessions), 15% Topic Coverage (completed units), and 15% Cognitive Depth (technical difficulty).',
    },
    {
      question: 'What do the letter grades (A+, B, F) mean?',
      answer: "Grades represent your Skills You've Proven. F (<40%) is foundational exposure, C/D (40-79%) is advancing competence, and A/B (80%+) represents high proficiency and expertise.",
    },
    {
      question: 'How do I reach an A+ (100%) Confidence?',
      answer: 'To reach 100%, you typically need to complete multiple roadmaps for the same skill. The system aggregates your proof across units, rewarding you for tackling more "Advanced" (high-depth) material.',
    },
    {
      question: 'What is Submit Homework?',
      answer: 'Submit Homework is a process where specialized AI agents evaluate your Proof of Work. They verify technical quality, authentic understanding, and objective alignment to ensure your skills are industry-ready.',
    },
    {
      question: 'Can I reuse skills across different roadmaps?',
      answer: 'Yes! Our system automatically maps new topics to your existing Technical Inventory. Starting a second Python roadmap will build upon your current Python score rather than creating a duplicate.',
    },
    {
      question: 'What are EulerCoins used for?',
      answer: 'Proof of effort. Use them to unlock certifications, premium roadmaps, and profile badges.',
    },
    {
      question: 'How do Roadmap Credits work?',
      answer: 'Roadmap Credits allow you to generate full-scale, premium AI roadmaps. All users get 5 free credits upon signup. Additional credits can be purchased for ₹299 (includes 50 credits).',
    },
    {
      question: 'What is the refund policy for credits?',
      answer: 'Credits are non-refundable once they have been used to generate a roadmap. Unused credits can be refunded within 7 days of purchase. Credits never expire.',
    }
  ];

  const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "mainEntity": faqItems.map(item => ({
      "@type": "Question",
      "name": item.question,
      "acceptedAnswer": {
        "@type": "Answer",
        "text": item.answer
      }
    }))
  };

  const breadcrumbSchema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "itemListElement": [
      {
        "@type": "ListItem",
        "position": 1,
        "name": "Home",
        "item": "https://www.eulerfold.com"
      },
      {
        "@type": "ListItem",
        "position": 2,
        "name": "Help Center",
        "item": "https://www.eulerfold.com/help"
      }
    ]
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
      />
      <HelpClient />
    </>
  );
}
