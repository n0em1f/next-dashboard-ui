'use client';

import { useClerk } from '@clerk/nextjs';
import Image from 'next/image';

export const dynamic = 'force-dynamic';

const LogoutButton = () => {
  const { signOut } = useClerk();

  return (
    <button
      onClick={() => signOut({ redirectUrl: '/sign-in' })}
      className="flex items-center justify-center lg:justify-start gap-4 text-white/80 py-2 md:px-2 rounded-md hover:bg-white/10 hover:text-white transition-colors w-full"
    >
      <Image
        src="/logout.png"
        alt=""
        width={20}
        height={20}
        className="opacity-80"
      />
      <span className="hidden lg:block">Logout</span>
    </button>
  );
};

export default LogoutButton;
