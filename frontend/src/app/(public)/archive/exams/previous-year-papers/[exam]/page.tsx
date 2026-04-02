import React from 'react';
import { archiveData } from '../../../generatedArchiveData';
import ExamClient from './ExamClient';
import { Metadata } from 'next';

async function getExamData(examId: string) {
  return archiveData.find(c => c.id.toLowerCase() === examId.toLowerCase());
}

export async function generateMetadata({ params }: { params: { exam: string } }): Promise<Metadata> {
  const exam = await getExamData(params.exam);
  if (!exam) {
    return { 
      title: 'Exam Not Found',
      robots: {
        index: false,
        follow: false,
      }
    };
  }

  const title = `${exam.title} Previous Year Papers`;
  const description = `Download official previous year question papers and answer keys for ${exam.title}. Access our complete archive of ${exam.entries.length} items to boost your preparation.`;
  const keywords = [
    exam.title,
    'previous year papers',
    'question papers',
    'answer keys',
    'exam archive',
    'study material',
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
      url: `https://www.eulerfold.com/archive/exams/previous-year-papers/${params.exam.toLowerCase()}`,
      siteName: 'EulerFold',
    },
    twitter: {
      card: 'summary',
      title: title,
      description: description,
      creator: '@eulerfold',
    },
    alternates: {
      canonical: `https://www.eulerfold.com/archive/exams/previous-year-papers/${params.exam.toLowerCase()}`,
    },
  };
}

export default async function ExamPage({ params }: { params: { exam: string } }) {
  const exam = await getExamData(params.exam);

  if (!exam) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <h1 className="text-4xl font-black inconsolata-ui mb-4">404</h1>
          <p className="manrope-body text-gray-500 mb-8">Exam archive not found.</p>
          <a href="/archive/exams/previous-year-papers" className="bg-black dark:bg-white text-white dark:text-black px-6 py-2 rounded-full font-bold">
            Back to Archive
          </a>
        </div>
      </div>
    );
  }

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
      }
    ]
  };

  const datasetSchema = {
    "@context": "https://schema.org",
    "@type": "Dataset",
    "name": `${exam.title} Previous Year Papers Archive`,
    "description": `A comprehensive collection of previous year question papers and answer keys for ${exam.title}.`,
    "url": `https://www.eulerfold.com/archive/exams/previous-year-papers/${params.exam.toLowerCase()}`,
    "keywords": [exam.title, "Previous Year Papers", "Question Papers", "Answer Keys"],
    "creator": {
      "@type": "Organization",
      "name": "EulerFold"
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
        dangerouslySetInnerHTML={{ __html: JSON.stringify(datasetSchema) }}
      />
      <ExamClient exam={exam} />
    </>
  );
}

export async function generateStaticParams() {
  return archiveData.map((exam) => ({
    exam: exam.id.toLowerCase(),
  }));
}
