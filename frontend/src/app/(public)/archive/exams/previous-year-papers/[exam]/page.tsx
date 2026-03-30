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

  return {
    title: `${exam.title} Previous Year Papers`,
    description: `Download previous year question papers and answer keys for ${exam.title}. Access the complete archive of ${exam.entries.length} items.`,
    alternates: {
      canonical: `/archive/exams/previous-year-papers/${params.exam.toLowerCase()}`,
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

  return <ExamClient exam={exam} />;
}

export async function generateStaticParams() {
  return archiveData.map((exam) => ({
    exam: exam.id.toLowerCase(),
  }));
}
