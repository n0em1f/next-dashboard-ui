import prisma from '@/lib/prisma';
import { auth, currentUser } from '@clerk/nextjs/server';
import Image from 'next/image';
import Link from 'next/link';

const ProfilePage = async () => {
  const { userId, sessionClaims } = await auth();
  const clerkUser = await currentUser();
  const role = (sessionClaims?.metadata as { role?: string })?.role || '';

  let userData: any = null;

  if (role === 'admin') {
    userData = await prisma.admin.findUnique({ where: { id: userId! } });
  } else if (role === 'teacher') {
    userData = await prisma.teacher.findUnique({
      where: { id: userId! },
      include: {
        subjects: { select: { name: true } },
        classes: { select: { name: true } },
        _count: { select: { lessons: true, subjects: true, classes: true } },
      },
    });
  } else if (role === 'student') {
    userData = await prisma.student.findUnique({
      where: { id: userId! },
      include: {
        class: { select: { name: true } },
        grade: { select: { level: true } },
        _count: { select: { attendance: true, results: true } },
      },
    });
  } else if (role === 'parent') {
    userData = await prisma.parent.findUnique({
      where: { id: userId! },
      include: {
        students: { select: { id: true, name: true, surname: true } },
      },
    });
  }

  // Date de contact — prioritate: unsafeMetadata (setate din Settings) > prisma > clerk
  const phone =
    (clerkUser?.unsafeMetadata?.phone as string) || userData?.phone || '-';
  const email =
    (clerkUser?.unsafeMetadata?.email as string) ||
    userData?.email ||
    clerkUser?.emailAddresses[0]?.emailAddress ||
    '-';
  const fullName = userData?.name
    ? `${userData.name} ${userData.surname}`
    : `${clerkUser?.firstName || ''} ${clerkUser?.lastName || ''}`;

  return (
    <div className="p-6 flex flex-col items-center">
      <div className="w-full max-w-4xl flex flex-col gap-6">
        <h1 className="text-2xl font-bold text-white">My Profile</h1>

        <div className="bg-white/80 backdrop-blur-sm rounded-2xl overflow-hidden">
          {/* Header */}
          <div className="bg-gradient-to-r from-blue-500 to-blue-600 p-8 flex items-center gap-6">
            <div className="w-24 h-24 rounded-full overflow-hidden border-4 border-white shadow-lg flex-shrink-0">
              <Image
                src={userData?.img || clerkUser?.imageUrl || '/noAvatar.png'}
                alt="Profile"
                width={96}
                height={96}
                className="w-full h-full object-cover"
              />
            </div>
            <div className="text-white">
              <h2 className="text-2xl font-bold">{fullName}</h2>
              <p className="text-blue-100 capitalize mt-1">{role}</p>
              <p className="text-blue-200 text-sm mt-0.5">
                @{userData?.username || clerkUser?.username}
              </p>
            </div>
            <div className="ml-auto">
              <Link
                href="/settings"
                className="bg-white/20 hover:bg-white/30 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
              >
                Edit Profile
              </Link>
            </div>
          </div>

          {/* Info */}
          <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Contact Info */}
            <div>
              <h3 className="font-bold text-gray-800 mb-4">
                Contact Information
              </h3>
              <div className="flex flex-col gap-3">
                <div className="p-4 bg-gray-50 rounded-lg">
                  <p className="text-xs text-gray-400">Email</p>
                  <p className="text-sm font-medium text-gray-800">{email}</p>
                </div>
                <div className="p-4 bg-gray-50 rounded-lg">
                  <p className="text-xs text-gray-400">Phone</p>
                  <p className="text-sm font-medium text-gray-800">{phone}</p>
                </div>
                {userData?.address && (
                  <div className="p-4 bg-gray-50 rounded-lg">
                    <p className="text-xs text-gray-400">Address</p>
                    <p className="text-sm font-medium text-gray-800">
                      {userData.address}
                    </p>
                  </div>
                )}
                {userData?.birthday && (
                  <div className="p-4 bg-gray-50 rounded-lg">
                    <p className="text-xs text-gray-400">Birthday</p>
                    <p className="text-sm font-medium text-gray-800">
                      {new Intl.DateTimeFormat('en-GB').format(
                        new Date(userData.birthday),
                      )}
                    </p>
                  </div>
                )}
                {userData?.bloodType && (
                  <div className="p-4 bg-gray-50 rounded-lg">
                    <p className="text-xs text-gray-400">Blood Type</p>
                    <p className="text-sm font-medium text-gray-800">
                      {userData.bloodType}
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Role-specific Info */}
            <div>
              <h3 className="font-bold text-gray-800 mb-4">
                {role === 'teacher'
                  ? 'Teaching Info'
                  : role === 'student'
                    ? 'Academic Info'
                    : role === 'parent'
                      ? 'Children'
                      : 'Admin Info'}
              </h3>

              {role === 'teacher' && userData && (
                <div className="flex flex-col gap-3">
                  <div className="grid grid-cols-3 gap-3">
                    <StatCard
                      value={userData._count.subjects}
                      label="Subjects"
                      color="blue"
                    />
                    <StatCard
                      value={userData._count.lessons}
                      label="Lessons"
                      color="green"
                    />
                    <StatCard
                      value={userData._count.classes}
                      label="Classes"
                      color="purple"
                    />
                  </div>
                  {userData.subjects?.length > 0 && (
                    <div className="mt-2">
                      <p className="text-xs text-gray-500 mb-2">Subjects:</p>
                      <div className="flex flex-wrap gap-2">
                        {userData.subjects.map((s: { name: string }) => (
                          <span
                            key={s.name}
                            className="bg-blue-100 text-blue-700 text-xs px-2 py-1 rounded-full"
                          >
                            {s.name}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {role === 'student' && userData && (
                <div className="flex flex-col gap-3">
                  <div className="grid grid-cols-2 gap-3">
                    <StatCard
                      value={userData.class?.name || '-'}
                      label="Class"
                      color="blue"
                    />
                    <StatCard
                      value={`Grade ${userData.grade?.level || '-'}`}
                      label="Grade"
                      color="green"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <StatCard
                      value={userData._count.results}
                      label="Results"
                      color="purple"
                    />
                    <StatCard
                      value={userData._count.attendance}
                      label="Attendance"
                      color="amber"
                    />
                  </div>
                </div>
              )}

              {role === 'parent' && userData && (
                <div className="flex flex-col gap-3">
                  <p className="text-xs text-gray-500">Your children:</p>
                  {userData.students.map(
                    (s: { id: string; name: string; surname: string }) => (
                      <Link
                        key={s.id}
                        href={`/list/students/${s.id}`}
                        className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                      >
                        <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-bold text-xs">
                          {s.name[0]}
                          {s.surname[0]}
                        </div>
                        <span className="text-sm font-medium text-gray-800">
                          {s.name} {s.surname}
                        </span>
                      </Link>
                    ),
                  )}
                </div>
              )}

              {role === 'admin' && (
                <div className="flex items-center gap-3 p-3 bg-blue-50 rounded-lg">
                  <div className="w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center text-white text-xs font-bold">
                    A
                  </div>
                  <span className="text-sm font-medium text-gray-800">
                    System Administrator
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const StatCard = ({
  value,
  label,
  color,
}: {
  value: string | number;
  label: string;
  color: string;
}) => {
  const colors: { [key: string]: string } = {
    blue: 'bg-blue-50 text-blue-700',
    green: 'bg-green-50 text-green-700',
    purple: 'bg-purple-50 text-purple-700',
    amber: 'bg-amber-50 text-amber-700',
  };
  return (
    <div className={`${colors[color]} rounded-lg p-3 text-center`}>
      <p className="text-lg font-bold">{value}</p>
      <p className="text-xs mt-0.5 opacity-80">{label}</p>
    </div>
  );
};

export default ProfilePage;
