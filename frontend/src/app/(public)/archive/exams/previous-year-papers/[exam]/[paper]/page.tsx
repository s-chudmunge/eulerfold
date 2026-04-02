import React from 'react';
import { archiveData } from '../../../../generatedArchiveData';
import PaperClient from './PaperClient';
import { Metadata } from 'next';

async function getPaperData(examId: string, paperSlug: string) {
  const exam = archiveData.find(c => c.id.toLowerCase() === examId.toLowerCase());
  if (!exam) return null;
  const paper = exam.entries.find(p => p.slug === paperSlug);
  if (!paper) return null;
  return { exam, paper };
}

export async function generateMetadata({ params }: { params: { exam: string, paper: string } }): Promise<Metadata> {
  const data = await getPaperData(params.exam, params.paper);
  if (!data) {
    return { 
      title: 'Paper Not Found',
      robots: {
        index: false,
        follow: false,
      }
    };
  }

  const { exam, paper } = data;
  const paperName = `${exam.title} ${paper.subject === 'Main Paper' ? 'Paper' : paper.subject} ${paper.year}`;
  const title = `${paperName} Archive`;
  const description = `Access and download the official ${paperName} question paper and answer key. Essential study resource from the EulerFold ${exam.title} archive.`;
  const keywords = [
    exam.title,
    paper.subject,
    paper.year,
    'previous year paper',
    'question paper',
    'answer key',
    'solutions',
    'EulerFold'
  ].join(', ');

  return {
    title: title,
    description: description,
    keywords: keywords,
    openGraph: {
      title: title,
      description: description,
      type: 'website',
      url: `https://www.eulerfold.com/archive/exams/previous-year-papers/${params.exam.toLowerCase()}/${params.paper}`,
      siteName: 'EulerFold',
    },
    twitter: {
      card: 'summary',
      title: title,
      description: description,
      creator: '@eulerfold',
    },
    alternates: {
      canonical: `https://www.eulerfold.com/archive/exams/previous-year-papers/${params.exam.toLowerCase()}/${params.paper}`,
    },
  };
}

export default async function PaperPage({ params }: { params: { exam: string, paper: string } }) {
  const data = await getPaperData(params.exam, params.paper);

  if (!data) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <h1 className="text-4xl font-black inconsolata-ui mb-4">404</h1>
          <p className="manrope-body text-gray-500 mb-8">Paper not found in archive.</p>
          <a href="/archive/exams/previous-year-papers" className="bg-black dark:bg-white text-white dark:text-black px-6 py-2 rounded-full font-bold">
            Back to Archive
          </a>
        </div>
      </div>
    );
  }

  const { exam, paper } = data;
  const paperName = `${exam.title} ${paper.subject === 'Main Paper' ? 'Paper' : paper.subject} ${paper.year}`;

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
        "name": "Archive",
        "item": "https://www.eulerfold.com/archive/exams/previous-year-papers"
      },
      {
        "@type": "ListItem",
        "position": 3,
        "name": exam.title,
        "item": `https://www.eulerfold.com/archive/exams/previous-year-papers/${params.exam.toLowerCase()}`
      },
      {
        "@type": "ListItem",
        "position": 4,
        "name": paperName,
        "item": `https://www.eulerfold.com/archive/exams/previous-year-papers/${params.exam.toLowerCase()}/${params.paper}`
      }
    ]
  };

  const paperSchema = {
    "@context": "https://schema.org",
    "@type": "CreativeWork",
    "name": paperName,
    "description": `Official question paper and answer key for ${paperName}.`,
    "datePublished": paper.year,
    "genre": "Educational",
    "educationalUse": "Assessment",
    "publisher": {
      "@type": "Organization",
      "name": "EulerFold"
    },
    "mainEntityOfPage": {
      "@type": "WebPage",
      "@id": `https://www.eulerfold.com/archive/exams/previous-year-papers/${params.exam.toLowerCase()}/${params.paper}`
    }
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(paperSchema) }}
      />
      <PaperClient exam={exam} paper={paper} />
    </>
  );
}

export async function generateStaticParams() {
  const params: { exam: string, paper: string }[] = [];
  
  archiveData.forEach(exam => {
    exam.entries.forEach(paper => {
      params.push({
        exam: exam.id.toLowerCase(),
        paper: paper.slug
      });
    });
  });

  return params;
}
