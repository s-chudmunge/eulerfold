import { NextResponse } from 'next/server';

export async function GET(request: Request, { params }: { params: { credential_id: string } }) {
    try {
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/certificates/${params.credential_id}`, {
            next: { revalidate: 3600 }
        });
        
        if (!res.ok) {
            return new NextResponse('Certificate not found', { status: 404 });
        }
        
        const cert = await res.json();
        
        if (!cert.pdf_url) {
            return new NextResponse('PDF unavailable', { status: 404 });
        }
        
        const pdfRes = await fetch(cert.pdf_url);
        if (!pdfRes.ok) {
             return new NextResponse('Error fetching PDF from storage', { status: 500 });
        }
        
        const pdfBuffer = await pdfRes.arrayBuffer();
        
        // Clean filename
        const safeUserName = cert.user_name.replace(/[^a-zA-Z0-9]/g, '_');
        const filename = `${safeUserName}_EulerFold_Certificate.pdf`;
        
        return new NextResponse(pdfBuffer, {
            headers: {
                'Content-Type': 'application/pdf',
                'Content-Disposition': `inline; filename="${filename}"`
            }
        });
    } catch (e) {
        return new NextResponse('Server Error', { status: 500 });
    }
}
