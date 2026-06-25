import { redirect, notFound } from 'next/navigation';
import { Metadata, ResolvingMetadata } from 'next';

// Define the expected API response
interface Certificate {
    id: string;
    credential_id: string;
    grade: string;
    average_score: number;
    time_invested_hours: number;
    pdf_url: string;
    issued_at: string;
    roadmap_title: string;
    user_name: string;
}

async function getCertificate(credential_id: string): Promise<Certificate | null> {
    try {
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/certificates/${credential_id}`, {
            next: { revalidate: 3600 } // Cache for 1 hour
        });
        if (!res.ok) {
            return null;
        }
        return res.json();
    } catch (e) {
        return null;
    }
}

type Props = {
    params: { credential_id: string }
};

export async function generateMetadata(
    { params }: Props,
    parent: ResolvingMetadata
): Promise<Metadata> {
    const cert = await getCertificate(params.credential_id);
    if (!cert) {
        return { title: 'Certificate Not Found' };
    }
    return {
        title: `${cert.user_name}'s Certificate in ${cert.roadmap_title} | EulerFold`,
        description: `Official EulerFold Certificate awarded to ${cert.user_name} for completing ${cert.roadmap_title}.`,
    };
}

export default async function CertificatePage({ params }: Props) {
    const cert = await getCertificate(params.credential_id);

    if (!cert) {
        notFound();
    }

    if (cert.pdf_url) {
        redirect(`/certificates/${cert.credential_id}/pdf`);
    }

    // Fallback if PDF generation/upload failed
    return (
        <div className="flex items-center justify-center min-h-screen bg-gray-50">
            <div className="text-center p-8 bg-white shadow-xl rounded-xl border border-gray-100 max-w-md mx-auto">
                <h1 className="text-2xl font-bold text-gray-900 mb-2">PDF Unavailable</h1>
                <p className="text-gray-600">
                    The PDF for this certificate could not be found or is still generating. Please ensure the 'certificates' storage bucket is correctly configured.
                </p>
            </div>
        </div>
    );
}
