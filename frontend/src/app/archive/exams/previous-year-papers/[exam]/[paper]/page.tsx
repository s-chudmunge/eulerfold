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
  if (!data) return { title: 'Paper Not Found' };

  const { exam, paper } = data;
  const paperName = `${exam.title} ${paper.subject === 'Main Paper' ? 'Paper' : paper.subject} ${paper.year}`;

  return {
    title: `${paperName} - EulerFold Archive`,
    description: `Access and download the ${paperName} question paper and answer key. Part of the EulerFold complete archive for ${exam.title}.`,
    alternates: {
      canonical: `/archive/exams/previous-year-papers/${params.exam.toLowerCase()}/${params.paper}`,
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

  return <PaperClient exam={data.exam} paper={data.paper} />;
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
