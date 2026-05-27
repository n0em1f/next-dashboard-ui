'use client';

import { useState, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { markNotificationRead } from '@/lib/notificationActions';

type Announcement = {
  id: number;
  title: string;
  description: string;
  date: string;
  isRead: boolean;
};

type Event = {
  id: number;
  title: string;
  description: string;
  startTime: string;
  isRead: boolean;
};

const NotificationsDropdown = ({
  announcements,
  events,
  unreadCount,
  currentUserId,
}: {
  announcements: Announcement[];
  events: Event[];
  unreadCount: number;
  currentUserId: string;
}) => {
  const [open, setOpen] = useState(false);
  const [position, setPosition] = useState({ top: 0, right: 0 });
  const [mounted, setMounted] = useState(false);
  const [localUnread, setLocalUnread] = useState(unreadCount);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const router = useRouter();

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    setLocalUnread(unreadCount);
  }, [unreadCount]);

  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      const target = e.target as Node;
      const dropdown = document.getElementById('notifications-dropdown');
      if (
        buttonRef.current &&
        !buttonRef.current.contains(target) &&
        dropdown &&
        !dropdown.contains(target)
      ) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  const handleToggle = () => {
    if (!open && buttonRef.current) {
      const rect = buttonRef.current.getBoundingClientRect();
      setPosition({
        top: rect.bottom + window.scrollY + 8,
        right: window.innerWidth - rect.right,
      });
    }
    setOpen(!open);
  };

  const handleAnnouncementClick = async (id: number) => {
    if (currentUserId) {
      await markNotificationRead({
        userId: currentUserId,
        itemId: id,
        itemType: 'announcement',
      });
      setLocalUnread((prev) => Math.max(0, prev - 1));
      router.refresh();
    }
    setOpen(false);
  };

  const handleEventClick = async (id: number) => {
    if (currentUserId) {
      await markNotificationRead({
        userId: currentUserId,
        itemId: id,
        itemType: 'event',
      });
      setLocalUnread((prev) => Math.max(0, prev - 1));
      router.refresh();
    }
    setOpen(false);
  };

  const formatDate = (isoString: string) => {
    return new Date(isoString).toLocaleDateString('ro-RO', {
      day: '2-digit',
      month: 'short',
    });
  };

  const dropdown =
    open && mounted ? (
      <div
        id="notifications-dropdown"
        style={{
          position: 'fixed',
          top: position.top,
          right: position.right,
          zIndex: 99999,
          width: '320px',
        }}
        className="bg-white rounded-xl shadow-2xl overflow-hidden border border-gray-100"
      >
        <div className="p-4 border-b border-gray-100 flex items-center justify-between">
          <h3 className="font-bold text-gray-800">Notifications</h3>
          {localUnread > 0 && (
            <span className="text-xs bg-purple-100 text-purple-600 px-2 py-0.5 rounded-full font-medium">
              {localUnread} unread
            </span>
          )}
        </div>

        <div className="max-h-96 overflow-y-auto">
          {/* Announcements */}
          {announcements.length > 0 && (
            <div>
              <div className="px-4 py-2 bg-gray-50 text-xs font-semibold text-gray-500 uppercase tracking-wide">
                Announcements
              </div>
              {announcements.map((a) => (
                <Link
                  key={a.id}
                  href="/list/announcements"
                  onClick={() => handleAnnouncementClick(a.id)}
                  className={`flex items-start gap-3 p-4 hover:bg-gray-50 transition-colors border-b border-gray-50 ${!a.isRead ? 'bg-purple-50/50' : ''}`}
                >
                  <div className="relative w-8 h-8 rounded-full bg-purple-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <Image
                      src="/announcement.png"
                      alt=""
                      width={16}
                      height={16}
                      className="opacity-60"
                    />
                    {!a.isRead && (
                      <div className="absolute -top-1 -right-1 w-3 h-3 bg-purple-500 rounded-full border-2 border-white" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p
                      className={`text-sm truncate ${!a.isRead ? 'font-semibold text-gray-900' : 'font-medium text-gray-700'}`}
                    >
                      {a.title}
                    </p>
                    <p className="text-xs text-gray-400 truncate mt-0.5">
                      {a.description}
                    </p>
                    <p className="text-xs text-purple-400 mt-1">
                      {formatDate(a.date)}
                    </p>
                  </div>
                </Link>
              ))}
            </div>
          )}

          {/* Events */}
          {events.length > 0 && (
            <div>
              <div className="px-4 py-2 bg-gray-50 text-xs font-semibold text-gray-500 uppercase tracking-wide">
                Upcoming Events
              </div>
              {events.map((e) => (
                <Link
                  key={e.id}
                  href="/list/events"
                  onClick={() => handleEventClick(e.id)}
                  className={`flex items-start gap-3 p-4 hover:bg-gray-50 transition-colors border-b border-gray-50 ${!e.isRead ? 'bg-blue-50/50' : ''}`}
                >
                  <div className="relative w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <Image
                      src="/calendar.png"
                      alt=""
                      width={16}
                      height={16}
                      className="opacity-60"
                    />
                    {!e.isRead && (
                      <div className="absolute -top-1 -right-1 w-3 h-3 bg-blue-500 rounded-full border-2 border-white" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p
                      className={`text-sm truncate ${!e.isRead ? 'font-semibold text-gray-900' : 'font-medium text-gray-700'}`}
                    >
                      {e.title}
                    </p>
                    <p className="text-xs text-gray-400 truncate mt-0.5">
                      {e.description}
                    </p>
                    <p className="text-xs text-blue-400 mt-1">
                      {formatDate(e.startTime)}
                    </p>
                  </div>
                </Link>
              ))}
            </div>
          )}

          {announcements.length === 0 && events.length === 0 && (
            <div className="flex flex-col items-center justify-center py-8 text-gray-400 gap-2">
              <p className="text-sm">No notifications</p>
            </div>
          )}
        </div>

        <div className="p-3 border-t border-gray-100 flex gap-2">
          <Link
            href="/list/announcements"
            onClick={() => setOpen(false)}
            className="flex-1 text-center text-xs text-purple-500 hover:text-purple-700 transition-colors py-1"
          >
            All announcements
          </Link>
          <Link
            href="/list/events"
            onClick={() => setOpen(false)}
            className="flex-1 text-center text-xs text-blue-500 hover:text-blue-700 transition-colors py-1"
          >
            All events
          </Link>
        </div>
      </div>
    ) : null;

  return (
    <>
      <button
        ref={buttonRef}
        onClick={handleToggle}
        className="bg-white/10 rounded-full w-7 h-7 flex items-center justify-center cursor-pointer relative hover:bg-white/20 transition-colors"
      >
        <Image
          src="/announcement.png"
          alt=""
          width={20}
          height={20}
          className="opacity-80"
        />
        {localUnread > 0 && (
          <div className="absolute -top-3 -right-3 w-5 h-5 flex items-center justify-center bg-purple-500 text-white rounded-full text-xs font-bold">
            {localUnread > 99 ? '99+' : localUnread}
          </div>
        )}
      </button>
      {mounted && createPortal(dropdown, document.body)}
    </>
  );
};

export default NotificationsDropdown;
