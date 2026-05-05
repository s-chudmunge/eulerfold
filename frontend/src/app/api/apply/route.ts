import { Resend } from 'resend';
import { NextResponse } from 'next/server';

const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    
    const name = formData.get('name') as string;
    const email = formData.get('email') as string;
    const role = formData.get('role') as string;
    const portfolio = formData.get('portfolio') as string;
    const why = formData.get('why') as string;
    const cvFile = formData.get('cv') as File;

    if (!name || !email || !role || !cvFile) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // Convert file to array buffer and then to base64
    const arrayBuffer = await cvFile.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    const { data, error } = await resend.emails.send({
      from: 'EulerFold Careers <admin@eulerfold.com>',
      to: 'eulerfold@gmail.com',
      subject: `New Application: ${role} - ${name}`,
      text: `
        Name: ${name}
        Email: ${email}
        Role: ${role}
        Portfolio/GitHub: ${portfolio || 'N/A'}
        
        Why EulerFold?:
        ${why || 'N/A'}
      `,
      attachments: [
        {
          filename: cvFile.name,
          content: buffer,
        },
      ],
    });

    if (error) {
      console.error('Resend error:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true, data });
  } catch (error: any) {
    console.error('Application submission error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
