import prisma from '@/lib/prisma';
import { notFound } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';

export const dynamic = 'force-dynamic';

const AnnouncementDetailPage = async ({
  params: { id },
}: {
  params: { id: string };
}) => {
  const announcement = await prisma.announcement.findUnique({
    where: { id: parseInt(id) },
    include: { class: { select: { name: true } } },
  });

  if (!announcement) return notFound();

  return (
    <div className="p-6 flex flex-col items-center">
      <div className="w-full max-w-3xl flex flex-col gap-6">
        <Link
          href="/list/announcements"
          className="text-xs text-gray-400 hover:text-gray-600"
        >
          ← Back to Announcements
        </Link>

        <div className="bg-white rounded-2xl overflow-hidden shadow-sm">
          {announcement.img ? (
            <div className="w-full h-64 relative">
              <Image
                src={announcement.img}
                alt={announcement.title}
                fill
                className="object-cover"
              />
            </div>
          ) : (
            <div className="w-full h-48 bg-gradient-to-r from-purple-400 to-purple-600 flex items-center justify-center">
              <span className="text-white text-4xl">📢</span>
            </div>
          )}

          <div className="p-6 flex flex-col gap-4">
            <div className="flex items-start justify-between gap-4">
              <h1 className="text-2xl font-bold text-gray-800">
                {announcement.title}
              </h1>
              {announcement.class && (
                <span className="text-xs bg-purple-100 text-purple-700 px-3 py-1 rounded-full whitespace-nowrap">
                  {announcement.class.name}
                </span>
              )}
            </div>

            <div className="flex items-center gap-2 text-sm text-gray-500 border-t border-gray-100 pt-4">
              <span>📅</span>
              <span>
                {new Intl.DateTimeFormat('en-GB').format(announcement.date)}
              </span>
            </div>

            <p className="text-gray-600 leading-relaxed">
              {announcement.description}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AnnouncementDetailPage;
