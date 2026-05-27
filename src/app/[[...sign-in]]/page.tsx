'use client';

import * as Clerk from '@clerk/elements/common';
import * as SignIn from '@clerk/elements/sign-in';
import { useUser } from '@clerk/nextjs';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

const LoginPage = () => {
  const { isLoaded, isSignedIn, user } = useUser();
  const router = useRouter();

  useEffect(() => {
    const role = user?.publicMetadata.role;
    if (role) {
      router.push(`/${role}`);
    }
  }, [user, router]);

  // Asteapta sa se incarce Clerk
  if (!isLoaded) return null;

  // Daca e deja autentificat, nu afisa formularul
  if (isSignedIn) return null;
  return (
    <div className="h-screen flex items-center justify-center relative overflow-hidden">
      {/* Blurred background */}
      <div
        className="absolute inset-0 bg-cover bg-center"
        style={{
          backgroundImage:
            "url('https://images.unsplash.com/photo-1562774053-701939374585?q=80&w=2086')",
          filter: 'blur(6px)',
          transform: 'scale(1.05)',
        }}
      />
      {/* Dark overlay */}
      <div className="absolute inset-0 bg-black/55" />

      {/* Content wrapper */}
      <div className="relative z-10 flex flex-col items-center gap-8 w-full max-w-md mx-4">
        {/* Welcome message and quote */}
        <div className="text-center text-white">
          <h1 className="text-3xl font-bold tracking-wide mb-2">
            Welcome to Academos
          </h1>
          <p className="text-white/70 text-sm italic">
            The beautiful thing about learning is that no one can take it away
            from you.
          </p>
          <p className="text-white/50 text-xs mt-1">— B.B. King</p>
        </div>

        {/* Login card */}
        <SignIn.Root>
          <SignIn.Step
            name="start"
            className="bg-white/10 backdrop-blur-md border border-white/20 p-8 rounded-2xl shadow-2xl flex flex-col gap-4 w-full"
          >
            {/* Logo and name */}
            <div className="flex items-center gap-3 mb-2">
              <Image
                src="/logo.png"
                alt="Academos logo"
                width={32}
                height={32}
              />
              <span className="text-white text-xl font-bold tracking-wide">
                Academos
              </span>
            </div>

            <p className="text-white/60 text-sm -mt-2">
              Sign in to your account
            </p>

            <Clerk.GlobalError className="text-sm text-red-400" />

            {/* Username field */}
            <Clerk.Field name="identifier" className="flex flex-col gap-1">
              <Clerk.Label className="text-xs text-white/70 font-medium">
                Username
              </Clerk.Label>
              <Clerk.Input
                type="text"
                required
                className="p-2.5 rounded-lg bg-white/10 border border-white/20 text-white placeholder-white/30 focus:outline-none focus:ring-2 focus:ring-white/40 text-sm"
              />
              <Clerk.FieldError className="text-xs text-red-400" />
            </Clerk.Field>

            {/* Password field */}
            <Clerk.Field name="password" className="flex flex-col gap-1">
              <Clerk.Label className="text-xs text-white/70 font-medium">
                Password
              </Clerk.Label>
              <Clerk.Input
                type="password"
                required
                className="p-2.5 rounded-lg bg-white/10 border border-white/20 text-white placeholder-white/30 focus:outline-none focus:ring-2 focus:ring-white/40 text-sm"
              />
              <Clerk.FieldError className="text-xs text-red-400" />
            </Clerk.Field>

            {/* Submit button */}
            <SignIn.Action
              submit
              className="bg-blue-500 hover:bg-blue-600 transition-colors text-white rounded-lg text-sm p-2.5 font-semibold mt-1"
            >
              Sign In
            </SignIn.Action>
          </SignIn.Step>
        </SignIn.Root>

        {/* Footer */}
        <p className="text-white/30 text-xs">
          © {new Date().getFullYear()} Academos. All rights reserved.
        </p>
      </div>
    </div>
  );
};

export default LoginPage;
