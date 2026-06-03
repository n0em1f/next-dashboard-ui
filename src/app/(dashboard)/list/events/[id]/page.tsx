import prisma from '@/lib/prisma';
import { notFound } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';

export const dynamic = 'force-dynamic';

const EventDetailPage = async ({
  params: { id },
}: {
  params: { id: string };
}) => {
  const event = await prisma.event.findUnique({
    where: { id: parseInt(id) },
    include: { class: { select: { name: true } } },
  });

  if (!event) return notFound();

  return (
    <div className="p-6 flex flex-col items-center">
      <div className="w-full max-w-3xl flex flex-col gap-6">
        <Link href="/list/events" className="text-xs text-gray-400 hover:text-gray-600">
          ← Back to Events
        </Link>

        <div className="bg-white rounded-2xl overflow-hidden shadow-sm">
          {event.img ? (
            <div className="w-full h-64 relative">
              <Image src={event.img} alt={event.title} fill className="object-cover" />
            </div>
          ) : (
            <div className="w-full h-48 bg-gradient-to-r from-blue-400 to-blue-600 flex items-center justify-center">
              <span className="text-white text-4xl">📅</span>
            </div>
          )}

          <div className="p-6 flex flex-col gap-4">
            <div className="flex items-start justify-between gap-4">
              <h1 className="text-2xl font-bold text-gray-800">{event.title}</h1>
              {event.class && (
                <span className="text-xs bg-blue-100 text-blue-700 px-3 py-1 rounded-full whitespace-nowrap">
                  {event.class.name}
                </span>
              )}
            </div>

            <div className="flex flex-wrap gap-4 text-sm text-gray-500 border-t border-gray-100 pt-4">
              <div className="flex items-center gap-2">
                <span>📅</span>
                <span>{new Intl.DateTimeFormat('en-GB').format(event.startTime)}</span>
              </div>
              <div className="flex items-center gap-2">
                <span>🕐</span>
                <span>
                  {event.startTime.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })}
                  {' – '}
                  {event.endTime.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })}
                </span>
              </div>
            </div>

            <p className="text-gray-600 leading-relaxed">{event.description}</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EventDetailPage;