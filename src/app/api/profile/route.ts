// src/app/api/profile/route.ts
import { auth } from '@clerk/nextjs/server';
import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function POST(req: NextRequest) {
  const { userId, sessionClaims } = await auth();
  if (!userId)
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const role = (sessionClaims?.metadata as { role?: string })?.role;
  if (role !== 'teacher' && role !== 'student')
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

  const { description, img } = await req.json();

  try {
    if (role === 'teacher') {
      await prisma.teacher.update({
        where: { id: userId },
        data: {
          ...(description !== undefined && { description }),
          ...(img && { img }),
        },
      });
    } else if (role === 'student') {
      await prisma.student.update({
        where: { id: userId },
        data: {
          ...(description !== undefined && { description }),
          ...(img && { img }),
        },
      });
    }

    return NextResponse.json({ success: true });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
