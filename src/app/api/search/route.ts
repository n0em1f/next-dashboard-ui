// src/app/api/search/route.ts
import { auth } from '@clerk/nextjs/server';
import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  const { userId, sessionClaims } = await auth();
  if (!userId) return NextResponse.json([], { status: 401 });

  const role = (sessionClaims?.metadata as { role?: string })?.role;
  const q = req.nextUrl.searchParams.get('q') || '';

  if (!q.trim()) return NextResponse.json([]);

  const contains = { contains: q, mode: 'insensitive' as const };

  const [lessons, subjects, teachers, students, events, announcements] =
    await Promise.all([
      // Lessons
      prisma.lesson.findMany({
        where: {
          OR: [{ name: contains }, { subject: { name: contains } }],
          ...(role === 'teacher' ? { teacherId: userId } : {}),
          ...(role === 'student'
            ? {
                class: {
                  students: { some: { id: userId } },
                },
              }
            : {}),
        },
        include: {
          subject: { select: { name: true } },
          class: { select: { name: true } },
        },
        take: 5,
      }),

      // Subjects
      prisma.subject.findMany({
        where: {
          name: contains,
          ...(role === 'teacher' ? { teachers: { some: { id: userId } } } : {}),
        },
        take: 5,
      }),

      // Teachers (doar admin vede)
      role === 'admin'
        ? prisma.teacher.findMany({
            where: {
              OR: [{ name: contains }, { surname: contains }],
            },
            take: 5,
          })
        : Promise.resolve([]),

      // Students
      role === 'admin' || role === 'teacher'
        ? prisma.student.findMany({
            where: {
              OR: [{ name: contains }, { surname: contains }],
              ...(role === 'teacher'
                ? { class: { lessons: { some: { teacherId: userId } } } }
                : {}),
            },
            include: { class: { select: { name: true } } },
            take: 5,
          })
        : Promise.resolve([]),

      // Events
      prisma.event.findMany({
        where: { title: contains },
        take: 5,
      }),

      // Announcements
      prisma.announcement.findMany({
        where: { title: contains },
        take: 5,
      }),
    ]);

  const results = [
    {
      category: 'Lessons',
      items: lessons.map((l) => ({
        id: l.id,
        label: l.name,
        sub: `${l.subject.name} · ${l.class.name}`,
        href: `/list/lessons`,
      })),
    },
    {
      category: 'Subjects',
      items: subjects.map((s) => ({
        id: s.id,
        label: s.name,
        href: `/list/subjects`,
      })),
    },
    {
      category: 'Teachers',
      items: (teachers as any[]).map((t) => ({
        id: t.id,
        label: `${t.name} ${t.surname}`,
        href: `/list/teachers/${t.id}`,
      })),
    },
    {
      category: 'Students',
      items: (students as any[]).map((s) => ({
        id: s.id,
        label: `${s.name} ${s.surname}`,
        sub: s.class?.name,
        href: `/list/students/${s.id}`,
      })),
    },
    {
      category: 'Events',
      items: events.map((e) => ({
        id: e.id,
        label: e.title,
        href: `/list/events/${e.id}`,
      })),
    },
    {
      category: 'Announcements',
      items: announcements.map((a) => ({
        id: a.id,
        label: a.title,
        href: `/list/announcements/${a.id}`,
      })),
    },
  ].filter((g) => g.items.length > 0);

  return NextResponse.json(results);
}
