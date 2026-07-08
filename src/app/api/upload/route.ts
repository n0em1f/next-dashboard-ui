// src/app/api/upload/route.ts
import { auth } from '@clerk/nextjs/server';
import { NextRequest, NextResponse } from 'next/server';
import { v2 as cloudinary } from 'cloudinary';

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  // Config INSIDE the handler — on serverless (Vercel) a module-level
  // config() can be lost between invocations, causing "Must supply api_secret".
  cloudinary.config({
    cloud_name: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
    api_key: process.env.NEXT_PUBLIC_CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
  });

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

  if (file.size > 100 * 1024 * 1024)
    return NextResponse.json(
      { error: 'File too large (max 100MB)' },
      { status: 400 },
    );

  const bytes = await file.arrayBuffer();
  const buffer = Buffer.from(bytes);
  const base64 = buffer.toString('base64');
  const mime = file.type || 'application/octet-stream';
  const dataUri = `data:${mime};base64,${base64}`;

  const isStudent = role === 'student';

  try {
    const result = await cloudinary.uploader.upload(dataUri, {
      resource_type: 'raw',
      folder: isStudent ? 'academos/submissions' : 'academos/lessons',
      public_id: `${isStudent ? 'submission' : 'lesson'}_${Date.now()}`,
      use_filename: true,
      // Pass credentials explicitly as a belt-and-braces fallback:
      // if config() somehow didn't stick, these still authenticate the call.
      api_key: process.env.NEXT_PUBLIC_CLOUDINARY_API_KEY,
      api_secret: process.env.CLOUDINARY_API_SECRET,
      cloud_name: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
    } as any);
    return NextResponse.json({ url: result.secure_url, fileName: file.name });
  } catch (err: any) {
    console.error('Cloudinary error:', err);
    return NextResponse.json(
      { error: err.message || 'Upload failed' },
      { status: 500 },
    );
  }
}
