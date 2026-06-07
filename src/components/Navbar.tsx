import { UserButton } from '@clerk/nextjs';
import { currentUser } from '@clerk/nextjs/server';
import Image from 'next/image';
import Link from 'next/link';
import prisma from '@/lib/prisma';
import { auth } from '@clerk/nextjs/server';
import NotificationsDropdown from './NotificationsDropdown';
import GlobalSearch from './GlobalSearch';

export const dynamic = 'force-dynamic';

const Navbar = async () => {
  const user = await currentUser();
  const { userId } = await auth();

  const unreadCount = userId
    ? await prisma.message.count({
        where: {
          read: false,
          senderId: { not: userId },
          conversation: {
            members: { some: { userId } },
          },
        },
      })
    : 0;

  const announcements = await prisma.announcement.findMany({
    orderBy: { date: 'desc' },
    take: 5,
    select: { id: true, title: true, description: true, date: true },
  });

  const events = await prisma.event.findMany({
    where: { startTime: { gte: new Date() } },
    orderBy: { startTime: 'asc' },
    take: 5,
    select: { id: true, title: true, description: true, startTime: true },
  });

  const readNotifications = userId
    ? await prisma.notificationRead.findMany({
        where: { userId },
        select: { itemId: true, itemType: true },
      })
    : [];

  const readAnnouncementIds = new Set(
    readNotifications
      .filter(
        (n: { itemId: number; itemType: string }) =>
          n.itemType === 'announcement',
      )
      .map((n: { itemId: number; itemType: string }) => n.itemId),
  );

  const readEventIds = new Set(
    readNotifications
      .filter(
        (n: { itemId: number; itemType: string }) => n.itemType === 'event',
      )
      .map((n: { itemId: number; itemType: string }) => n.itemId),
  );

  const unreadNotificationsCount =
    announcements.filter((a) => !readAnnouncementIds.has(a.id)).length +
    events.filter((e) => !readEventIds.has(e.id)).length;

  const serializedAnnouncements = announcements.map((a) => ({
    ...a,
    date: a.date.toISOString(),
    isRead: readAnnouncementIds.has(a.id),
  }));

  const serializedEvents = events.map((e) => ({
    ...e,
    startTime: e.startTime.toISOString(),
    isRead: readEventIds.has(e.id),
  }));

  return (
    <div className="flex items-center justify-between p-4 relative z-50">
      {/* GLOBAL SEARCH */}
      <GlobalSearch />

      {/* ICONS AND USER */}
      <div className="flex items-center gap-6 justify-end w-full">
        <Link href="/list/messages">
          <div className="relative bg-white/10 rounded-full w-7 h-7 flex items-center justify-center cursor-pointer hover:bg-white/20 transition-colors">
            <Image
              src="/message.png"
              alt=""
              width={20}
              height={20}
              className="opacity-80"
            />
            {unreadCount > 0 && (
              <div className="absolute -top-3 -right-3 w-5 h-5 flex items-center justify-center bg-red-500 text-white rounded-full text-xs font-bold">
                {unreadCount > 99 ? '99+' : unreadCount}
              </div>
            )}
          </div>
        </Link>

        <NotificationsDropdown
          announcements={serializedAnnouncements}
          events={serializedEvents}
          unreadCount={unreadNotificationsCount}
          currentUserId={userId || ''}
        />

        <div className="flex flex-col">
          <span className="text-xs leading-3 font-medium text-white">
            {user?.firstName} {user?.lastName}
          </span>
          <span className="text-[10px] text-white/50 text-right">
            {user?.publicMetadata.role as string}
          </span>
        </div>
        <UserButton />
      </div>
    </div>
  );
};

export default Navbar;
