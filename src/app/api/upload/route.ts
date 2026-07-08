// src/app/api/upload/route.ts
import { auth } from '@clerk/nextjs/server';
import { NextRequest, NextResponse } from 'next/server';
import { v2 as cloudinary } from 'cloudinary';

export const dynamic = 'force-dynamic';

cloudinary.config({
  cloud_name: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
  api_key: process.env.NEXT_PUBLIC_CLOUDINARY_API_KEY, // ← schimbat
  api_secret: process.env.CLOUDINARY_API_SECRET, // ← doar asta e nouă
});

export async function POST(req: NextRequest) {
  const { userId, sessionClaims } = await auth();
  if (!userId)
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const role = (sessionClaims?.metadata as { role?: string })?.role;
  if (role !== 'teacher' && role !== 'admin' && role !== 'student')
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

  const formData = await req.formData();
  const file = formData.get('file') as File | null;

  if (!file)
    return NextResponse.json({ error: 'No file provided' }, { status: 400 });

  // Teachers/admins upload lesson materials — PDF only.
  // Students submit assignments — any file type allowed.
  if (role !== 'student' && file.type !== 'application/pdf')
    return NextResponse.json(
      { error: 'Only PDF files are allowed' },
      { status: 400 },
    );

  if (file.size > 50 * 1024 * 1024)
    return NextResponse.json(
      { error: 'File too large (max 50MB)' },
      { status: 400 },
    );

  const bytes = await file.arrayBuffer();
  const buffer = Buffer.from(bytes);
  const base64 = buffer.toString('base64');
  // folosește tipul real al fișierului (nu forța application/pdf)
  const mime = file.type || 'application/octet-stream';
  const dataUri = `data:${mime};base64,${base64}`;

  const isStudent = role === 'student';

  try {
    const result = await cloudinary.uploader.upload(dataUri, {
      resource_type: 'raw', // 'raw' merge pentru orice tip de fișier
      folder: isStudent ? 'academos/submissions' : 'academos/lessons',
      public_id: `${isStudent ? 'submission' : 'lesson'}_${Date.now()}`,
      // NU mai punem `format: 'pdf'` — păstrează extensia originală
      use_filename: true,
    });
    return NextResponse.json({ url: result.secure_url, fileName: file.name });
  } catch (err: any) {
    console.error('Cloudinary error:', err);
    return NextResponse.json(
      { error: err.message || 'Upload failed' },
      { status: 500 },
    );
  }
}
