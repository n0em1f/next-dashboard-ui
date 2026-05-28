import { UserButton } from '@clerk/nextjs';
import { currentUser } from '@clerk/nextjs/server';
import Image from 'next/image';
import Link from 'next/link';
import prisma from '@/lib/prisma';
import { auth } from '@clerk/nextjs/server';
import NotificationsDropdown from './NotificationsDropdown';

export const dynamic = 'force-dynamic';

const Navbar = async () => {
  const user = await currentUser();
  const { userId } = await auth();

  // Mesaje necitite
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

  // Toate anunturile si evenimentele
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

  // Ce a citit userul deja
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

  // Serializam datele
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
      {/* SEARCH BAR */}
      <div className="hidden md:flex items-center gap-2 text-xs rounded-full ring-[1.5px] ring-white/30 px-2 bg-white/10">
        <Image
          src="/search.png"
          alt=""
          width={14}
          height={14}
          className="opacity-70"
        />
        <input
          type="text"
          placeholder="Search..."
          className="w-[200px] p-2 bg-transparent outline-none text-white placeholder-white/40 text-sm"
        />
      </div>

      {/* ICONS AND USER */}
      <div className="flex items-center gap-6 justify-end w-full">
        {/* Messages */}
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

        {/* Notifications */}
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
