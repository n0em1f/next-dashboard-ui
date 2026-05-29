import prisma from '@/lib/prisma';
import { auth } from '@clerk/nextjs/server';
import Link from 'next/link';

export const dynamic = 'force-dynamic';

const Announcements = async () => {
  const { userId, sessionClaims } = await auth();
  const role = (sessionClaims?.metadata as { role?: string })?.role;

  const roleConditions = {
    teacher: { lessons: { some: { teacherId: userId! } } },
    student: { students: { some: { id: userId! } } },
    parent: { students: { some: { parentId: userId! } } },
  };

  const data = await prisma.announcement.findMany({
    take: 3,
    orderBy: { date: 'desc' },
    where: {
      ...(role !== 'admin' && {
        OR: [
          { classId: null },
          { class: roleConditions[role as keyof typeof roleConditions] || {} },
        ],
      }),
    },
  });

  // Culorile de fundal pentru cele 3 anunțuri
  const bgColors = [
    'bg-lamaSkyLight',
    'bg-lamaPurpleLight',
    'bg-lamaYellowLight',
  ];

  return (
    <div className="bg-white p-4 rounded-md">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold">Announcements</h1>
        <Link
          href="/list/announcements"
          className="text-xs text-gray-400 hover:text-gray-600 transition-colors"
        >
          View All
        </Link>
      </div>
      <div className="flex flex-col gap-4 mt-4">
        {data.map((item, index) => (
          <div
            key={item.id}
            className={`${bgColors[index % bgColors.length]} rounded-md p-4`}
          >
            <div className="flex items-center justify-between">
              <h2 className="font-medium">{item.title}</h2>
              {/* suppressHydrationWarning oprește crash-ul din browser cauzat de diferențele de fus orar dintre serverul Vercel și laptop */}
              <span
                suppressHydrationWarning
                className="text-xs text-gray-400 bg-white rounded-md px-1 py-1"
              >
                {new Date(item.date).toLocaleDateString('ro-RO')}
              </span>
            </div>
            <p className="text-sm text-gray-400 mt-1">{item.description}</p>
          </div>
        ))}
        {data.length === 0 && (
          <p className="text-sm text-gray-400 text-center py-4">
            Nu există anunțuri recente.
          </p>
        )}
      </div>
    </div>
  );
};

export default Announcements;
